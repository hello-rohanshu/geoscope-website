import React, { useRef, useEffect, useState, useCallback, createContext, useContext } from 'react';
import * as THREE from 'three';

interface FaceData {
  vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3]; // current interpolated positions
  sphereVertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  flatVertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
}

interface GlobeContextValue {
  faces: FaceData[];
  progress: number; // 0 = sphere, 1 = flat
  scene: THREE.Scene | null;
  group: THREE.Group | null;
}

export const GlobeContext = createContext<GlobeContextValue | null>(null);
export function useGlobeContext() {
  const ctx = useContext(GlobeContext);
  if (!ctx) throw new Error('useGlobeContext must be used inside IcosahedronGlobe');
  return ctx;
}

// ──────────────────────────── CONFIGURATION ────────────────────────────
const MAP_ROTATION_DEG: number = 120;
const ANIMATION_SPEED: number = 0.012;
const STAGGER_RATIO: number = 0.0;       // 0 = fully synchronised
const FLARE_AMOUNT: number = 0.7;        // outward bulge

// ── 3D globe (icosahedron with coplanar split vertices) ───────────────
type Triangle3D = [[number, number, number], [number, number, number], [number, number, number]];

const SPHERE3D: Triangle3D[] = [
  [[0, 0, 1], [0.7236068, 0.5257311, 0.4472136], [0.7236068, -0.5257311, 0.4472136]],
  [[0, 0, 1], [-0.2763932, 0.8506508, 0.4472136], [0.7236068, 0.5257311, 0.4472136]],
  [[0, 0, 1], [-0.8944272, 0, 0.4472136], [-0.2763932, 0.8506508, 0.4472136]],
  [[0, 0, 1], [-0.2763932, -0.8506508, 0.4472136], [-0.8944272, 0, 0.4472136]],
  [[0, 0, 1], [0.7236068, -0.5257311, 0.4472136], [-0.2763932, -0.8506508, 0.4472136]],
  [[0.8944272, 0, -0.4472136], [0.7236068, -0.5257311, 0.4472136], [0.7236068, 0.5257311, 0.4472136]],
  [[0.7236068, 0.5257311, 0.4472136], [0.2763932, 0.8506508, -0.4472136], [0.8944272, 0, -0.4472136]],
  [[0.2763932, 0.8506508, -0.4472136], [0.7236068, 0.5257311, 0.4472136], [-0.2763932, 0.8506508, 0.4472136]],
  [[-0.2763932, 0.8506508, 0.4472136], [-0.7236068, 0.5257311, -0.4472136], [0.2763932, 0.8506508, -0.4472136]],
  [[-0.7236068, 0.5257311, -0.4472136], [-0.2763932, 0.8506508, 0.4472136], [-0.8944272, 0, 0.4472136]],
  [[-0.8944272, 0, 0.4472136], [-0.7236068, -0.5257311, -0.4472136], [-0.7236068, 0.5257311, -0.4472136]],
  [[-0.7236068, -0.5257311, -0.4472136], [-0.8944272, 0, 0.4472136], [-0.2763932, -0.8506508, 0.4472136]],
  [[-0.2763932, -0.8506508, 0.4472136], [0.2763932, -0.8506508, -0.4472136], [-0.7236068, -0.5257311, -0.4472136]],
  [[0.2763932, -0.8506508, -0.4472136], [-0.2763932, -0.8506508, 0.4472136], [0.7236068, -0.5257311, 0.4472136]],
  [[0.7236068, -0.5257311, 0.4472136], [0.5854102, -0.4253254, -0.4472136], [0.2763932, -0.8506508, -0.4472136]],
  [[0.3902735, 0.2835503, -0.6314757], [0.8944272, 0, -0.4472136], [0.2763932, 0.8506508, -0.4472136]],
  [[0, 0, -1], [0.2763932, 0.8506508, -0.4472136], [-0.7236068, 0.5257311, -0.4472136]],
  [[0, 0, -1], [-0.7236068, 0.5257311, -0.4472136], [-0.7236068, -0.5257311, -0.4472136]],
  [[0, 0, -1], [-0.7236068, -0.5257311, -0.4472136], [0.2763932, -0.8506508, -0.4472136]],
  [[0, 0, -1], [0.5854102, -0.4253254, -0.4472136], [0.8944272, 0, -0.4472136]],
  [[0, 0, -1], [0.3902735, 0.2835503, -0.6314757], [0.2763932, 0.8506508, -0.4472136]],
  [[0, 0, -1], [0.8944272, 0, -0.4472136], [0.3902735, 0.2835503, -0.6314757]],
  [[0.7236068, -0.5257311, 0.4472136], [0.8944272, 0, -0.4472136], [0.5854102, -0.4253254, -0.4472136]],
  [[0.5854102, -0.4253254, -0.4472136], [0, 0, -1], [0.2763932, -0.8506508, -0.4472136]],
];

// ── 2D net (repositioned to share edges correctly) ────────────────────
type Point2D = [number, number];
type Triangle2D = [Point2D, Point2D, Point2D];

const sqrt3: number = Math.sqrt(3);
const h: number = sqrt3 / 2;

const f14_A: Point2D = [-1.5, -3.752777];
const f14_B: Point2D = [-0.5, -3.752777];
const f14_unsplitApex: Point2D = [-1.0, -3.752777 - h];
const f14_mid: Point2D = [(f14_unsplitApex[0] + f14_B[0]) / 2, (f14_unsplitApex[1] + f14_B[1]) / 2];

const f15_A: Point2D = [1.5, -0.288675];
const f15_B: Point2D = [1.0, -1.154701];
const f15_parentApex: Point2D = [2.0, -1.154701];
const f15_centroid: Point2D = [(f15_A[0] + f15_B[0] + f15_parentApex[0]) / 3, (f15_A[1] + f15_B[1] + f15_parentApex[1]) / 3];

const f19_v0: Point2D = [2.0, -1.154701];
const f19_v2: Point2D = [1.5, -0.288675];
const f19_mid: Point2D = [2.0, -0.288675];

const f20_new: Triangle2D = [
  [1.5, -2.020726],
  [1.5, -1.443376],
  [1.0, -1.154701]
];

const f21: Triangle2D = [f15_parentApex, f15_A, f15_centroid];
const f22_free: Point2D = [2.0, 0.57735];
const f23: Triangle2D = [[2.0, -0.288675], [2.0, -1.154701], [2.5, -0.288675]];

const FLAT2D: Triangle2D[] = [
  [[-0.500000, -0.288675], [0.500000, -0.288675], [0.000000, 0.577350]],
  [[-0.500000, -0.288675], [0.000000, -1.154701], [0.500000, -0.288675]],
  [[-0.500000, -0.288675], [-1.000000, -1.154701], [0.000000, -1.154701]],
  [[-1.500000, -2.020726], [-1.000000, -2.886751], [-0.500000, -2.020726]],
  [[-2.000000, -2.886751], [-1.500000, -3.752777], [-1.000000, -2.886751]],
  [[1.500000, -0.288675], [1.000000, 0.577350], [0.500000, -0.288675]],
  [[0.500000, -0.288675], [1.000000, -1.154701], [1.500000, -0.288675]],
  [[1.000000, -1.154701], [0.500000, -0.288675], [0.000000, -1.154701]],
  [[0.000000, -1.154701], [0.500000, -2.020726], [1.000000, -1.154701]],
  [[0.500000, -2.020726], [0.000000, -1.154701], [-0.500000, -2.020726]],
  [[-0.500000, -2.020726], [0.000000, -2.886751], [0.500000, -2.020726]],
  [[0.000000, -2.886751], [-0.500000, -2.020726], [-1.000000, -2.886751]],
  [[-1.000000, -2.886751], [-0.500000, -3.752777], [0.000000, -2.886751]],
  [[-0.500000, -3.752777], [-1.000000, -2.886751], [-1.500000, -3.752777]],
  [f14_A, f14_mid, f14_B],
  [f15_centroid, f15_A, f15_B],
  [[1.500000, -2.020726], [1.000000, -1.154701], [0.500000, -2.020726]],
  [[1.000000, -2.886751], [0.500000, -2.020726], [0.000000, -2.886751]],
  [[1.000000, -2.886751], [0.000000, -2.886751], [0.500000, -3.752777]],
  [f19_v0, f19_mid, f19_v2],
  f20_new,
  f21,
  [f22_free, [1.5, -0.288675], [2.0, -0.288675]],
  f23,
];

// ── Utility: ease & quadratic Bezier ──────────────────────────────────
const ease = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const bezier3 = (P0: THREE.Vector3, P1: THREE.Vector3, C: THREE.Vector3, t: number): THREE.Vector3 => {
  const mt: number = 1 - t;
  const a: number = mt * mt;
  const b: number = 2 * mt * t;
  const c: number = t * t;
  return new THREE.Vector3(
    a * P0.x + b * C.x + c * P1.x,
    a * P0.y + b * C.y + c * P1.y,
    a * P0.z + b * C.z + c * P1.z
  );
};

// ── Vertex key helper ─────────────────────────────────────────────────
const vertexKey = (v: THREE.Vector3): string =>
  `${Math.round(v.x * 1e5)},${Math.round(v.y * 1e5)},${Math.round(v.z * 1e5)}`;

// ── Build sphere vertex array & control points ────────────────────────
const SPHERE: THREE.Vector3[][] = SPHERE3D.map((f: Triangle3D) =>
  f.map(([x, y, z]: [number, number, number]) => new THREE.Vector3(x, y, z))
);

const vertexControlMap = new Map<string, THREE.Vector3>();
SPHERE3D.forEach((face: Triangle3D) => {
  face.forEach((coord: [number, number, number]) => {
    const v = new THREE.Vector3(coord[0], coord[1], coord[2]);
    const key = vertexKey(v);
    if (!vertexControlMap.has(key)) {
      const normal = v.clone().normalize();
      const cp = v.clone().add(normal.multiplyScalar(FLARE_AMOUNT));
      vertexControlMap.set(key, cp);
    }
  });
});

// ── Build flat target (centered, scaled, rotated) ─────────────────────
let cx: number = 0, cy: number = 0, n: number = 0;
FLAT2D.forEach((f: Triangle2D) => f.forEach(([x, y]: Point2D) => { cx += x; cy += y; n++; }));
cx /= n; cy /= n;
let mr: number = 0;
FLAT2D.forEach((f: Triangle2D) => f.forEach(([x, y]: Point2D) => {
  mr = Math.max(mr, Math.abs(x - cx), Math.abs(y - cy));
}));
const SC: number = 1.65 / mr;
const cosR: number = Math.cos(-MAP_ROTATION_DEG * Math.PI / 180);
const sinR: number = Math.sin(-MAP_ROTATION_DEG * Math.PI / 180);

const FLAT: THREE.Vector3[][] = FLAT2D.map((f: Triangle2D) =>
  f.map(([x, y]: Point2D) => {
    const rx: number = (x - cx) * SC;
    const ry: number = (-(y - cy)) * SC;
    return new THREE.Vector3(rx * cosR - ry * sinR, rx * sinR + ry * cosR, 0);
  })
);

export const FLAT_TRANSFORM = { cx, cy, mr, cosR, sinR };

// ── Colour palette ────────────────────────────────────────────────────
const PAL: string[] = [
  '#4A90D9', '#5BA85A', '#3AABBF', '#4A90D9', '#5BA85A',
  '#7DC46B', '#6CAF8E', '#5C8FD9', '#8AA0CC', '#7DC46B',
  '#6CAF8E', '#5C8FD9', '#8AA0CC', '#7DC46B',
  '#E8A838', '#E87050', '#6CAF8E', '#8AA0CC', '#5C8FD9',
  '#E8A838', '#E87050', '#E87050', '#E8A838', '#E8A838',
];


// ── Animation state interface ─────────────────────────────────────────
interface AnimState {
  t: number;
  tgt: number;
  drag: boolean;
  lastMouse: { x: number; y: number } | null;
  frameId: number;
}

// ── Component props interface ─────────────────────────────────────────
interface IcosahedronGlobeProps {
  width?: number;
  height?: number;
  unfolded?: boolean;
  onToggle?: (unfolded: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// ═══════════════ React Component ═══════════════
const IcosahedronGlobe: React.FC<IcosahedronGlobeProps> = ({
  width = 680,
  height = 500,
  unfolded = false,
  onToggle,
  className,
  style,
  children,
  ...canvasProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  const facesRef = useRef<FaceData[]>([]);
  const [contextValue, setContextValue] = useState<GlobeContextValue>({
    faces: [],
    progress: 0,
    scene: null,
    group: null,
  });

  // Toggle folding state
  const toggle = useCallback(() => {
    animRef.current.tgt = animRef.current.tgt === 0 ? 1 : 0;
    onToggle?.(animRef.current.tgt === 1);
  }, [onToggle]);

  // Update all face geometries based on interpolation factor t
  const updateGeometry = useCallback((globalT: number) => {
    const meshes = meshesRef.current;
    const wires = wiresRef.current;
    if (!meshes.length) return;

    const numFaces: number = SPHERE3D.length;
    const staggerStep: number = STAGGER_RATIO / (numFaces - 1);
    const oneMinusStagger: number = 1 - STAGGER_RATIO;

    SPHERE3D.forEach((_: Triangle3D, fi: number) => {
      const rawT: number = (globalT - fi * staggerStep) / oneMinusStagger;
      const effT: number = Math.max(0, Math.min(1, rawT));
      const et: number = ease(effT);

      const vertices: THREE.Vector3[] = [0, 1, 2].map((i: number) => {
        const sphereVert: THREE.Vector3 = SPHERE[fi][i];
        const flatVert: THREE.Vector3 = FLAT[fi][i];
        const cp: THREE.Vector3 | undefined = vertexControlMap.get(vertexKey(sphereVert));
        if (!cp) throw new Error('Control point not found');
        return bezier3(sphereVert, flatVert, cp, et);
      });

      // Update mesh
      const posArray: Float32Array = meshes[fi].geometry.attributes.position.array as Float32Array;
      vertices.forEach((v: THREE.Vector3, i: number) => {
        posArray[i * 3] = v.x;
        posArray[i * 3 + 1] = v.y;
        posArray[i * 3 + 2] = v.z;
      });
      meshes[fi].geometry.attributes.position.needsUpdate = true;

      // Update wireframe
      const wPosArray: Float32Array = wires[fi].geometry.attributes.position.array as Float32Array;
      vertices.forEach((v: THREE.Vector3, i: number) => {
        wPosArray[i * 3] = v.x;
        wPosArray[i * 3 + 1] = v.y;
        wPosArray[i * 3 + 2] = v.z;
      });
      wires[fi].geometry.attributes.position.needsUpdate = true;
    });
    // Store face data for overlays
    const numFacesForData: number = SPHERE3D.length;
    const staggerStepForData: number = STAGGER_RATIO / (numFacesForData - 1);
    const oneMinusStaggerForData: number = 1 - STAGGER_RATIO;

    facesRef.current = SPHERE3D.map((_: Triangle3D, fi: number) => {
      const sphereVerts: [THREE.Vector3, THREE.Vector3, THREE.Vector3] = [
        SPHERE[fi][0].clone(), SPHERE[fi][1].clone(), SPHERE[fi][2].clone()
      ];
      const flatVerts: [THREE.Vector3, THREE.Vector3, THREE.Vector3] = [
        FLAT[fi][0].clone(), FLAT[fi][1].clone(), FLAT[fi][2].clone()
      ];

      const rawT: number = (globalT - fi * staggerStepForData) / oneMinusStaggerForData;
      const effT: number = Math.max(0, Math.min(1, rawT));
      const et: number = ease(effT);

      const currentVerts: [THREE.Vector3, THREE.Vector3, THREE.Vector3] = [
        bezier3(sphereVerts[0], flatVerts[0], vertexControlMap.get(vertexKey(sphereVerts[0]))!, et),
        bezier3(sphereVerts[1], flatVerts[1], vertexControlMap.get(vertexKey(sphereVerts[1]))!, et),
        bezier3(sphereVerts[2], flatVerts[2], vertexControlMap.get(vertexKey(sphereVerts[2]))!, et),
      ];

      return { vertices: currentVerts, sphereVertices: sphereVerts, flatVertices: flatVerts };
    });
  }, []);

  // Initialise Three.js once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Expose scene on canvas for overlays to find
    (canvas as any).__threeScene = scene;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 100);
    camera.position.set(0, 0, 5.6);
    cameraRef.current = camera;

    const grp = new THREE.Group();
    scene.add(grp);
    groupRef.current = grp;

    const meshes: THREE.Mesh[] = [];
    const wires: THREE.LineSegments[] = [];
    SPHERE3D.forEach((_: Triangle3D, fi: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(PAL[fi] || '#8AA0CC'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
      });
      const mesh = new THREE.Mesh(geo, mat);
      grp.add(mesh);
      meshes.push(mesh);

      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      wg.setIndex([0, 1, 1, 2, 2, 0]);
      const wire = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      }));
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
      const dx: number = e.clientX - lastMouse.x;
      const dy: number = e.clientY - lastMouse.y;
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
      renderer.dispose();
      scene.clear();
    };
  }, [width, height, toggle, updateGeometry]);

  // Animation loop
  useEffect(() => {
    const loop = (): void => {
      const { t, tgt, drag } = animRef.current;
      if (Math.abs(t - tgt) > 0.0005) {
        const newT: number = t + (tgt > t ? ANIMATION_SPEED : -ANIMATION_SPEED);
        animRef.current.t = Math.max(0, Math.min(1, newT));
      } else if (t !== tgt) {
        animRef.current.t = tgt;
      }

      updateGeometry(animRef.current.t);

      setContextValue({
        faces: [...facesRef.current],
        progress: animRef.current.t,
        scene: sceneRef.current,
        group: groupRef.current,
      });

      if (!drag && groupRef.current) {
        if (animRef.current.t < 0.05) {
          groupRef.current.rotation.y += 0.004;
        } else if (animRef.current.t > 0.95) {
          groupRef.current.rotation.x += (-0.04 - groupRef.current.rotation.x) * 0.04;
          groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.04;
        }
      }

      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      animRef.current.frameId = requestAnimationFrame(loop);
    };

    animRef.current.frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current.frameId);
  }, [updateGeometry]);

  // Sync initial unfolded prop
  useEffect(() => {
    animRef.current.tgt = unfolded ? 1 : 0;
  }, [unfolded]);

  return (
    <GlobeContext.Provider value={contextValue}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{
          display: "block",
          cursor: "grab",
          background: "#111",
          ...style,
        }}
        {...canvasProps}
      />
      {children}
    </GlobeContext.Provider>
  );
};

export default IcosahedronGlobe;