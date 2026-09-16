import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  SPHERE3D, SPHERE, FLAT, ease, bezier3, vertexKey, vertexControlMap, computeFaceT, NUM_FACES, SUB_BARY,
  GLOBE_STAGES, SEGMENT_COUNT, resolveSegment,
} from '@/utils/icosahedron-geometry';

import {
  OverlayBuffers, OverlaySample, buildOverlayBuffers, updateOverlayPositions, createOverlayPoints,
} from '@/utils/overlay-layer';

import {
  createFaceMaterials, applyFaceSphereAttribute,
  type BaseLayerMode, type FaceMaterialsOptions,
} from '@/utils/face-materials';

// ──────────────────────────── CONFIGURATION ────────────────────────────

/** Interpolation speed per frame toward the target stage (0..3). */
const ANIMATION_SPEED: number = 0.03;

/** Fold animation delay across faces: 0 = lockstep movement, >0 = wave/cascade across faces. */
const STAGGER_RATIO: number = 0.0;

/** Wireframe draw-in stagger ratio across faces during stage 0 -> 1. */
const WIRE_STAGGER_RATIO: number = 0.5;

/** Maximum target opacity of wireframe lines once drawn. */
const WIRE_MAX_OPACITY: number = 0.35;

/**
 * Speed at which wireframe lines fade out after settling at stage 3 (DYMAXION).
 * State-driven (advances only when t === tgt === 3); scrub-back resets this instantly.
 */
const WIRE_POST_FADE_SPEED: number = 0.015;

// ── CUSTOM SHADERS FOR HAND-DRAWN WIREFRAME ────────────────────────────

/**
 * Vertex shader for wireframe edges.
 * Receives `lineProgress` (0 at start vertex, 1 at end vertex) and adds
 * subtle spatial jitter via sine/cosine trigonometric noise to simulate hand strokes.
 */
const WIRE_VERTEX_SHADER = `
  attribute float lineProgress;
  varying float vProgress;

  void main() {
    vProgress = lineProgress;
    vec3 pos = position;

    // High-frequency trigonometric perturbation for sketchy/hand-drawn line variation
    pos += vec3(
      sin(pos.y * 30.0 + pos.z * 20.0) * 0.0015,
      cos(pos.x * 30.0 + pos.z * 20.0) * 0.0015,
      sin(pos.x * 20.0 + pos.y * 30.0) * 0.0015
    );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/**
 * Fragment shader for wireframe edges.
 * Uses `vProgress` and `uProgress` to trim lines, creating a progressive drawing animation.
 * Smoothstep feathering creates a soft tapered pencil/pen stroke tip.
 *
 * Note: `smoothstep(a, b, x)` in GLSL is undefined when a > b. To get a
 * reversed ramp for the "tip fade", we negate the input instead of swapping
 * edges — this keeps the edge order valid on all drivers.
 */
const WIRE_FRAGMENT_SHADER = `
  uniform float uProgress;
  uniform float uMaxOpacity;
  uniform vec3 uColor;
  varying float vProgress;

  void main() {
    // Discard fragments beyond current animation threshold
    if (vProgress > uProgress || uProgress <= 0.001) discard;

    // Smooth stroke tip attenuation (taper effect at edge of drawing boundary).
    // Fades opacity from 1 -> 0 as vProgress approaches uProgress from below.
    float tipFade = smoothstep(0.0, 0.15, uProgress - vProgress);
    gl_FragColor = vec4(uColor, uMaxOpacity * tipFade);
  }
`;

// ── TYPES & INTERFACES ──────────────────────────────────────────────────

/** Internal animation state mutated directly within requestAnimationFrame loops to bypass React renders. */
interface AnimState {
  /** Current fractional stage position [0..SEGMENT_COUNT]. */
  t: number;
  /** Target stage position [0..SEGMENT_COUNT]. */
  tgt: number;
  /** Whether the user is actively dragging to rotate the globe. */
  drag: boolean;
  /** Previous mouse position recorded during drag. */
  lastMouse: { x: number; y: number } | null;
  /** Current requestAnimationFrame tick handle for cleanup. */
  frameId: number;
  /**
   * Post-fold fade progress (0 = visible, 1 = faded).
   * Advances only while settled at stage 3 (DYMAXION). Resets to 0 when leaving.
   */
  wirePostFadeT: number;
}

interface IcosahedronGlobeProps {
  width?: number;
  height?: number;
  /** Target globe stage: 0=sphere, 1=triangulated sphere, 2=icosahedron, 3=dymaxion. Fractional values supported. */
  stage?: number;
  onStageChange?: (stage: number) => void;
  className?: string;
  style?: React.CSSProperties;
  overlaySamples?: OverlaySample[];
  showOverlay?: boolean;
  overlayColor?: string;
  overlaySize?: number;
  overlayOpacity?: number;
  baseLayer?: FaceMaterialsOptions;
}

// ──────────────────────────── COMPONENT ────────────────────────────

const IcosahedronGlobe: React.FC<IcosahedronGlobeProps> = ({
  width,
  height,
  stage = GLOBE_STAGES.SPHERE,
  onStageChange,
  className,
  style,
  overlaySamples,
  showOverlay = true,
  overlayColor,
  overlaySize,
  overlayOpacity,
  baseLayer = { mode: 'debug' },
  ...canvasProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const wiresRef = useRef<THREE.LineSegments[]>([]);

  // Mutable animation state container to avoid react re-renders on every frame
  const animRef = useRef<AnimState>({
    t: stage,
    tgt: stage,
    drag: false,
    lastMouse: null,
    frameId: 0,
    wirePostFadeT: 0,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const overlayBuffersRef = useRef<OverlayBuffers | null>(null);
  const overlayPointsRef = useRef<THREE.Points | null>(null);

  /**
   * Core frame update function. Evaluates the current global animation stage (0..3),
   * morphs mesh sub-vertices, updates wireframe endpoints, and updates shader uniforms.
   */
  const updateGeometry = useCallback((globalStageT: number) => {
    const meshes = meshesRef.current;
    const wires = wiresRef.current;
    if (!meshes.length) return;

    // Resolve continuous stage into active segment index (0, 1, or 2) and local [0..1] stage transition progress
    const { segment, localT } = resolveSegment(globalStageT);
    const fadeT = Math.max(0, Math.min(1, globalStageT));
    const wirePostFade = animRef.current.wirePostFadeT;

    SPHERE3D.forEach((_, fi: number) => {
      const faceT = computeFaceT(localT, fi, NUM_FACES, STAGGER_RATIO);
      const et = ease(faceT);

      // Extract raw 3D spherical, flat 2D net, and bezier control points for the 3 face corners
      const corners = ([0, 1, 2] as const).map((i) => {
        const sphere = SPHERE[fi][i];
        const flat = FLAT[fi][i];
        const cp = vertexControlMap.get(vertexKey(sphere));
        if (!cp) throw new Error(`Control point not found for face ${fi} vertex ${i}`);
        return { sphere, flat, cp };
      });

      // ── UPDATE SUBDIVIDED MESH GEOMETRY ────────────────────────────
      const posArray = meshes[fi].geometry.attributes.position.array as Float32Array;

      SUB_BARY.forEach(([w0, w1, w2], i) => {
        // Linear barycentric interpolation across face corner positions
        const facetPos = new THREE.Vector3(
          w0 * corners[0].sphere.x + w1 * corners[1].sphere.x + w2 * corners[2].sphere.x,
          w0 * corners[0].sphere.y + w1 * corners[1].sphere.y + w2 * corners[2].sphere.y,
          w0 * corners[0].sphere.z + w1 * corners[1].sphere.z + w2 * corners[2].sphere.z,
        );

        let v: THREE.Vector3;
        if (segment === 0) {
          // Stage 0 -> 1: Standard smooth unit sphere surface
          v = facetPos.clone().normalize();
        } else if (segment === 1) {
          // Stage 1 -> 2: Smooth sphere morphs into faceted icosahedron geometry
          const smoothPos = facetPos.clone().normalize();
          v = smoothPos.lerp(facetPos, et);
        } else {
          // Stage 2 -> 3: Quadratic Bezier transformation from 3D icosahedron to flat 2D Dymaxion net
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

      // ── UPDATE WIREFRAME LINE ENDPOINTS ────────────────────────────
      // Unrolled into 6 explicit vertices (3 line segments [0-1, 1-2, 2-0]) to support continuous GLSL stroke drawing
      const wPosArray = wires[fi].geometry.attributes.position.array as Float32Array;
      const currentPts = ([0, 1, 2] as const).map((i) =>
        segment < 2
          ? corners[i].sphere
          : bezier3(corners[i].sphere, corners[i].flat, corners[i].cp, et)
      );

      const pairs = [[0, 1], [1, 2], [2, 0]];
      pairs.forEach(([a, b], idx) => {
        wPosArray[idx * 6 + 0] = currentPts[a].x;
        wPosArray[idx * 6 + 1] = currentPts[a].y;
        wPosArray[idx * 6 + 2] = currentPts[a].z;
        wPosArray[idx * 6 + 3] = currentPts[b].x;
        wPosArray[idx * 6 + 4] = currentPts[b].y;
        wPosArray[idx * 6 + 5] = currentPts[b].z;
      });
      wires[fi].geometry.attributes.position.needsUpdate = true;

      // ── UPDATE HAND-DRAWN SHADER UNIFORMS ──────────────────────────
      // drawProgress drives the GLSL stroke length; the post-fold fade term
      // (1 - wirePostFade) reverses the draw back to zero once settled at stage 3.
      const wireT = computeFaceT(fadeT, fi, NUM_FACES, WIRE_STAGGER_RATIO);
      const drawProgress = ease(wireT) * (1 - wirePostFade);

      const wireMat = wires[fi].material as THREE.ShaderMaterial;
      wireMat.uniforms.uProgress.value = drawProgress;
      wires[fi].visible = drawProgress > 0.001;
    });

    // ── UPDATE DATA OVERLAY POINTS (IF ACTIVE) ──────────────────────
    const buffers = overlayBuffersRef.current;
    const points = overlayPointsRef.current;
    if (buffers && points) {
      updateOverlayPositions(buffers, globalStageT, STAGGER_RATIO, NUM_FACES);
      (points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }, []);

  // Responsive resize handler listening to parent container dimensions
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

      if (rendererRef.current) rendererRef.current.setSize(w, h, false);
      if (cameraRef.current) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Primary WebGL Scene, Camera, Geometry & Material initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    // Scene & Camera setup
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

    // Construct 20 icosahedron face meshes & corresponding wireframe overlays
    SPHERE3D.forEach((_, fi: number) => {
      // 1. Solid face mesh
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SUB_BARY.length * 3), 3));
      applyFaceSphereAttribute(geo, fi);
      const mesh = new THREE.Mesh(geo, faceMaterials[fi]);
      mesh.renderOrder = 0;
      grp.add(mesh);
      meshes.push(mesh);

      // 2. Wireframe line geometry (6 non-indexed vertices per triangle)
      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3));
      // Attribute mapping line start (0.0) -> line end (1.0) for every segment
      wg.setAttribute('lineProgress', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 1, 0, 1]), 1));

      const wireMaterial = new THREE.ShaderMaterial({
        vertexShader: WIRE_VERTEX_SHADER,
        fragmentShader: WIRE_FRAGMENT_SHADER,
        uniforms: {
          uProgress: { value: 0 },
          uMaxOpacity: { value: WIRE_MAX_OPACITY },
          uColor: { value: new THREE.Color(0xffffff) },
        },
        transparent: true,
        depthTest: false, // ← TEMP
      });

      const wire = new THREE.LineSegments(wg, wireMaterial);
      wire.visible = false;
      grp.add(wire);
      wires.push(wire);
    });

    meshesRef.current = meshes;
    wiresRef.current = wires;

    updateGeometry(animRef.current.tgt);

    // Mouse drag rotation listeners
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

    // Teardown WebGL memory references on unmount
    return () => {
      cancelAnimationFrame(animRef.current.frameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      overlayPointsRef.current?.geometry.dispose();
      (overlayPointsRef.current?.material as THREE.Material | undefined)?.dispose();
      meshesRef.current.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      wiresRef.current.forEach((w) => {
        w.geometry.dispose();
        (w.material as THREE.Material).dispose();
      });
      renderer.dispose();
      scene.clear();
    };
  }, [width, height, updateGeometry]);

  // Hot-swap face materials when baseLayer configuration changes
  useEffect(() => {
    if (!meshesRef.current.length) return;
    const newMaterials = createFaceMaterials(baseLayer);
    meshesRef.current.forEach((mesh, fi) => {
      (mesh.material as THREE.Material).dispose();
      mesh.material = newMaterials[fi];
    });
  }, [baseLayer]);

  // Rebuild point overlay buffers when overlay samples are updated
  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;

    if (overlayPointsRef.current) {
      grp.remove(overlayPointsRef.current);
      overlayPointsRef.current.geometry.dispose();
      (overlayPointsRef.current.material as THREE.Material).dispose();
      overlayPointsRef.current = null;
      overlayBuffersRef.current = null;
    }

    if (overlaySamples && overlaySamples.length > 0) {
      const buffers = buildOverlayBuffers(overlaySamples);
      updateOverlayPositions(buffers, animRef.current.t, STAGGER_RATIO, NUM_FACES);
      const points = createOverlayPoints(buffers, {
        color: overlayColor,
        size: overlaySize,
        opacity: overlayOpacity,
      });
      points.visible = showOverlay;
      grp.add(points);
      overlayBuffersRef.current = buffers;
      overlayPointsRef.current = points;
    }
  }, [overlaySamples]); // eslint-disable-line react-hooks/exhaustive-deps

  // Direct toggle for overlay visibility without triggering re-initialization
  useEffect(() => {
    if (overlayPointsRef.current) overlayPointsRef.current.visible = showOverlay;
  }, [showOverlay]);

  // Main render loop handling interpolation, idle rotation, and post-fold wire fade
  useEffect(() => {
    const loop = (): void => {
      const { t, tgt, drag } = animRef.current;

      // Smooth step towards target stage position
      if (Math.abs(t - tgt) > 0.0005) {
        const newT = t + (tgt > t ? ANIMATION_SPEED : -ANIMATION_SPEED);
        animRef.current.t = Math.max(0, Math.min(SEGMENT_COUNT, newT));
      } else if (t !== tgt) {
        animRef.current.t = tgt;
      }

      // State-driven wireframe post-fade once settled on stage 3 (DYMAXION).
      // Any deviation (Prev, scrub, drag-then-release) resets to 0, which
      // brings the wires back on the very next frame. Because this is state,
      // not a timer, no cleanup or cancellation is needed.
      if (
        WIRE_POST_FADE_SPEED > 0 &&
        animRef.current.tgt === GLOBE_STAGES.DYMAXION &&
        animRef.current.t === GLOBE_STAGES.DYMAXION
      ) {
        animRef.current.wirePostFadeT = Math.min(
          1,
          animRef.current.wirePostFadeT + WIRE_POST_FADE_SPEED,
        );
      } else {
        animRef.current.wirePostFadeT = 0;
      }

      updateGeometry(animRef.current.t);

      // Automated camera/group orientation behavior
      if (!drag && groupRef.current) {
        if (animRef.current.tgt === GLOBE_STAGES.SPHERE && animRef.current.t < 0.05) {
          // Slow continuous rotation on default sphere view
          groupRef.current.rotation.y += 0.004;
        } else if (animRef.current.tgt === GLOBE_STAGES.DYMAXION) {
          // Damped realignment to face flat net towards camera when fully unfolded
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

  // Synchronize target stage from props
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