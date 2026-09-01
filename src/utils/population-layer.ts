// utils/population-layer.ts
// Bulk path for rendering raster samples as a single THREE.Points object
// inside the same scene group as the mesh, animated by the identical
// fold/unfold bezier — no Vector3 allocation in the per-frame hot loop.

import * as THREE from 'three';
import { SPHERE, FLAT, vertexControlMap, vertexKey, ease, computeFaceT, NUM_FACES } from './icosahedron-geometry';
import { lonLatToFaceUV } from './lonLatToFaceUV';
import { getRasterDimensions, getValueAtIndex, getLonLatForIndex } from './raster-engine';

export interface PopulationSample {
  lon: number;
  lat: number;
}

export interface PopulationBuffers {
  count: number;
  sphere: Float32Array; // xyz per point
  flat: Float32Array;
  ctrl: Float32Array;
  faceIndex: Uint8Array;
  positions: Float32Array; // live buffer, fed to BufferGeometry
}

/** Pull every raster cell with value > 0 into plain lon/lat samples — same "true presence" test as before. */
export function sampleRasterPresence(maxSamples = Infinity): PopulationSample[] {
  const { width, height } = getRasterDimensions();
  const total = width * height;
  const samples: PopulationSample[] = [];
  for (let i = 0; i < total && samples.length < maxSamples; i++) {
    if (getValueAtIndex(i) <= 0) continue;
    const [lon, lat] = getLonLatForIndex(i);
    samples.push({ lon, lat });
  }
  return samples;
}

/** One-time cost: resolve every sample to a face + barycentric weights, then bake the three animation anchors (sphere/flat/control) as flat typed arrays. */
export function buildPopulationBuffers(samples: PopulationSample[]): PopulationBuffers {
  const count = samples.length;
  const sphere = new Float32Array(count * 3);
  const flat = new Float32Array(count * 3);
  const ctrl = new Float32Array(count * 3);
  const faceIndex = new Uint8Array(count);
  const positions = new Float32Array(count * 3);

  let written = 0;
  for (const { lon, lat } of samples) {
    const placement = lonLatToFaceUV(lon, lat);
    if (!placement) continue; // not expected to trigger — defensive only

    const [wA, wB, wC] = placement.weights;
    const sv = SPHERE[placement.faceIndex];
    const fv = FLAT[placement.faceIndex];
    const cpA = vertexControlMap.get(vertexKey(sv[0]))!;
    const cpB = vertexControlMap.get(vertexKey(sv[1]))!;
    const cpC = vertexControlMap.get(vertexKey(sv[2]))!;

    const i3 = written * 3;
    sphere[i3] = sv[0].x * wA + sv[1].x * wB + sv[2].x * wC;
    sphere[i3 + 1] = sv[0].y * wA + sv[1].y * wB + sv[2].y * wC;
    sphere[i3 + 2] = sv[0].z * wA + sv[1].z * wB + sv[2].z * wC;

    flat[i3] = fv[0].x * wA + fv[1].x * wB + fv[2].x * wC;
    flat[i3 + 1] = fv[0].y * wA + fv[1].y * wB + fv[2].y * wC;
    flat[i3 + 2] = fv[0].z * wA + fv[1].z * wB + fv[2].z * wC;

    ctrl[i3] = cpA.x * wA + cpB.x * wB + cpC.x * wC;
    ctrl[i3 + 1] = cpA.y * wA + cpB.y * wB + cpC.y * wC;
    ctrl[i3 + 2] = cpA.z * wA + cpB.z * wB + cpC.z * wC;

    faceIndex[written] = placement.faceIndex;
    written++;
  }

  // If any samples were dropped, trim the typed arrays to the written length.
  if (written === count) return { count, sphere, flat, ctrl, faceIndex, positions };
  return {
    count: written,
    sphere: sphere.slice(0, written * 3),
    flat: flat.slice(0, written * 3),
    ctrl: ctrl.slice(0, written * 3),
    faceIndex: faceIndex.slice(0, written),
    positions: positions.slice(0, written * 3),
  };
}

/** Per-frame: write animated positions straight into the typed array — no allocation. Caller sets geometry.attributes.position.needsUpdate = true afterward. */
export function updatePopulationPositions(
  buffers: PopulationBuffers,
  globalT: number,
  staggerRatio: number,
  numFaces: number = NUM_FACES
): void {
  const { count, sphere, flat, ctrl, faceIndex, positions } = buffers;
  for (let i = 0; i < count; i++) {
    const faceT = computeFaceT(globalT, faceIndex[i], numFaces, staggerRatio);
    const et = ease(faceT);
    const mt = 1 - et;
    const a = mt * mt, b = 2 * mt * et, c = et * et;
    const i3 = i * 3;
    positions[i3] = a * sphere[i3] + b * ctrl[i3] + c * flat[i3];
    positions[i3 + 1] = a * sphere[i3 + 1] + b * ctrl[i3 + 1] + c * flat[i3 + 1];
    positions[i3 + 2] = a * sphere[i3 + 2] + b * ctrl[i3 + 2] + c * flat[i3 + 2];
  }
}

export function createPopulationPoints(
  buffers: PopulationBuffers,
  options?: { color?: string; size?: number; opacity?: number }
): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(buffers.positions, 3));
  const material = new THREE.PointsMaterial({
    color: new THREE.Color(options?.color ?? '#ff3b3b'),
    size: options?.size ?? 0.012,
    sizeAttenuation: true,
    transparent: true,
    opacity: options?.opacity ?? 0.35,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}