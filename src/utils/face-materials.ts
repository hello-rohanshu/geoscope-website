// utils/face-materials.ts
// Computes per-face UV coordinates from SPHERE3D vertices using the inverse
// Fuller calibration rotation, then builds Three.js materials for each face.
// Import createFaceMaterials() and pass an optional texture; without one it
// falls back to the PAL debug palette so the globe still works during dev.

import * as THREE from 'three';
import { geoRotation } from 'd3';
import { SPHERE3D, PAL, NUM_FACES, SUB_BARY } from './icosahedron-geometry';

const FULLER_CALIBRATION_ROTATION: [number, number, number] = [-83.65929, 25.44458, -87.45184];
const invertRotate = geoRotation(FULLER_CALIBRATION_ROTATION).invert;

// ── XYZ → real-world lon/lat (degrees) via inverse Fuller rotation ─────
function xyzToLonLat(x: number, y: number, z: number): [number, number] {
  // Normalize the vector before computing latitude — `asin` requires a unit vector,
  // otherwise the latitude will be wrong for non-unit inputs. Longitude uses atan2
  // which is scale-invariant, so only latitude needs this correction.
  const mag = Math.sqrt(x * x + y * y + z * z);
  const lat = Math.asin(Math.max(-1, Math.min(1, z / mag))) * (180 / Math.PI);
  const lon = Math.atan2(y, x) * (180 / Math.PI);
  return invertRotate([lon, lat]) as [number, number];
}

// ── lon/lat → equirectangular UV ──────────────────────────────────────
function lonLatToUV(lon: number, lat: number): [number, number] {
  const u = (lon + 180) / 360;
  const v = (90 + lat) / 180;
  return [u, v];
}

// ── Helpers for pole handling ─────────────────────────────────────────
const POLE_EPS = 1e-6;
const isPole = (v: readonly [number, number, number]) =>
  Math.abs(v[0]) < POLE_EPS && Math.abs(v[1]) < POLE_EPS;

// SUB_BARY indices that are exact corners A, B, C, and each corner's two
// adjacent edge-midpoint sub-vertices (see the SUB_BARY diagram/comment).
const CORNER_SUBVERTEX = [0, 4, 8];
const CORNER_NEIGHBORS: [number, number][] = [
  [1, 2], // A's neighbors: mAB, mCA
  [1, 5], // B's neighbors: mAB, mBC
  [2, 5], // C's neighbors: mCA, mBC
];

// ── Per-face UV arrays (precomputed once at module load) ──────────────
// After subdivision each face has 12 sub-vertices (4 sub-triangles × 3,
// non-indexed). Each sub-vertex's true 3D position is computed by
// barycentric blending the parent corners, then radially projected back
// onto the unit sphere before converting to lon/lat → UV. This captures
// the nonlinearity of the projection across the face that linear
// interpolation of corner UVs cannot.
//
// Important: longitudes are *unwrapped* relative to the first sub-vertex
// of each face, so the whole face maps to a single continuous strip in UV
// space regardless of how many times it would otherwise cross the
// antimeridian. Additionally, if a corner is exactly at the pole
// (longitude undefined), we replace its arbitrary `atan2(0,0)` longitude
// with the average of the two adjacent non‑degenerate sub‑vertices.
export const FACE_UVS: Float32Array[] = SPHERE3D.map((face) => {
  // Compute lon/lat for all 12 sub-vertices using normalized barycentric positions.
  const lonLats: [number, number][] = SUB_BARY.map(([w0, w1, w2]) => {
    const x = w0 * face[0][0] + w1 * face[1][0] + w2 * face[2][0];
    const y = w0 * face[0][1] + w1 * face[1][1] + w2 * face[2][1];
    const z = w0 * face[0][2] + w1 * face[1][2] + w2 * face[2][2];
    const mag = Math.sqrt(x * x + y * y + z * z);
    return xyzToLonLat(x / mag, y / mag, z / mag);
  });

  // Unwrap relative to the first sub-vertex so the face sits on one
  // continuous strip (previous fix — still needed).
  const refLon = lonLats[0][0];
  const unwrapped: [number, number][] = lonLats.map(([lon, lat]) => {
    let d = lon - refLon;
    d = ((d + 180) % 360 + 360) % 360 - 180;
    return [refLon + d, lat];
  });

  // A corner that IS the pole has an undefined/arbitrary longitude.
  // Replace it with the average of its two real, non-degenerate
  // neighboring sub-vertices instead of trusting atan2(0,0).
  CORNER_SUBVERTEX.forEach((subIdx, cornerI) => {
    if (isPole(face[cornerI])) {
      const [n1, n2] = CORNER_NEIGHBORS[cornerI];
      unwrapped[subIdx][0] = (unwrapped[n1][0] + unwrapped[n2][0]) / 2;
    }
  });

  const arr = new Float32Array(24);
  unwrapped.forEach(([lon, lat], i) => {
    const [u, v] = lonLatToUV(lon, lat);
    arr[i * 2] = u;
    arr[i * 2 + 1] = v;
  });
  return arr;
});

// ── Layer types ───────────────────────────────────────────────────────
// BaseLayerMode drives what createFaceMaterials returns.
// 'debug'   → solid PAL colors, no texture (useful during dev)
// 'texture' → equirectangular texture with computed UVs
// 'white'   → flat white (useful as a base under colored overlays later)
export type BaseLayerMode = 'debug' | 'texture' | 'white';

export interface FaceMaterialsOptions {
  mode?: BaseLayerMode;
  texture?: THREE.Texture;   // required when mode === 'texture'
  opacity?: number;
}

// ── Main export ───────────────────────────────────────────────────────
/**
 * Returns one THREE.Material per face (length = NUM_FACES).
 * Call once on init; dispose the old array if you hot-swap modes.
 *
 * The returned materials are owned by the caller — dispose them when
 * removing or replacing the globe.
 */
export function createFaceMaterials(opts: FaceMaterialsOptions = {}): THREE.Material[] {
  const { mode = 'debug', texture, opacity = 0.88 } = opts;

  return Array.from({ length: NUM_FACES }, (_, fi) => {
    // ── debug: solid color per face ───────────────────────────────────
    if (mode === 'debug' || (mode === 'texture' && !texture)) {
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(PAL[fi] ?? '#8AA0CC'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
    }

    // ── white base ────────────────────────────────────────────────────
    if (mode === 'white') {
      return new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
    }

    // ── texture mode ──────────────────────────────────────────────────
    // UVs are set once on the mesh geometry via applyFaceUVs(); the
    // material just needs the texture map. See icosahedron-globe.tsx.
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity,
    });
    return mat;
  });
}

/**
 * Write the precomputed subdivided UVs into a mesh's BufferGeometry.
 * The geometry must already have a position buffer sized for 12 vertices
 * (Float32Array(36)) — call this after creating the subdivided geometry,
 * before the first render. Safe to call again on texture swap (UVs are
 * mode-independent).
 */
export function applyFaceUVs(geometry: THREE.BufferGeometry, faceIndex: number): void {
  const uvs = FACE_UVS[faceIndex];
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs.slice(), 2));
}