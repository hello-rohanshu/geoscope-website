// utils/starfield.ts
// Self-contained starfield backdrop with subtle parallax for the globe scene.

import * as THREE from 'three';

export interface StarfieldOptions {
  count?: number;
  radius?: number;
  size?: number;
  opacity?: number;
  color?: string;
  parallaxStrength?: number;
}

export interface Starfield {
  points: THREE.Points;
  baseRotation: THREE.Euler;
  options: StarfieldOptions;
}

export function createStarfield(
  scene: THREE.Scene,
  options: StarfieldOptions = {}
): Starfield {
  const {
    count = 2000,
    radius = 20,
    size = 0.015,
    opacity = 0.8,
    color = '#ffffff',
    parallaxStrength = 0.02,
  } = options;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Random point on sphere surface, pushed out to radius with slight variation
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.85 + Math.random() * 0.3);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'starfield';
  scene.add(points);

  return {
    points,
    baseRotation: new THREE.Euler(0, 0, 0),
    options,
  };
}

export function updateStarfieldParallax(
  starfield: Starfield,
  mouseX: number, // normalized -1 to 1
  mouseY: number  // normalized -1 to 1
): void {
  const { points, options } = starfield;
  const strength = options.parallaxStrength ?? 0.02;

  // Subtle opposite rotation to globe for depth effect
  points.rotation.x = -mouseY * strength;
  points.rotation.y = -mouseX * strength;
}

export function disposeStarfield(starfield: Starfield): void {
  starfield.points.geometry.dispose();
  (starfield.points.material as THREE.Material).dispose();
  starfield.points.removeFromParent();
}