// utils/icosahedron-geometry.ts
//
// Single source of truth for the 24-face icosahedron / Dymaxion net.
//
// Two consumers import from this file and must never drift apart:
//   • icosahedron-globe.tsx  — renders the animated 3D mesh + wireframe
//   • lonLatToFaceUV.ts      — places geographic data onto faces
//
// Anything that describes "where a face is" or "how a face is subdivided"
// belongs here, not in the consumers. If you find yourself hardcoding a
// face count, a vertex count, or a sub-vertex layout somewhere else,
// it's a bug — add it here and import it.

import * as THREE from 'three';

// ── Calibration constants ─────────────────────────────────────────────
// Fuller's Dymaxion orientation, in degrees. Applied to the 2D flat net
// so the icosahedron's own singular vertices land in oceans rather than
// on populated land. See face-materials.ts for the shader-side handling.
export const MAP_ROTATION_DEG = 120;

// How far (in unit-sphere radii) each corner's bezier control point is
// pushed outward along its own normal during the icosahedron→dymaxion
// fold. Controls how "ballooned" the intermediate fold looks.
export const FLARE_AMOUNT = 0.7;

// ── Shared types ──────────────────────────────────────────────────────
export type Triangle3D = [[number, number, number], [number, number, number], [number, number, number]];
export type Point2D = [number, number];
export type Triangle2D = [Point2D, Point2D, Point2D];

// ── 3D globe: the 24-face icosahedron (unit-sphere corner coordinates) ─
// Every face is a triangle with three corners at radius 1.0. Faces are
// duplicated at shared edges ("coplanar split vertices") so each face
// owns its own copy — this lets per-face attributes (e.g. aSpherePos)
// live on a non-indexed BufferGeometry without sharing.
//
// IMPORTANT: The order of these faces is load-bearing. PAL[] below is
// indexed by face number, as is FACE_SPHERE_POSITIONS, as is every
// per-face material the renderer builds. Reordering this array silently
// recolours the globe and misaligns textures.
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

// Derived from the array, not a literal — makes it impossible to add a
// face above without every downstream consumer picking it up automatically.
export const NUM_FACES = SPHERE3D.length;

// ── 2D net: the Dymaxion flat layout ─────────────────────────────────
// These are the flat-map coordinates BEFORE the calibration rotation and
// the fit-to-viewport scale (both applied below when constructing FLAT).
// The raw numbers are hand-authored so shared edges between faces sit
// exactly on top of each other — which is why a few entries reference
// named points (f14_A, f15_centroid, …) rather than writing the pair out
// again. If you move one, move its partner.
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

// One flat triangle per SPHERE3D entry, in the same order. Index parity
// between the two arrays is what makes per-face lookup work everywhere
// else in the codebase — do not reorder one without the other.
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

// ── Per-face debug colours ────────────────────────────────────────────
// Indexed by face number. 24 entries, one per SPHERE3D triangle. The
// '#8AA0CC' fallback in createFaceMaterials handles an out-of-range
// lookup, but if you add faces above, add colours here too or you'll
// see the fallback repeated.
export const PAL: string[] = [
  '#4A90D9', '#5BA85A', '#3AABBF', '#4A90D9', '#5BA85A',
  '#7DC46B', '#6CAF8E', '#5C8FD9', '#8AA0CC', '#7DC46B',
  '#6CAF8E', '#5C8FD9', '#8AA0CC', '#7DC46B',
  '#E8A838', '#E87050', '#6CAF8E', '#8AA0CC', '#5C8FD9',
  '#E8A838', '#E87050', '#E87050', '#E8A838', '#E8A838',
];

// ── Easing, bezier, per-face stagger ──────────────────────────────────
// Quadratic ease-in-out on [0, 1]. Used to soften the start and end of
// each segment transition so the fold doesn't "snap" at the joins.
export const ease = (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

/**
 * Quadratic Bezier: P0 (start) → P1 (end), pulled toward control C.
 * Note this is a QUADRATIC bezier (one control point), not cubic —
 * that's why the flare uses a single vertexControlMap entry per corner
 * instead of a pair of handles.
 */
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

/**
 * Per-face stagger. With staggerRatio=0 all faces animate in lockstep;
 * with staggerRatio>0 faces start their transition at slightly different
 * global times, producing a "wave" across the mesh. Both the mesh update
 * loop in icosahedron-globe.tsx AND updatePopulationPositions() call this,
 * so data points fold in sync with their host faces instead of trailing
 * or leading them.
 */
export function computeFaceT(globalT: number, faceIndex: number, numFaces: number, staggerRatio: number): number {
  const staggerStep = staggerRatio / (numFaces - 1);
  const oneMinusStagger = 1 - staggerRatio;
  const rawT = (globalT - faceIndex * staggerStep) / oneMinusStagger;
  return Math.max(0, Math.min(1, rawT));
}

// ── Vertex identity + flare control points ────────────────────────────
// SPHERE3D stores each shared edge corner twice (once per adjacent face,
// "coplanar split vertices"). To treat them as the same physical point
// we hash the rounded coordinates. Rounding to 1e-5 is tight enough to
// keep distinct vertices distinct and loose enough to absorb the decimal
// noise in the hand-authored literals.
export const vertexKey = (v: THREE.Vector3): string =>
  `${Math.round(v.x * 1e5)},${Math.round(v.y * 1e5)},${Math.round(v.z * 1e5)}`;

// Face-corner positions as THREE.Vector3 for consumers that prefer them
// over the raw number triples. Same indexing as SPHERE3D.
export const SPHERE: THREE.Vector3[][] = SPHERE3D.map((f: Triangle3D) =>
  f.map(([x, y, z]: [number, number, number]) => new THREE.Vector3(x, y, z))
);

// One bezier control point per UNIQUE corner position. Two corners that
// hash to the same vertexKey share the same control point — this is what
// keeps shared edges from splitting apart during the fold.
//
// The control point sits FLARE_AMOUNT further out along the corner's
// own unit normal, so the mid-fold shape bulges outward like an inflated
// balloon before settling into the flat net.
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

// ── FLAT: the Dymaxion net in world space ────────────────────────────
// FLAT2D → FLAT pipeline: (1) recentre on the net's centroid, (2) scale
// so the largest half-extent hits 1.65, (3) flip Y (2D y-down → 3D y-up),
// (4) rotate by -MAP_ROTATION_DEG around Z to get Fuller's calibration.
// Z is always 0: the flat net lies in the XY plane at the end of the fold.
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

// ── Subdivision level ─────────────────────────────────────────────────
// How many times each triangular face is split along each edge. Every
// face becomes N² sub-triangles, all sharing the outer A→B→C winding.
//
//    N=1 →   1 sub-tri/face (  24 total) — the raw icosahedron, polygonal
//    N=2 →   4 sub-tris/face ( 96 total) — visibly polygonal silhouette
//    N=4 →  16 sub-tris/face (384 total) ← current, minimum smooth silhouette
//    N=8 →  64 sub-tris/face (1536 total) — safe, well past the visible
//                                           angular-resolution threshold
//
// Changing this one constant updates BOTH SUB_BARY and
// FACE_SPHERE_POSITIONS, which is the whole point — they are a coupled
// invariant (same sub-vertices, same order) and desyncing them produces
// geometry that LOOKS right while its textures are silently wrong. Do
// not edit either array independently; edit this constant and let both
// regenerate.
export const SUBDIVISION_LEVEL = 8;

// ── Face subdivision barycentric weights ──────────────────────────────
// SUB_BARY is a flat list of triangle corners: every three consecutive
// entries form one sub-triangle, non-indexed. Each entry is a barycentric
// triple [w0, w1, w2] meaning sub-vertex = w0·A + w1·B + w2·C, where
// A/B/C are the parent face's three corners.
//
// Length is SUBDIVISION_LEVEL² × 3:
//    N=4 →  48 entries (16 sub-tris × 3 verts each)
//
// Base case (N=2) is the classic 1-level midpoint split:
//
//         A
//        / \
//      mAB─mCA
//      / \ / \
//     B──mBC──C
//
//   tri0: A,   mAB, mCA
//   tri1: mAB, B,   mBC
//   tri2: mCA, mBC, C
//   tri3: mAB, mBC, mCA   ← centre (same winding as outer three)
//
// General N: lay an N×N barycentric grid over the face. Each grid cell
// splits into an upward triangle and a downward triangle, both winding
// A→B→C:
//
//   Index:    P(i, j) = [ (N-i-j)/N , i/N , j/N ]
//   Upward:   P(i,j),   P(i+1,j),   P(i,j+1)
//   Downward: P(i+1,j), P(i+1,j+1), P(i,j+1)
//
// These weights apply uniformly to positions, control points, and any
// future per-vertex attribute — because every consumer treats a
// sub-vertex as a linear blend of the parent corners, the same bary
// triple works everywhere.
function makeSubBary(N: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const P = (i: number, j: number): [number, number, number] =>
    [(N - i - j) / N, i / N, j / N];

  // Upward-pointing triangles (base along the i-axis).
  for (let i = 0; i < N; i++) {
    for (let j = 0; j <= N - 1 - i; j++) {
      out.push(P(i, j), P(i + 1, j), P(i, j + 1));
    }
  }
  // Downward-pointing triangles, filling the remaining half of each cell.
  for (let i = 0; i < N - 1; i++) {
    for (let j = 0; j <= N - 2 - i; j++) {
      out.push(P(i + 1, j), P(i + 1, j + 1), P(i, j + 1));
    }
  }
  return out;
}

export const SUB_BARY: [number, number, number][] = makeSubBary(SUBDIVISION_LEVEL);

// ── Per-face sub-vertex positions on the unit sphere (static) ────────
// FACE_SPHERE_POSITIONS[fi] is a flat Float32Array of length
// SUB_BARY.length × 3, holding each sub-vertex's UNNORMALISED position:
// the barycentric blend of the face's three raw SPHERE3D corner coords.
//
// Two important properties:
//
//   1. It is COUPLED to SUB_BARY by index. Entry k of SUB_BARY describes
//      the same sub-vertex as floats [3k, 3k+1, 3k+2] here. Both are
//      generated from SUBDIVISION_LEVEL, so they cannot drift. Never
//      hand-edit one without regenerating the other.
//
//   2. It does NOT change with fold animation — it's the smooth-sphere
//      reference, not the current animated position. Consumers attach it
//      as a per-vertex attribute (aSpherePos) so the polar-safe texture
//      shader can compute exact lon/lat per fragment instead of
//      interpolating baked-per-vertex UVs, which would be wrong on the
//      two faces whose interiors contain a geographic pole.
export const FACE_SPHERE_POSITIONS: Float32Array[] = SPHERE3D.map((face) => {
  const arr = new Float32Array(SUB_BARY.length * 3);
  SUB_BARY.forEach(([w0, w1, w2], i) => {
    arr[i * 3]     = w0 * face[0][0] + w1 * face[1][0] + w2 * face[2][0];
    arr[i * 3 + 1] = w0 * face[0][1] + w1 * face[1][1] + w2 * face[2][1];
    arr[i * 3 + 2] = w0 * face[0][2] + w1 * face[1][2] + w2 * face[2][2];
  });
  return arr;
});

// ── Multi-stage animation model ───────────────────────────────────────
// The globe animates continuously through five discrete "stages"; the
// `stage` prop on IcosahedronGlobe is a float in [0, SEGMENT_COUNT] and
// fractional values scrub within a segment.
//
// A stage is a NAMED POSE — what shape the mesh holds, and whether the
// wireframe is drawn. Motion happens BETWEEN stages; the pair of rows
// you are standing between fully determines what animates.
//
//   STAGE                MESH    WIRES   segment
//   SPHERE               sphere  none    ─┐  0→1 : wires draw in
//   SPHERE_TRIANGULATED  sphere  full     │  1→2 : sphere facets outward
//   ICOSAHEDRON          facet   full     │  2→3 : facets unfold flat
//   DYMAXION             flat    full     │  3→4 : wires retract
//   WIRES_GONE           flat    none    ─┘
//
// Adjacent rows with the SAME mesh pose mean that segment is a pure
// wire beat (no shape change). Same wire pose means a pure shape beat.
// Reading the columns top-to-bottom IS the fold.
//
// Subdivision (SUB_BARY / FACE_SPHERE_POSITIONS) only affects the
// 'sphere' mesh pose. 'facet' and 'flat' use only the 3 original
// SPHERE3D corners per face (sub-vertices collapse onto the corners as
// the fold progresses). The wireframe is ALWAYS drawn from the 3
// original corners regardless of stage.
export type MeshPose = 'sphere' | 'facet' | 'flat';
export type WirePose = 'none' | 'full';

export interface StageDef {
  name: string;
  mesh: MeshPose;
  wires: WirePose;
}

export const STAGES: readonly StageDef[] = [
  { name: 'SPHERE',              mesh: 'sphere', wires: 'none' },
  { name: 'SPHERE_TRIANGULATED', mesh: 'sphere', wires: 'full' },
  { name: 'ICOSAHEDRON',         mesh: 'facet',  wires: 'full' },
  { name: 'DYMAXION',            mesh: 'flat',   wires: 'full' },
  { name: 'WIRES_GONE',          mesh: 'flat',   wires: 'none' },
] as const;

// Named index into STAGES. Kept as a lookup so consumers can write
// GLOBE_STAGES.DYMAXION instead of a bare 3.
export const GLOBE_STAGES = {
  SPHERE: 0,
  SPHERE_TRIANGULATED: 1,
  ICOSAHEDRON: 2,
  DYMAXION: 3,
  WIRES_GONE: 4,
} as const;

export const STAGE_COUNT = STAGES.length;
export const SEGMENT_COUNT = STAGE_COUNT - 1;

/**
 * Split a continuous stage value into (a) which animation segment is
 * active, and (b) the local 0..1 progress within that segment.
 *
 * Example: globalStageT = 1.4 → { segment: 1, localT: 0.4 } meaning
 * "40% of the way through the sphere→icosahedron inflation".
 *
 * `segment` indexes the row you are LEAVING; the transition is between
 * STAGES[segment] and STAGES[segment + 1]. `localT` is how far along
 * that transition you are.
 */
export function resolveSegment(globalStageT: number): { segment: number; localT: number } {
  const clamped = Math.max(0, Math.min(SEGMENT_COUNT, globalStageT));
  const segment = Math.min(SEGMENT_COUNT - 1, Math.floor(clamped));
  return { segment, localT: clamped - segment };
}