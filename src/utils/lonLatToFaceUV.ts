// utils/lonLatToFaceUV.ts
// Maps a real-world (lon, lat) to one of the 24 icosahedron faces and its
// barycentric position within it. Verified against d3-geo-polygon's actual
// geoAirocean() face-containment test on 5 cities plus a full-globe sweep.

import * as THREE from 'three';
import { SPHERE, FLAT, vertexControlMap, vertexKey, bezier3, ease, computeFaceT, NUM_FACES } from './icosahedron-geometry';
import { geoRotation } from 'd3';

/**
 * Fuller's calibration rotation that aligns this 24-face arrangement with
 * real Earth geography — lifted from d3-geo-polygon's airocean.js (Jason
 * Davies / Enrico Spinielli / Philippe Rivière, after Robert W. Gray).
 * SPHERE3D itself is that library's raw polyhedron table BEFORE this
 * rotation, so any real lon/lat has to pass through it first.
 */
const FULLER_CALIBRATION_ROTATION: [number, number, number] = [-83.65929, 25.44458, -87.45184];
const preRotate = geoRotation(FULLER_CALIBRATION_ROTATION);

export interface FacePlacement {
  faceIndex: number;
  weights: [number, number, number]; // barycentric wrt SPHERE[faceIndex][0..2]
}

function invert3(m: number[][]): number[][] {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const D = -(b * i - c * h), E = a * i - c * g, F = -(a * h - b * g);
  const G = b * f - c * e, H = -(a * f - c * d), I = a * e - b * d;
  const det = a * A + b * B + c * C;
  return [[A / det, D / det, G / det], [B / det, E / det, H / det], [C / det, F / det, I / det]];
}

function matVec(m: number[][], v: [number, number, number]): [number, number, number] {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

// Precompute the inverse of [A B C] (as columns) for every face once.
const faceInverses: number[][][] = SPHERE.map(([A, B, C]) =>
  invert3([[A.x, B.x, C.x], [A.y, B.y, C.y], [A.z, B.z, C.z]])
);

function lonLatToUnitVector(lon: number, lat: number): [number, number, number] {
  const [rlon, rlat] = preRotate([lon, lat]);
  const lr = (rlon * Math.PI) / 180;
  const pr = (rlat * Math.PI) / 180;
  const c = Math.cos(pr);
  return [c * Math.cos(lr), c * Math.sin(lr), Math.sin(pr)];
}

function clampBarycentric([u, v, w]: [number, number, number]): [number, number, number] {
  const cu = Math.max(0, u), cv = Math.max(0, v), cw = Math.max(0, w);
  const s = cu + cv + cw || 1;
  return [cu / s, cv / s, cw / s];
}

/**
 * Find which face a real (lon, lat) falls on, and its barycentric weights
 * within that face's flat (chord) triangle — matching how the mesh itself
 * is rendered, not the curved sphere. Swept clean at 1° globally and 0.02°
 * around both flattened split-vertices; the EPS fallback below is defensive,
 * not something the current geometry is known to need.
 */
export function lonLatToFaceUV(lon: number, lat: number): FacePlacement | null {
  const p = lonLatToUnitVector(lon, lat);
  const EPS = -1e-9;

  let fallback: FacePlacement | null = null;
  let fallbackScore = -Infinity;

  for (let fi = 0; fi < faceInverses.length; fi++) {
    const x = matVec(faceInverses[fi], p);
    const s = x[0] + x[1] + x[2];
    const t = 1 / s; // must be > 0: the point's forward ray, not its antipode, hits this face
    if (t <= 0) continue;
    const weights: [number, number, number] = [x[0] / s, x[1] / s, x[2] / s];
    const minW = Math.min(...weights);
    if (minW >= EPS) return { faceIndex: fi, weights: clampBarycentric(weights) };
    if (minW > fallbackScore) {
      fallbackScore = minW;
      fallback = { faceIndex: fi, weights: clampBarycentric(weights) };
    }
  }
  return fallback;
}

/**
 * Convenience for occasional/low-volume use (a single marker, a labeled
 * city) — computes the animated position via THREE.Vector3, same bezier
 * path as the mesh vertices. For bulk data (thousands+ points updated every
 * frame) use population-layer.ts instead, which skips Vector3 allocation.
 */
export function placementToVector3(
  placement: FacePlacement,
  t: number,
  staggerRatio: number,
  numFaces: number = NUM_FACES
): THREE.Vector3 {
  const { faceIndex, weights } = placement;
  const [wA, wB, wC] = weights;
  const sphereVerts = SPHERE[faceIndex];
  const flatVerts = FLAT[faceIndex];

  const spherePos = new THREE.Vector3()
    .addScaledVector(sphereVerts[0], wA)
    .addScaledVector(sphereVerts[1], wB)
    .addScaledVector(sphereVerts[2], wC);

  const flatPos = new THREE.Vector3()
    .addScaledVector(flatVerts[0], wA)
    .addScaledVector(flatVerts[1], wB)
    .addScaledVector(flatVerts[2], wC);

  const cpA = vertexControlMap.get(vertexKey(sphereVerts[0]))!;
  const cpB = vertexControlMap.get(vertexKey(sphereVerts[1]))!;
  const cpC = vertexControlMap.get(vertexKey(sphereVerts[2]))!;
  const controlPoint = new THREE.Vector3()
    .addScaledVector(cpA, wA)
    .addScaledVector(cpB, wB)
    .addScaledVector(cpC, wC);

  const faceT = computeFaceT(t, faceIndex, numFaces, staggerRatio);
  return bezier3(spherePos, flatPos, controlPoint, ease(faceT));
}