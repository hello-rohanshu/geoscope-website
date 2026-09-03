// utils/face-materials.ts
// Builds Three.js materials for each face. 'texture' mode uses a shader
// that computes lon/lat -> UV per FRAGMENT (not per vertex), because two
// faces (8 and 13) have the true geographic pole inside their interior —
// not at any icosahedron vertex, since the Fuller calibration rotation
// deliberately moves the icosahedron's own singular vertices into oceans.
// A pole inside a face's interior means real-world longitude sweeps almost
// the full 360° within that one triangle; no per-vertex UV baked and then
// linearly interpolated can represent that, no matter how it's unwrapped.
// Per-fragment computation has no such limit — every pixel is independently
// exact.
//
// Antimeridian seam fix: the UV derivative spikes at the atan2 wraparound,
// causing the GPU to pick a near-flattened high mip level exactly along the
// seam. We now compute derivatives manually and zero out the u-component
// spike, so textureGrad samples the correct mip level everywhere.

import * as THREE from 'three';
import { geoRotation } from 'd3';
import { PAL, NUM_FACES, FACE_SPHERE_POSITIONS } from './icosahedron-geometry';

const FULLER_CALIBRATION_ROTATION: [number, number, number] = [-83.65929, 25.44458, -87.45184];
const invertRotate = geoRotation(FULLER_CALIBRATION_ROTATION).invert;

// ── Fuller rotation as a 3x3 matrix (GLSL-portable) ────────────────────
// geoRotation only exists in JS. Bake the identical rotation into a matrix
// once, by rotating the three local basis directions through invertRotate —
// verified to reproduce the old atan2-then-invertRotate lon/lat exactly.
function computeFullerRotationMatrix(): THREE.Matrix3 {
  const toXYZ = (lon: number, lat: number): [number, number, number] => {
    const lr = (lon * Math.PI) / 180, pr = (lat * Math.PI) / 180;
    const c = Math.cos(pr);
    return [c * Math.cos(lr), c * Math.sin(lr), Math.sin(pr)];
  };
  const col = (lon: number, lat: number) => toXYZ(...(invertRotate([lon, lat]) as [number, number]));
  const c0 = col(0, 0);   // local +X
  const c1 = col(90, 0);  // local +Y
  const c2 = col(0, 90);  // local +Z
  return new THREE.Matrix3().set(
    c0[0], c1[0], c2[0],
    c0[1], c1[1], c2[1],
    c0[2], c1[2], c2[2],
  );
}
const FULLER_ROTATION_MATRIX = computeFullerRotationMatrix();

// ── Polar-safe shader: lon/lat computed per fragment ───────────────────
const POLAR_SAFE_VERTEX_SHADER = `
  in vec3 aSpherePos;
  out vec3 vSpherePos;
  void main() {
    vSpherePos = aSpherePos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const POLAR_SAFE_FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D map;
  uniform mat3 fullerRotation;
  uniform float opacity;
  in vec3 vSpherePos;
  out vec4 outColor;

  void main() {
    vec3 p = normalize(fullerRotation * normalize(vSpherePos));
    float lat = asin(clamp(p.z, -1.0, 1.0));
    float lon = atan(p.y, p.x);
    float u = (lon + 3.14159265358979) / 6.28318530717959;
    float v = (1.57079632679490 + lat) / 3.14159265358979;
    vec2 uv = vec2(u, v);

    vec2 dx = dFdx(uv);
    vec2 dy = dFdy(uv);
    // atan2's wrap makes du/dx or du/dy spike to ~1.0 across the
    // antimeridian even though neighboring fragments are a texel apart.
    // Zero the spike so the seam column gets sampled like any other pixel
    // instead of falling back to a near-flattened high mip level.
    if (abs(dx.x) > 0.5) dx.x = 0.0;
    if (abs(dy.x) > 0.5) dy.x = 0.0;

    vec4 texColor = textureGrad(map, uv, dx, dy);
    outColor = vec4(texColor.rgb, texColor.a * opacity);
  }
`;

function createPolarSafeMaterial(texture: THREE.Texture, opacity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      fullerRotation: { value: FULLER_ROTATION_MATRIX },
      opacity: { value: opacity },
    },
    vertexShader: POLAR_SAFE_VERTEX_SHADER,
    fragmentShader: POLAR_SAFE_FRAGMENT_SHADER,
    glslVersion: THREE.GLSL3,
    side: THREE.DoubleSide,
    transparent: false,
  });
}

// ── Layer types ───────────────────────────────────────────────────────
export type BaseLayerMode = 'debug' | 'texture' | 'white';

export interface FaceMaterialsOptions {
  mode?: BaseLayerMode;
  texture?: THREE.Texture;
  opacity?: number;
}

// ── Main export ───────────────────────────────────────────────────────
export function createFaceMaterials(opts: FaceMaterialsOptions = {}): THREE.Material[] {
  const { mode = 'debug', texture, opacity = 0.88 } = opts;

  return Array.from({ length: NUM_FACES }, (_, fi) => {
    if (mode === 'debug' || (mode === 'texture' && !texture)) {
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(PAL[fi] ?? '#8AA0CC'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
    }

    if (mode === 'white') {
      return new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
    }

    return createPolarSafeMaterial(texture!, opacity);
  });
}

/**
 * Attach the static per-face sphere-space sub-vertex positions as a custom
 * attribute — replaces the old baked-UV attribute. Doesn't change with fold
 * animation, so it's set once at geometry creation.
 */
export function applyFaceSphereAttribute(geometry: THREE.BufferGeometry, faceIndex: number): void {
  geometry.setAttribute('aSpherePos', new THREE.BufferAttribute(FACE_SPHERE_POSITIONS[faceIndex].slice(), 3));
}