// utils/face-materials.ts
// Computes per-face UV coordinates from SPHERE3D vertices using the inverse
// Fuller calibration rotation, then builds Three.js materials for each face.
// Import createFaceMaterials() and pass an optional texture; without one it
// falls back to the PAL debug palette so the globe still works during dev.

import * as THREE from 'three';
import { geoRotation } from 'd3';
import { SPHERE3D, PAL, NUM_FACES } from './icosahedron-geometry';

const FULLER_CALIBRATION_ROTATION: [number, number, number] = [-83.65929, 25.44458, -87.45184];
const invertRotate = geoRotation(FULLER_CALIBRATION_ROTATION).invert;

// ── XYZ → real-world lon/lat (degrees) via inverse Fuller rotation ─────
function xyzToLonLat(x: number, y: number, z: number): [number, number] {
  const lat = Math.asin(Math.max(-1, Math.min(1, z))) * (180 / Math.PI);
  const lon = Math.atan2(y, x) * (180 / Math.PI);
  return invertRotate([lon, lat]) as [number, number];
}

// ── lon/lat → equirectangular UV ──────────────────────────────────────
function lonLatToUV(lon: number, lat: number): [number, number] {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  return [u, v];
}

// ── Antimeridian seam fix ─────────────────────────────────────────────
// If a face has vertices whose u values span more than 0.5 (i.e. one side
// is near u=0 and another near u=1), the interpolation will pull across
// the wrong half of the texture. Fix: shift any u < 0.5 up by +1 so all
// three vertices are on the same side of the seam.
function fixSeam(uvs: [number, number][]): [number, number][] {
  const us = uvs.map(([u]) => u);
  const maxU = Math.max(...us);
  const minU = Math.min(...us);
  if (maxU - minU > 0.5) {
    return uvs.map(([u, v]) => [u < 0.5 ? u + 1 : u, v]);
  }
  return uvs;
}

// ── Per-face UV arrays (precomputed once at module load) ──────────────
// Each face: 3 vertices × 2 floats = Float32Array(6)
// Stored as flat [u0,v0, u1,v1, u2,v2] matching SPHERE3D vertex order.
export const FACE_UVS: Float32Array[] = SPHERE3D.map((face) => {
  const rawUVs = face.map(([x, y, z]) => lonLatToUV(...xyzToLonLat(x, y, z)));
  const fixed = fixSeam(rawUVs);
  const arr = new Float32Array(6);
  fixed.forEach(([u, v], i) => {
    arr[i * 2]     = u;
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
    // Build a tiny BufferGeometry just to carry the UV attribute.
    // The actual position data lives in the globe mesh and is updated
    // every frame; UVs are static so we set them once here and attach
    // them via the material's onBeforeCompile is NOT needed — instead
    // we set the UV on the mesh geometry directly in icosahedron-globe.
    // This function returns the material; the caller must also call
    // applyFaceUVs() on the mesh geometries (see below).
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
 * Write the precomputed UVs into a mesh's BufferGeometry.
 * Call once per face mesh after creating it, before the first render.
 * Safe to call again if you swap textures (UVs don't change with mode).
 */
export function applyFaceUVs(geometry: THREE.BufferGeometry, faceIndex: number): void {
  const uvs = FACE_UVS[faceIndex];
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs.slice(), 2));
}