import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import {
  SPHERE3D, SPHERE, FLAT, ease, bezier3, vertexKey, vertexControlMap, computeFaceT, NUM_FACES, SUB_BARY,
  GLOBE_STAGES, SEGMENT_COUNT, resolveSegment, STAGES,
} from '@/utils/icosahedron-geometry';

import {
  OverlayBuffers, OverlaySample, buildOverlayBuffers, updateOverlayPositions, createOverlayPoints,
} from '@/utils/overlay-layer';

import {
  createFaceMaterials, applyFaceSphereAttribute,
  type BaseLayerMode, type FaceMaterialsOptions,
} from '@/utils/face-materials';

// ──────────────────────────── CONFIGURATION ────────────────────────────

/** How far the playhead advances per frame, in t-units. Pairs with the
 *  per-stage `duration` in STAGES: this is "how fast pages turn," that
 *  is "how many pages each chapter has." */
const PLAYHEAD_RATE: number = 0.03;

/** Fold animation delay across faces: 0 = lockstep movement, >0 = wave/cascade across faces. */
const STAGGER_RATIO: number = 0.0;

/** Wireframe draw-in/out stagger ratio across faces. Used for both directions. */
const WIRE_STAGGER_RATIO: number = 0.5;

/** Maximum target opacity of wireframe lines once drawn. */
const WIRE_MAX_OPACITY: number = 0.35;

/** Camera distance (z) at the sphere stage. */
const SPHERE_Z: number = 4.2;

/** Camera distance (z) at the flat dymaxion stage. */
const FLAT_Z: number = 2.6;

/** Per-frame lerp toward the target camera distance. */
const CAMERA_EASE: number = 0.1;

/** Map-mode zoom bounds. Zoom is a divisor on camera Z: zoom > 1 = closer. */
const ZOOM_MIN: number = 1;
const ZOOM_MAX: number = 6.18;

/** Per-frame lerp for pan offset. Slightly snappier than camera ease. */
const PAN_EASE: number = 0.382;

/** Slower ease used while a reset is in flight, so the view glides home. */
const RESET_EASE = 0.0618;

/** If true, wheel zoom keeps the point under the cursor fixed on screen.
 *  If false, zoom is centered on the map center. */
const ZOOM_TO_CURSOR: boolean = false;

// Tight axis-aligned bounds of the flat Dymaxion net, computed once.
// Used to clamp pan so the user can't drag the map off into empty space.
const FLAT_BOUNDS = (() => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const face of FLAT) {
    for (const v of face) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
  }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, hx: (maxX - minX) / 2, hy: (maxY - minY) / 2 };
})();

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
}

interface IcosahedronGlobeProps {
  width?: number;
  height?: number;
  /** Target globe stage: 0=sphere, 1=triangulated sphere, 2=icosahedron, 3=dymaxion, 4=wires gone. Fractional values supported. */
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

/**
 * Imperative map-view API, exposed to the parent via ref. These only have
 * a visible effect once the fold has reached DYMAXION — before that, the
 * render loop gates them out. Kept imperative (not props) because they are
 * commands, not state: zoom/pan don't belong in the React data flow.
 */
export interface GlobeControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

// ──────────────────────────── COMPONENT ────────────────────────────

const IcosahedronGlobe = forwardRef<GlobeControls, IcosahedronGlobeProps>(({
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
}, ref) => {
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
  });

  /**
   * Map-mode view state. Only meaningful once the fold is fully flat.
   * Values are read by the render loop (zoom → camera Z divisor, panX/Y →
   * group position), and reset to identity by the stage effect whenever
   * the fold is below DYMAXION.
   */
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const smoothViewRef = useRef(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const overlayBuffersRef = useRef<OverlayBuffers | null>(null);
  const overlayPointsRef = useRef<THREE.Points | null>(null);

  /**
   * Expose the map-view API to the parent. Zoom steps are multiplicative
   * so each click feels equally weighted regardless of current level.
   * Reset returns to the exact default flat framing (centered, default Z).
   */
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      viewRef.current.zoom = Math.min(ZOOM_MAX, viewRef.current.zoom * 1.25);
    },
    zoomOut: () => {
      viewRef.current.zoom = Math.max(ZOOM_MIN, viewRef.current.zoom / 1.25);
    },
    resetView: () => {
      smoothViewRef.current = true;
      viewRef.current.zoom = 1;
      viewRef.current.panX = 0;
      viewRef.current.panY = 0;
    },
  }), []);

  /**
   * Core frame update function. Reads the STAGES table to know what the
   * current segment should look like, then blends the two rows it sits
   * between by `localT`. Every animated quantity — mesh pose, wire
   * endpoints, wire drawProgress — is a function of the row pair.
   */
  const updateGeometry = useCallback((globalStageT: number) => {
    const meshes = meshesRef.current;
    const wires = wiresRef.current;
    if (!meshes.length) return;

    // Row pair for this frame. `segment` is the row we are LEAVING; the
    // transition is between STAGES[segment] and STAGES[segment + 1].
    const { segment, localT } = resolveSegment(globalStageT);
    const rowA = STAGES[segment];
    const rowB = STAGES[segment + 1];

    // The pair of mesh poses fully determines the algorithm:
    //   sphere → sphere : hold smooth sphere (static)
    //   sphere → facet  : lerp smooth → faceted
    //   facet  → flat   : bezier through the flare control point
    //   flat   → flat   : hold flat net (static)
    // Adjacent equal poses mean this segment is a pure wire beat.
    const meshMotion = `${rowA.mesh}->${rowB.mesh}`;
    const holdPose = rowA.mesh === rowB.mesh;

    // Wire motion is a single lerp between the two rows' wire poses,
    // staggered per face. The retract at 3→4 uses the same code path as
    // the draw-in at 0→1 — they differ only in which row is 'full'.
    const wireFrom = rowA.wires === 'full' ? 1 : 0;
    const wireTo = rowB.wires === 'full' ? 1 : 0;

    SPHERE3D.forEach((_, fi: number) => {
      const faceT = computeFaceT(localT, fi, NUM_FACES, STAGGER_RATIO);
      // Holding a pose pins et to 1. This is what keeps the wire at its
      // flat corners during the retract segment (flat→flat) instead of
      // resetting to the sphere corner on the first frame of that segment.
      const et = holdPose ? 1 : ease(faceT);

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
        switch (meshMotion) {
          case 'sphere->sphere':
            // Static smooth unit sphere.
            v = facetPos.normalize();
            break;

          case 'sphere->facet':
            // Smooth sphere morphs into faceted icosahedron geometry.
            v = facetPos.clone().normalize().lerp(facetPos, et);
            break;

          case 'flat->flat':
            // Static flat net — mesh holds its dymaxion pose.
            v = new THREE.Vector3(
              w0 * corners[0].flat.x + w1 * corners[1].flat.x + w2 * corners[2].flat.x,
              w0 * corners[0].flat.y + w1 * corners[1].flat.y + w2 * corners[2].flat.y,
              w0 * corners[0].flat.z + w1 * corners[1].flat.z + w2 * corners[2].flat.z,
            );
            break;

          default: { // 'facet->flat'
            // Quadratic Bezier transformation from 3D icosahedron to flat 2D Dymaxion net.
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
            break;
          }
        }

        posArray[i * 3] = v.x;
        posArray[i * 3 + 1] = v.y;
        posArray[i * 3 + 2] = v.z;
      });

      meshes[fi].geometry.attributes.position.needsUpdate = true;

      // ── UPDATE WIREFRAME LINE ENDPOINTS ────────────────────────────
      // Wire corners sit on the smooth sphere while the mesh is still a
      // sphere (rowA.mesh === 'sphere'). Once the mesh has started its
      // facet/flat deformation, the wire follows the same bezier path.
      const wireFollowsMesh = rowA.mesh !== 'sphere';
      const wPosArray = wires[fi].geometry.attributes.position.array as Float32Array;
      const currentPts = ([0, 1, 2] as const).map((i) =>
        wireFollowsMesh
          ? bezier3(corners[i].sphere, corners[i].flat, corners[i].cp, et)
          : corners[i].sphere
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
      // drawProgress is a single lerp between the two rows' wire poses.
      // Same stagger in both directions, so draw-in and retract feel
      // like the same hand doing the same stroke.
      const wireT = ease(computeFaceT(localT, fi, NUM_FACES, WIRE_STAGGER_RATIO));
      const drawProgress = wireFrom + (wireTo - wireFrom) * wireT;

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
    camera.position.set(0, 0, SPHERE_Z);
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
      mesh.frustumCulled = false;
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
        depthTest: false,
      });

      const wire = new THREE.LineSegments(wg, wireMaterial);
      wire.visible = false;
      wire.frustumCulled = false;
      grp.add(wire);
      wires.push(wire);
    });

    meshesRef.current = meshes;
    wiresRef.current = wires;

    updateGeometry(animRef.current.tgt);

    // Mouse drag: rotate the globe in sphere mode, pan the map in flat mode.
    const onMouseDown = (e: MouseEvent) => {
      animRef.current.lastMouse = { x: e.clientX, y: e.clientY };
      animRef.current.drag = false;
      smoothViewRef.current = false;   // user takes over; cancel the reset glide
    };

    const onMouseMove = (e: MouseEvent) => {
      const { lastMouse } = animRef.current;
      if (!lastMouse || !groupRef.current) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) animRef.current.drag = true;
      if (!animRef.current.drag) return;

      // Flat map mode: drag slides the map. Spherical modes: drag rotates.
      const isFlat = animRef.current.t >= GLOBE_STAGES.DYMAXION;
      if (isFlat) {
        // Screen pixels -> world units, scaled by current camera distance
        // so panning feels consistent at any zoom level.
        const z = cameraRef.current?.position.z ?? FLAT_Z;
        const scale = 0.005 * (z / FLAT_Z);
        viewRef.current.panX += dx * scale;
        viewRef.current.panY -= dy * scale;
      } else {
        groupRef.current.rotation.y += dx * 0.007;
        groupRef.current.rotation.x += dy * 0.007;
      }
      animRef.current.lastMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      // Click-to-toggle stays disabled — stage is fully controlled by the
      // parent via the `stage` prop (see the `useEffect` below).
      animRef.current.lastMouse = null;
      animRef.current.drag = false;
    };

    // Wheel zoom: only in flat map mode. Before DYMAXION the event falls
    // through so page scroll is never hijacked by the sphere stages.
    const onWheel = (e: WheelEvent) => {
      if (animRef.current.t < GLOBE_STAGES.DYMAXION) return;
      smoothViewRef.current = false;   // user takes over; cancel the reset glide
      e.preventDefault();

      const cam = cameraRef.current;
      if (!cam) return;

      const v = viewRef.current;
      const zoomOld = v.zoom;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const zoomNew = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomOld * factor));
      if (zoomNew === zoomOld) return;

      if (ZOOM_TO_CURSOR) {
        // Cursor position in [-1, 1], Y up. Center of canvas is (0, 0).
        const rect = canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = 1 - ((e.clientY - rect.top) / rect.height) * 2;

        // World half-extents of the visible frustum at old vs new zoom.
        const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360);
        const halfH_old = (FLAT_Z / zoomOld) * tanHalfFov;
        const halfH_new = (FLAT_Z / zoomNew) * tanHalfFov;
        const halfW_old = halfH_old * cam.aspect;
        const halfW_new = halfH_new * cam.aspect;

        // Shift pan so the map point under the cursor stays put on screen.
        v.panX += nx * (halfW_new - halfW_old);
        v.panY += ny * (halfH_new - halfH_old);
      }

      v.zoom = zoomNew;
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (animRef.current.t < GLOBE_STAGES.DYMAXION) return;
      if (animRef.current.drag) return;   // ignore if the click was really a drag

      const v = viewRef.current;
      const cam = cameraRef.current;
      if (!cam) return;

      // Any zoom beyond origin → reset home.
      if (v.zoom > 1.001) {
        smoothViewRef.current = true;
        v.zoom = 1;
        v.panX = 0;
        v.panY = 0;
        return;
      }

      // Smooth glide for both pan and camera — same as reset.
      smoothViewRef.current = true;

      // At origin → zoom all the way in, anchored at the cursor.
      const zoomOld = v.zoom;
      const zoomNew = ZOOM_MAX;
      if (zoomNew === zoomOld) return;

      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = 1 - ((e.clientY - rect.top) / rect.height) * 2;

      const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360);
      const halfH_old = (FLAT_Z / zoomOld) * tanHalfFov;
      const halfH_new = (FLAT_Z / zoomNew) * tanHalfFov;
      const halfW_old = halfH_old * cam.aspect;
      const halfW_new = halfH_new * cam.aspect;

      v.panX += nx * (halfW_new - halfW_old);
      v.panY += ny * (halfH_new - halfH_old);
      v.zoom = zoomNew;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDoubleClick);

    // Teardown WebGL memory references on unmount
    return () => {
      cancelAnimationFrame(animRef.current.frameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDoubleClick);
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
      points.frustumCulled = false;
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

  // Main render loop handling interpolation and idle rotation
  useEffect(() => {
    const loop = (): void => {
      const { t, tgt, drag } = animRef.current;

      // Smooth step towards target stage position
      if (Math.abs(t - tgt) > 0.0005) {
        const newT = t + (tgt > t ? PLAYHEAD_RATE : -PLAYHEAD_RATE);
        animRef.current.t = Math.max(0, Math.min(SEGMENT_COUNT, newT));
      } else if (t !== tgt) {
        animRef.current.t = tgt;
      }

      updateGeometry(animRef.current.t);

      const isFlat = animRef.current.t >= GLOBE_STAGES.DYMAXION;

      // Clamp pan so the map can't be dragged past its own edges.
      // Limit grows with zoom: at zoom=1 (whole net visible) it's ~0.
      const zoom = isFlat ? viewRef.current.zoom : 1;
      const LEEWAY_X = 1;
      const LEEWAY_Y = 1.618;
      const limitX = FLAT_BOUNDS.hx * (LEEWAY_X + (1 - 1 / zoom));
      const limitY = FLAT_BOUNDS.hy * (LEEWAY_Y + (1 - 1 / zoom));
      viewRef.current.panX = Math.max(-limitX, Math.min(limitX, viewRef.current.panX));
      viewRef.current.panY = Math.max(-limitY, Math.min(limitY, viewRef.current.panY));

      // Pan: ease group position toward the stored pan offset. Outside
      // flat mode, pan eases back to zero so the sphere is always centered.
      if (groupRef.current) {
        const targetPanX = isFlat ? viewRef.current.panX : 0;
        const targetPanY = isFlat ? viewRef.current.panY : 0;
        // Only use the slow ease when resetting. Otherwise, use the snappy ease.
        const panEase = smoothViewRef.current ? RESET_EASE : PAN_EASE;
        groupRef.current.position.x += (targetPanX - groupRef.current.position.x) * panEase;
        groupRef.current.position.y += (targetPanY - groupRef.current.position.y) * panEase;
      }

      // Automated camera/group orientation behavior
      if (!drag && groupRef.current) {
        if (animRef.current.tgt === GLOBE_STAGES.SPHERE && animRef.current.t < 0.05) {
          // Slow continuous rotation on default sphere view
          groupRef.current.rotation.y += 0.004;
        } else if (animRef.current.tgt >= GLOBE_STAGES.DYMAXION) {
          // Damped realignment to face flat net towards camera when fully unfolded.
          // Holds through stage 4 as well, so the flat net stays square-on while wires retract.
          const progress = animRef.current.t / SEGMENT_COUNT;
          const damping = 0.02 + progress * 0.06;
          groupRef.current.rotation.x += (-0 - groupRef.current.rotation.x) * damping;
          groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * damping;
        }
      }

      const cam = cameraRef.current;
      if (cam) {
        const SPAN = GLOBE_STAGES.DYMAXION - GLOBE_STAGES.ICOSAHEDRON;
        const foldProgress = Math.min(1, Math.max(0,
          (animRef.current.t - GLOBE_STAGES.ICOSAHEDRON) / SPAN));
        const baseZ = SPHERE_Z + (FLAT_Z - SPHERE_Z) * foldProgress;
        // User zoom is applied as a divisor on the fold-driven base Z.
        // Ignored outside flat mode, so the fold's own camera move is untouched.
        const targetZ = baseZ / zoom;
        const camEase = smoothViewRef.current ? RESET_EASE : CAMERA_EASE;
        cam.position.z += (targetZ - cam.position.z) * camEase;
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
    // Folding away from the map resets the view so the sphere is never
    // left off-center or over-zoomed when the animation returns to it.
    if (stage < GLOBE_STAGES.DYMAXION) {
      viewRef.current.zoom = 1;
      viewRef.current.panX = 0;
      viewRef.current.panY = 0;
    }
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  return (
    <div ref={containerRef} className="w-full h-full" data-lenis-prevent>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'block',
          cursor: 'grab',
          background: 'transparent',
          border: '2px solid white',
          width: '100%',
          height: '100%',
          ...style,
        }}
        {...canvasProps}
      />
    </div>
  );
});

IcosahedronGlobe.displayName = 'IcosahedronGlobe';

export default IcosahedronGlobe;
export { GLOBE_STAGES };