import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  SPHERE3D, SPHERE, FLAT, ease, bezier3, vertexKey, vertexControlMap, computeFaceT, NUM_FACES, SUB_BARY,
} from '@/utils/icosahedron-geometry';

import {
  PopulationBuffers, PopulationSample, buildPopulationBuffers, updatePopulationPositions, createPopulationPoints,
} from '@/utils/population-layer';

import {
  createFaceMaterials, applyFaceSphereAttribute,
  type BaseLayerMode, type FaceMaterialsOptions,
} from '@/utils/face-materials';


// ──────────────────────────── CONFIGURATION ────────────────────────────
const ANIMATION_SPEED: number = 0.05;
const STAGGER_RATIO: number = 0.0;       // 0 = fully synchronised

interface AnimState {
  t: number;
  tgt: number;
  drag: boolean;
  lastMouse: { x: number; y: number } | null;
  frameId: number;
}

interface IcosahedronGlobeProps {
  width?: number;
  height?: number;
  unfolded?: boolean;
  onToggle?: (unfolded: boolean) => void;
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
  unfolded = false,
  onToggle,
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
    t: 0,
    tgt: unfolded ? 1 : 0,
    drag: false,
    lastMouse: null,
    frameId: 0,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const populationBuffersRef = useRef<PopulationBuffers | null>(null);
  const populationPointsRef = useRef<THREE.Points | null>(null);

  const toggle = useCallback(() => {
    animRef.current.tgt = animRef.current.tgt === 0 ? 1 : 0;
    onToggle?.(animRef.current.tgt === 1);
  }, [onToggle]);

  const updateGeometry = useCallback((globalT: number) => {
    const meshes = meshesRef.current;
    const wires = wiresRef.current;
    if (!meshes.length) return;

    SPHERE3D.forEach((_, fi: number) => {
      const faceT = computeFaceT(globalT, fi, NUM_FACES, STAGGER_RATIO);
      const et = ease(faceT);

      // Resolve the 3 corner bezier endpoints and control points once per face.
      // Sub-vertices are barycentric blends of these — no extra map lookups needed.
      const corners = ([0, 1, 2] as const).map((i) => {
        const sphere = SPHERE[fi][i];
        const flat   = FLAT[fi][i];
        const cp = vertexControlMap.get(vertexKey(sphere));
        if (!cp) throw new Error(`Control point not found for face ${fi} vertex ${i}`);
        return { sphere, flat, cp };
      });

      // ── Mesh: 12 sub-vertices (4 subdivided triangles, non-indexed) ──
      // Each sub-vertex position is the bezier of its barycentric-blended
      // sphere/flat/control points. The blend is linear so the sub-vertex
      // rides exactly the same curved path as if it were an original corner.
      const posArray = meshes[fi].geometry.attributes.position.array as Float32Array;

      SUB_BARY.forEach(([w0, w1, w2], i) => {
        const spherePos = new THREE.Vector3(
          w0 * corners[0].sphere.x + w1 * corners[1].sphere.x + w2 * corners[2].sphere.x,
          w0 * corners[0].sphere.y + w1 * corners[1].sphere.y + w2 * corners[2].sphere.y,
          w0 * corners[0].sphere.z + w1 * corners[1].sphere.z + w2 * corners[2].sphere.z,
        );
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
        const v = bezier3(spherePos, flatPos, cpPos, et);
        posArray[i * 3]     = v.x;
        posArray[i * 3 + 1] = v.y;
        posArray[i * 3 + 2] = v.z;
      });

      meshes[fi].geometry.attributes.position.needsUpdate = true;

      // ── Wire: 3 original corners only (outer triangle outline) ───────
      // The wireframe shows the face boundary, which is defined by the
      // original corners — subdivision doesn't change the outer edges.
      const wPosArray = wires[fi].geometry.attributes.position.array as Float32Array;
      ([0, 1, 2] as const).forEach((i) => {
        const v = bezier3(corners[i].sphere, corners[i].flat, corners[i].cp, et);
        wPosArray[i * 3]     = v.x;
        wPosArray[i * 3 + 1] = v.y;
        wPosArray[i * 3 + 2] = v.z;
      });
      wires[fi].geometry.attributes.position.needsUpdate = true;
    });

    const buffers = populationBuffersRef.current;
    const points = populationPointsRef.current;
    if (buffers && points) {
      updatePopulationPositions(buffers, globalT, STAGGER_RATIO, NUM_FACES);
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
      // ── Mesh geometry: 12 sub-vertices = 4 sub-triangles, non-indexed ──
      // Float32Array(36): 12 vertices × 3 floats each.
      // aSpherePos is Float32Array(36): 12 vertices × 3 floats, set by applyFaceSphereAttribute.
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(36), 3));
      applyFaceSphereAttribute(geo, fi);
      const mesh = new THREE.Mesh(geo, faceMaterials[fi]);
      mesh.renderOrder = 0;
      grp.add(mesh);
      meshes.push(mesh);

      // ── Wire geometry: 3 original corners, indexed outline ────────────
      // Unchanged from before — wireframe traces the outer triangle only.
      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      wg.setIndex([0, 1, 1, 2, 2, 0]);
      const wire = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
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
      if (!animRef.current.drag) toggle();
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
  }, [width, height, toggle, updateGeometry]);

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
        animRef.current.t = Math.max(0, Math.min(1, newT));
      } else if (t !== tgt) {
        animRef.current.t = tgt;
      }

      updateGeometry(animRef.current.t);

      if (!drag && groupRef.current) {
        if (animRef.current.tgt === 0 && animRef.current.t < 0.05) {
          groupRef.current.rotation.y += 0.004;
        } else if (animRef.current.tgt === 1) {
          const progress = animRef.current.t;
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
    animRef.current.tgt = unfolded ? 1 : 0;
  }, [unfolded]);

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