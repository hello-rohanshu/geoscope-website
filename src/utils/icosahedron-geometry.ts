// utils/icosahedron-geometry.ts
// Single source of truth for the 24-face icosahedron/Dymaxion net.
// IcosahedronGlobe (mesh rendering) and lonLatToFaceUV (data placement)
// both import from here so the two can never drift apart.

import * as THREE from 'three';

export const MAP_ROTATION_DEG = 120;
export const FLARE_AMOUNT = 0.7;

export type Triangle3D = [[number, number, number], [number, number, number], [number, number, number]];
export type Point2D = [number, number];
export type Triangle2D = [Point2D, Point2D, Point2D];

// ── 3D globe (icosahedron with coplanar split vertices) ───────────────
export const SPHERE3D: Triangle3D[] = [
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

export const NUM_FACES = SPHERE3D.length;

// ── 2D net (repositioned to share edges correctly) ────────────────────
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

export const FLAT2D: Triangle2D[] = [
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

// ── Colour palette ────────────────────────────────────────────────────
export const PAL: string[] = [
  '#4A90D9', '#5BA85A', '#3AABBF', '#4A90D9', '#5BA85A',
  '#7DC46B', '#6CAF8E', '#5C8FD9', '#8AA0CC', '#7DC46B',
  '#6CAF8E', '#5C8FD9', '#8AA0CC', '#7DC46B',
  '#E8A838', '#E87050', '#6CAF8E', '#8AA0CC', '#5C8FD9',
  '#E8A838', '#E87050', '#E87050', '#E8A838', '#E8A838',
];

// ── Utility: ease, quadratic bezier, per-face stagger ──────────────────
export const ease = (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export const bezier3 = (P0: THREE.Vector3, P1: THREE.Vector3, C: THREE.Vector3, t: number): THREE.Vector3 => {
  const mt = 1 - t;
  const a = mt * mt;
  const b = 2 * mt * t;
  const c = t * t;
  return new THREE.Vector3(
    a * P0.x + b * C.x + c * P1.x,
    a * P0.y + b * C.y + c * P1.y,
    a * P0.z + b * C.z + c * P1.z
  );
};

/** Same stagger formula as the mesh update loop — shared so data points fold in sync with faces. */
export function computeFaceT(globalT: number, faceIndex: number, numFaces: number, staggerRatio: number): number {
  const staggerStep = staggerRatio / (numFaces - 1);
  const oneMinusStagger = 1 - staggerRatio;
  const rawT = (globalT - faceIndex * staggerStep) / oneMinusStagger;
  return Math.max(0, Math.min(1, rawT));
}

// ── Vertex key helper (for dedup + control-point lookup) ───────────────
export const vertexKey = (v: THREE.Vector3): string =>
  `${Math.round(v.x * 1e5)},${Math.round(v.y * 1e5)},${Math.round(v.z * 1e5)}`;

// ── Build sphere vertex array & flare control points ────────────────────
export const SPHERE: THREE.Vector3[][] = SPHERE3D.map((f: Triangle3D) =>
  f.map(([x, y, z]: [number, number, number]) => new THREE.Vector3(x, y, z))
);

export const vertexControlMap = new Map<string, THREE.Vector3>();
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
let cx = 0, cy = 0, n = 0;
FLAT2D.forEach((f) => f.forEach(([x, y]) => { cx += x; cy += y; n++; }));
cx /= n; cy /= n;
let mr = 0;
FLAT2D.forEach((f) => f.forEach(([x, y]) => {
  mr = Math.max(mr, Math.abs(x - cx), Math.abs(y - cy));
}));
const SC = 1.65 / mr;
const cosR = Math.cos(-MAP_ROTATION_DEG * Math.PI / 180);
const sinR = Math.sin(-MAP_ROTATION_DEG * Math.PI / 180);

export const FLAT: THREE.Vector3[][] = FLAT2D.map((f: Triangle2D) =>
  f.map(([x, y]: Point2D) => {
    const rx = (x - cx) * SC;
    const ry = (-(y - cy)) * SC;
    return new THREE.Vector3(rx * cosR - ry * sinR, rx * sinR + ry * cosR, 0);
  })
);

// ── Face subdivision barycentric weights ──────────────────────────────
// 1-level midpoint subdivision splits each triangular face into 4 sub-triangles:
//
//         A
//        / \
//      mAB─mCA
//      / \ / \
//     B──mBC──C
//
// Sub-triangles (consistent winding):
//   tri0: A,   mAB, mCA
//   tri1: mAB, B,   mBC
//   tri2: mCA, mBC, C
//   tri3: mAB, mBC, mCA   ← centre (same winding as outer three)
//
// Non-indexed layout: 4 triangles × 3 vertices = 12 sub-vertices.
// Each row is [w0, w1, w2] such that sub-vertex = w0*A + w1*B + w2*C.
// These weights apply uniformly to positions, UVs, and control points.
export const SUB_BARY: [number, number, number][] = [
  // tri0: A, mAB, mCA
  [1,   0,   0  ],
  [0.5, 0.5, 0  ],
  [0.5, 0,   0.5],
  // tri1: mAB, B, mBC
  [0.5, 0.5, 0  ],
  [0,   1,   0  ],
  [0,   0.5, 0.5],
  // tri2: mCA, mBC, C
  [0.5, 0,   0.5],
  [0,   0.5, 0.5],
  [0,   0,   1  ],
  // tri3: mAB, mBC, mCA  (centre)
  [0.5, 0.5, 0  ],
  [0,   0.5, 0.5],
  [0.5, 0,   0.5],
];

// ── Per-face sub-vertex positions on the UNIT SPHERE (static) ─────────
// Doesn't change with fold animation. Used as a custom vertex attribute so
// the polar-safe texture shader can compute exact lon/lat per pixel instead
// of interpolating baked-per-vertex UVs (see face-materials.ts).
export const FACE_SPHERE_POSITIONS: Float32Array[] = SPHERE3D.map((face) => {
  const arr = new Float32Array(36);
  SUB_BARY.forEach(([w0, w1, w2], i) => {
    arr[i * 3]     = w0 * face[0][0] + w1 * face[1][0] + w2 * face[2][0];
    arr[i * 3 + 1] = w0 * face[0][1] + w1 * face[1][1] + w2 * face[2][1];
    arr[i * 3 + 2] = w0 * face[0][2] + w1 * face[1][2] + w2 * face[2][2];
  });
  return arr;
});

// ── Multi-stage animation model ────────────────────────────────────────
// 0 = smooth sphere · 1 = smooth sphere + icosa triangulation
// 2 = icosahedron (faceted, = old t=0) · 3 = dymaxion (flat net, = old t=1)
export const GLOBE_STAGES = {
  SPHERE: 0,
  SPHERE_TRIANGULATED: 1,
  ICOSAHEDRON: 2,
  DYMAXION: 3,
} as const;

export const STAGE_COUNT = 4;
export const SEGMENT_COUNT = STAGE_COUNT - 1;

/** Splits a continuous 0..SEGMENT_COUNT stage value into an active segment + local 0..1 progress. */
export function resolveSegment(globalStageT: number): { segment: number; localT: number } {
  const clamped = Math.max(0, Math.min(SEGMENT_COUNT, globalStageT));
  const segment = Math.min(SEGMENT_COUNT - 1, Math.floor(clamped));
  return { segment, localT: clamped - segment };
}