import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  SPHERE3D, SPHERE, FLAT, ease, bezier3, vertexKey, vertexControlMap, computeFaceT, NUM_FACES, SUB_BARY,
  GLOBE_STAGES, SEGMENT_COUNT, resolveSegment,
} from '@/utils/icosahedron-geometry';

import {
  PopulationBuffers, PopulationSample, buildPopulationBuffers, updatePopulationPositions, createPopulationPoints,
} from '@/utils/population-layer';

import {
  createFaceMaterials, applyFaceSphereAttribute,
  type BaseLayerMode, type FaceMaterialsOptions,
} from '@/utils/face-materials';


// ──────────────────────────── CONFIGURATION ────────────────────────────
const ANIMATION_SPEED: number = 0.05;    // per-frame step across the 0..SEGMENT_COUNT range
const STAGGER_RATIO: number = 0.0;       // 0 = fully synchronised
const WIRE_MAX_OPACITY: number = 0.35;   // triangulation-line opacity once fully faded in

/**
 * Icosahedral wireframe opacity as a function of overall stage position.
 * Fades in across stage 0 -> 1 (sphere -> sphere+triangulation), then stays
 * visible through the icosahedron and dymaxion stages. Corners never move
 * during the fade (they're already unit-length), so this is purely a
 * material property, not a geometry change. Retune freely — e.g. return to
 * 0 past ICOSAHEDRON if you don't want grid lines on the flat map.
 */
function computeWireOpacity(globalStageT: number): number {
  if (globalStageT <= GLOBE_STAGES.SPHERE_TRIANGULATED) {
    return ease(Math.max(0, Math.min(1, globalStageT))) * WIRE_MAX_OPACITY;
  }
  return WIRE_MAX_OPACITY;
}

interface AnimState {
  t: number;    // current stage position, 0..SEGMENT_COUNT (continuous, supports scrubbing)
  tgt: number;  // target stage position, 0..SEGMENT_COUNT
  drag: boolean;
  lastMouse: { x: number; y: number } | null;
  frameId: number;
}

interface IcosahedronGlobeProps {
  width?: number;
  height?: number;
  /** 0=sphere, 1=sphere+triangulation, 2=icosahedron, 3=dymaxion. Fractional values are valid (for scrubbing). */
  stage?: number;
  onStageChange?: (stage: number) => void;
  className?: string;
  style?: React.CSSProperties;
  populationSamples?: PopulationSample[];
  showPopulation?: boolean;
  populationColor?: string;
  populationSize?: number;
  populationOpacity?: number;
  baseLayer?: FaceMaterialsOptions;
}

const IcosahedronGlobe: React.FC<IcosahedronGlobeProps> = ({
  width,
  height,
  stage = GLOBE_STAGES.SPHERE,
  onStageChange,
  className,
  style,
  populationSamples,
  showPopulation = true,
  populationColor,
  populationSize,
  populationOpacity,
  baseLayer = { mode: 'debug' },
  ...canvasProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const wiresRef = useRef<THREE.LineSegments[]>([]);
  const animRef = useRef<AnimState>({
    t: stage,
    tgt: stage,
    drag: false,
    lastMouse: null,
    frameId: 0,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const populationBuffersRef = useRef<PopulationBuffers | null>(null);
  const populationPointsRef = useRef<THREE.Points | null>(null);

  const updateGeometry = useCallback((globalStageT: number) => {
    const meshes = meshesRef.current;
    const wires = wiresRef.current;
    if (!meshes.length) return;

    const { segment, localT } = resolveSegment(globalStageT);
    const wireOpacity = computeWireOpacity(globalStageT);

    SPHERE3D.forEach((_, fi: number) => {
      const faceT = computeFaceT(localT, fi, NUM_FACES, STAGGER_RATIO);
      const et = ease(faceT);

      // Resolve the 3 corner endpoints once per face. Flat/control corners
      // are only *used* in segment 2, but fetching them is cheap and keeps
      // this branch-free.
      const corners = ([0, 1, 2] as const).map((i) => {
        const sphere = SPHERE[fi][i];
        const flat = FLAT[fi][i];
        const cp = vertexControlMap.get(vertexKey(sphere));
        if (!cp) throw new Error(`Control point not found for face ${fi} vertex ${i}`);
        return { sphere, flat, cp };
      });

      // ── Mesh: 12 sub-vertices (4 subdivided triangles, non-indexed) ──
      const posArray = meshes[fi].geometry.attributes.position.array as Float32Array;

      SUB_BARY.forEach(([w0, w1, w2], i) => {
        // Barycentric blend of the raw sphere corners — this is the same
        // planar/"faceted" point the old code always used as its t=0 target.
        const facetPos = new THREE.Vector3(
          w0 * corners[0].sphere.x + w1 * corners[1].sphere.x + w2 * corners[2].sphere.x,
          w0 * corners[0].sphere.y + w1 * corners[1].sphere.y + w2 * corners[2].sphere.y,
          w0 * corners[0].sphere.z + w1 * corners[1].sphere.z + w2 * corners[2].sphere.z,
        );

        let v: THREE.Vector3;

        if (segment === 0) {
          // Stage 0 -> 1: geometry doesn't move; always the fully-smooth sphere.
          v = facetPos.clone().normalize();
        } else if (segment === 1) {
          // Stage 1 -> 2: smooth sphere inflates outward into flat facets.
          // Corners are already unit-length so only interior sub-vertices move.
          const smoothPos = facetPos.clone().normalize();
          v = smoothPos.lerp(facetPos, et);
        } else {
          // Stage 2 -> 3: original icosahedron -> dymaxion fold, unchanged.
          const flatPos = new THREE.Vector3(
            w0 * corners[0].flat.x + w1 * corners[1].flat.x + w2 * corners[2].flat.x,
            w0 * corners[0].flat.y + w1 * corners[1].flat.y + w2 * corners[2].flat.y,
            w0 * corners[0].flat.z + w1 * corners[1].flat.z + w2 * corners[2].flat.z,
          );
          const cpPos = new THREE.Vector3(
            w0 * corners[0].cp.x + w1 * corners[1].cp.x + w2 * corners[2].cp.x,
            w0 * corners[0].cp.y + w1 * corners[1].cp.y + w2 * corners[2].cp.y,
            w0 * corners[0].cp.z + w1 * corners[1].cp.z + w2 * corners[2].cp.z,
          );
          v = bezier3(facetPos, flatPos, cpPos, et);
        }

        posArray[i * 3] = v.x;
        posArray[i * 3 + 1] = v.y;
        posArray[i * 3 + 2] = v.z;
      });

      meshes[fi].geometry.attributes.position.needsUpdate = true;

      // ── Wire: 3 original corners only ─────────────────────────────
      // Static through segments 0-1 (corners are identical for smooth
      // sphere and icosahedron); bezier-folds through segment 2 as before.
      const wPosArray = wires[fi].geometry.attributes.position.array as Float32Array;
      ([0, 1, 2] as const).forEach((i) => {
        const v = segment < 2
          ? corners[i].sphere
          : bezier3(corners[i].sphere, corners[i].flat, corners[i].cp, et);
        wPosArray[i * 3] = v.x;
        wPosArray[i * 3 + 1] = v.y;
        wPosArray[i * 3 + 2] = v.z;
      });
      wires[fi].geometry.attributes.position.needsUpdate = true;

      const wireMat = wires[fi].material as THREE.LineBasicMaterial;
      wireMat.opacity = wireOpacity;
      wires[fi].visible = wireOpacity > 0.001;
    });

    const buffers = populationBuffersRef.current;
    const points = populationPointsRef.current;
    if (buffers && points) {
      // NOTE: population-layer.ts needs its own segment-aware branch mirroring
      // the mesh logic above (smooth-normalize / lerp / bezier3 by segment).
      // Passing globalStageT straight through is a placeholder until that's
      // updated to match — see accompanying notes for population-layer.ts.
      updatePopulationPositions(buffers, globalStageT, STAGGER_RATIO, NUM_FACES);
      (points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }, []);

  // Handle responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const w = width || rect.width;
      const h = height || rect.height;

      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (rendererRef.current) {
        rendererRef.current.setSize(w, h, false);
      }

      if (cameraRef.current) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [width, height]);

  // Initialise Three.js once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
    camera.position.set(0, 0, 4.2);
    cameraRef.current = camera;

    const grp = new THREE.Group();
    scene.add(grp);
    groupRef.current = grp;

    const faceMaterials = createFaceMaterials(baseLayer);

    const meshes: THREE.Mesh[] = [];
    const wires: THREE.LineSegments[] = [];
    SPHERE3D.forEach((_, fi: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SUB_BARY.length * 3), 3));
      applyFaceSphereAttribute(geo, fi);
      const mesh = new THREE.Mesh(geo, faceMaterials[fi]);
      mesh.renderOrder = 0;
      grp.add(mesh);
      meshes.push(mesh);

      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      wg.setIndex([0, 1, 1, 2, 2, 0]);
      const wire = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,   // ← TEMP
      }));
      wire.visible = false;
      grp.add(wire);
      wires.push(wire);
    });
    meshesRef.current = meshes;
    wiresRef.current = wires;

    updateGeometry(animRef.current.tgt);

    const onMouseDown = (e: MouseEvent) => {
      animRef.current.lastMouse = { x: e.clientX, y: e.clientY };
      animRef.current.drag = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      const { lastMouse } = animRef.current;
      if (!lastMouse) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) animRef.current.drag = true;
      if (animRef.current.drag && groupRef.current) {
        groupRef.current.rotation.y += dx * 0.007;
        groupRef.current.rotation.x += dy * 0.007;
        animRef.current.lastMouse = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => {
      // Click-to-toggle stays disabled — stage is fully controlled by the
      // parent via the `stage` prop (see the `useEffect` below).
      animRef.current.lastMouse = null;
      animRef.current.drag = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animRef.current.frameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      populationPointsRef.current?.geometry.dispose();
      (populationPointsRef.current?.material as THREE.Material | undefined)?.dispose();
      meshesRef.current.forEach(m => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      renderer.dispose();
      scene.clear();
    };
  }, [width, height, updateGeometry]);

  // Hot-swap materials when baseLayer prop changes (e.g., texture finishes loading)
  useEffect(() => {
    if (!meshesRef.current.length) return;
    const newMaterials = createFaceMaterials(baseLayer);
    meshesRef.current.forEach((mesh, fi) => {
      (mesh.material as THREE.Material).dispose();
      mesh.material = newMaterials[fi];
    });
  }, [baseLayer]);

  // Build (or rebuild) the population layer whenever the sample set changes
  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;

    if (populationPointsRef.current) {
      grp.remove(populationPointsRef.current);
      populationPointsRef.current.geometry.dispose();
      (populationPointsRef.current.material as THREE.Material).dispose();
      populationPointsRef.current = null;
      populationBuffersRef.current = null;
    }

    if (populationSamples && populationSamples.length > 0) {
      const buffers = buildPopulationBuffers(populationSamples);
      updatePopulationPositions(buffers, animRef.current.t, STAGGER_RATIO, NUM_FACES);
      const points = createPopulationPoints(buffers, {
        color: populationColor,
        size: populationSize,
        opacity: populationOpacity,
      });
      points.visible = showPopulation;
      grp.add(points);
      populationBuffersRef.current = buffers;
      populationPointsRef.current = points;
    }
  }, [populationSamples]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle visibility independently of fold state
  useEffect(() => {
    if (populationPointsRef.current) populationPointsRef.current.visible = showPopulation;
  }, [showPopulation]);

  // Animation loop
  useEffect(() => {
    const loop = (): void => {
      const { t, tgt, drag } = animRef.current;
      if (Math.abs(t - tgt) > 0.0005) {
        const newT = t + (tgt > t ? ANIMATION_SPEED : -ANIMATION_SPEED);
        animRef.current.t = Math.max(0, Math.min(SEGMENT_COUNT, newT));
      } else if (t !== tgt) {
        animRef.current.t = tgt;
      }

      updateGeometry(animRef.current.t);

      if (!drag && groupRef.current) {
        if (animRef.current.tgt === GLOBE_STAGES.SPHERE && animRef.current.t < 0.05) {
          groupRef.current.rotation.y += 0.004;
        } else if (animRef.current.tgt === GLOBE_STAGES.DYMAXION) {
          const progress = animRef.current.t / SEGMENT_COUNT;
          const damping = 0.02 + progress * 0.06;
          groupRef.current.rotation.x += (-0.04 - groupRef.current.rotation.x) * damping;
          groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * damping;
        }
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      animRef.current.frameId = requestAnimationFrame(loop);
    };

    animRef.current.frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current.frameId);
  }, [updateGeometry]);

  useEffect(() => {
    animRef.current.tgt = stage;
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'block',
          cursor: 'grab',
          background: 'transparent',
          border: '1px solid white',
          width: '100%',
          height: '100%',
          ...style,
        }}
        {...canvasProps}
      />
    </div>
  );
};

export default IcosahedronGlobe;
export { GLOBE_STAGES };