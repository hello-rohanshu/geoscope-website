// utils/overlay-layer.ts
// Bulk path for rendering raster samples as a single THREE.Points object
// inside the same scene group as the mesh, animated by the identical
// fold/unfold bezier — no Vector3 allocation in the per-frame hot loop.

import * as THREE from 'three';
import {
  SPHERE, FLAT, vertexControlMap, vertexKey, ease, computeFaceT, NUM_FACES,
  resolveSegment, STAGES,
} from './icosahedron-geometry';
import { lonLatToFaceUV } from './lonLatToFaceUV';
import { getRasterDimensions, getValueAtIndex, getLonLatForIndex } from './raster-engine';

export interface OverlaySample {
  lon: number;
  lat: number;
}

export interface OverlayBuffers {
  count: number;
  smoothSphere: Float32Array; // smooth-sphere anchor: barycentric blend normalized × 1.003
  sphere: Float32Array;       // faceted anchor: barycentric blend × 1.003
  flat: Float32Array;
  ctrl: Float32Array;
  faceIndex: Uint8Array;
  positions: Float32Array;
}

export interface CollectOptions {
  rasterId: string;
  threshold?: number;
  maxSamples?: number;
  stride?: number;
}

/** Pull every raster cell with value > threshold into plain lon/lat samples. */
export function collectRasterSamples(opts: CollectOptions): OverlaySample[] {
  const { rasterId, threshold = 0, maxSamples = Infinity, stride = 1 } = opts;
  const { width, height } = getRasterDimensions(rasterId);
  const samples: OverlaySample[] = [];
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = y * width + x;
      if (getValueAtIndex(rasterId, i) <= threshold) continue;
      const [lon, lat] = getLonLatForIndex(rasterId, i);
      samples.push({ lon, lat });
      if (samples.length >= maxSamples) return samples;
    }
  }
  return samples;
}

/** One-time: resolve every sample to a face + barycentric weights, bake all four anchors. */
export function buildOverlayBuffers(samples: OverlaySample[]): OverlayBuffers {
  const count = samples.length;
  const smoothSphere = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const flat = new Float32Array(count * 3);
  const ctrl = new Float32Array(count * 3);
  const faceIndex = new Uint8Array(count);
  const positions = new Float32Array(count * 3);

  const SPHERE_OFFSET = 1.003;

  let written = 0;
  for (const { lon, lat } of samples) {
    const placement = lonLatToFaceUV(lon, lat);
    if (!placement) continue;

    const [wA, wB, wC] = placement.weights;
    const sv = SPHERE[placement.faceIndex];
    const fv = FLAT[placement.faceIndex];
    const cpA = vertexControlMap.get(vertexKey(sv[0]))!;
    const cpB = vertexControlMap.get(vertexKey(sv[1]))!;
    const cpC = vertexControlMap.get(vertexKey(sv[2]))!;

    const i3 = written * 3;

    // Barycentric blend of the raw sphere corners = the faceted "chord" point.
    const bx = sv[0].x * wA + sv[1].x * wB + sv[2].x * wC;
    const by = sv[0].y * wA + sv[1].y * wB + sv[2].y * wC;
    const bz = sv[0].z * wA + sv[1].z * wB + sv[2].z * wC;

    // Faceted anchor — chord point pushed out along its own direction.
    sphere[i3] = bx * SPHERE_OFFSET;
    sphere[i3 + 1] = by * SPHERE_OFFSET;
    sphere[i3 + 2] = bz * SPHERE_OFFSET;

    // Smooth-sphere anchor — same chord point re-projected onto the sphere.
    const bl = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
    smoothSphere[i3] = (bx / bl) * SPHERE_OFFSET;
    smoothSphere[i3 + 1] = (by / bl) * SPHERE_OFFSET;
    smoothSphere[i3 + 2] = (bz / bl) * SPHERE_OFFSET;

    flat[i3] = fv[0].x * wA + fv[1].x * wB + fv[2].x * wC;
    flat[i3 + 1] = fv[0].y * wA + fv[1].y * wB + fv[2].y * wC;
    flat[i3 + 2] = fv[0].z * wA + fv[1].z * wB + fv[2].z * wC + 0.003;

    ctrl[i3] = cpA.x * wA + cpB.x * wB + cpC.x * wC;
    ctrl[i3 + 1] = cpA.y * wA + cpB.y * wB + cpC.y * wC;
    ctrl[i3 + 2] = cpA.z * wA + cpB.z * wB + cpC.z * wC;

    faceIndex[written] = placement.faceIndex;
    written++;
  }

  if (written === count) {
    return { count, smoothSphere, sphere, flat, ctrl, faceIndex, positions };
  }
  return {
    count: written,
    smoothSphere: smoothSphere.slice(0, written * 3),
    sphere: sphere.slice(0, written * 3),
    flat: flat.slice(0, written * 3),
    ctrl: ctrl.slice(0, written * 3),
    faceIndex: faceIndex.slice(0, written),
    positions: positions.slice(0, written * 3),
  };
}

/**
 * Per-frame: write animated positions straight into the typed array — no allocation.
 * Reads the same STAGES row pair the mesh reads, so the overlay and the
 * faces it sits on stay locked together through every segment. Behavior
 * is decided by the pair of mesh poses, not by a segment index:
 *   sphere -> sphere : hold smooth sphere (static)
 *   sphere -> facet  : lerp smooth sphere -> faceted anchor
 *   facet  -> flat   : bezier faceted anchor -> ctrl -> dymaxion flat
 *   flat   -> flat   : hold flat (static — the wire-retract segment)
 * Adjacent equal poses mean this segment is a pure wire beat, so the
 * overlay must hold position instead of replaying the fold.
 */
export function updateOverlayPositions(
  buffers: OverlayBuffers,
  globalStageT: number,
  staggerRatio: number,
  numFaces: number = NUM_FACES
): void {
  const { count, smoothSphere, sphere, flat, ctrl, faceIndex, positions } = buffers;
  const { segment, localT } = resolveSegment(globalStageT);

  // Row pair for this frame — identical logic to updateGeometry() in
  // icosahedron-globe.tsx. If the mesh holds a pose, the overlay holds it too.
  const rowA = STAGES[segment];
  const rowB = STAGES[segment + 1];
  const meshMotion = `${rowA.mesh}->${rowB.mesh}`;
  const holdPose = rowA.mesh === rowB.mesh;

  for (let i = 0; i < count; i++) {
    const faceT = computeFaceT(localT, faceIndex[i], numFaces, staggerRatio);
    const et = holdPose ? 1 : ease(faceT);
    const i3 = i * 3;

    switch (meshMotion) {
      case 'sphere->sphere':
        positions[i3] = smoothSphere[i3];
        positions[i3 + 1] = smoothSphere[i3 + 1];
        positions[i3 + 2] = smoothSphere[i3 + 2];
        break;

      case 'sphere->facet': {
        const mt = 1 - et;
        positions[i3] = mt * smoothSphere[i3] + et * sphere[i3];
        positions[i3 + 1] = mt * smoothSphere[i3 + 1] + et * sphere[i3 + 1];
        positions[i3 + 2] = mt * smoothSphere[i3 + 2] + et * sphere[i3 + 2];
        break;
      }

      case 'flat->flat':
        positions[i3] = flat[i3];
        positions[i3 + 1] = flat[i3 + 1];
        positions[i3 + 2] = flat[i3 + 2];
        break;

      default: { // 'facet->flat'
        const mt = 1 - et;
        const a = mt * mt, b = 2 * mt * et, c = et * et;
        positions[i3] = a * sphere[i3] + b * ctrl[i3] + c * flat[i3];
        positions[i3 + 1] = a * sphere[i3 + 1] + b * ctrl[i3 + 1] + c * flat[i3 + 1];
        positions[i3 + 2] = a * sphere[i3 + 2] + b * ctrl[i3 + 2] + c * flat[i3 + 2];
        break;
      }
    }
  }
}

export function createOverlayPoints(
  buffers: OverlayBuffers,
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
  const points = new THREE.Points(geometry, material);
  points.renderOrder = 1;
  return points;
}