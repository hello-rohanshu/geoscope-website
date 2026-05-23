// app/components/landmass-overlay.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGlobeContext } from "./icosahedron-globe";
import type { DymaxionPath } from "./dymaxion-paths";

// ── Barycentric utilities ─────────────────────────────────────────────

function toBarycentric(
  p: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3
): [number, number, number] {
  const v0 = b.clone().sub(a);
  const v1 = c.clone().sub(a);
  const v2 = p.clone().sub(a);
  const d00 = v0.dot(v0);
  const d01 = v0.dot(v1);
  const d11 = v1.dot(v1);
  const d20 = v2.dot(v0);
  const d21 = v2.dot(v1);
  const denom = d00 * d11 - d01 * d01;
  if (Math.abs(denom) < 0.0001) return [1, 0, 0];
  const v = (d11 * d20 - d01 * d21) / denom;
  const w = (d00 * d21 - d01 * d20) / denom;
  const u = 1.0 - v - w;
  return [u, v, w];
}

function fromBarycentric(
  u: number, v: number, w: number,
  a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3
): THREE.Vector3 {
  return new THREE.Vector3(
    u * a.x + v * b.x + w * c.x,
    u * a.y + v * b.y + w * c.y,
    u * a.z + v * b.z + w * c.z
  );
}

// ── Component ─────────────────────────────────────────────────────────

interface LandmassOverlayProps {
  paths?: DymaxionPath[];
  color?: string;
}

export default function LandmassOverlay({
  paths,
  color = "#ff4444",
}: LandmassOverlayProps) {
  const { faces, progress, group } = useGlobeContext();
  const overlayGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!group) return;
    const overlayGroup = new THREE.Group();
    overlayGroupRef.current = overlayGroup;
    group.add(overlayGroup);
    return () => {
      group.remove(overlayGroup);
      overlayGroup.clear();
    };
  }, [group]);

  useEffect(() => {
    if (!faces || faces.length === 0 || !overlayGroupRef.current) return;
    if (!paths || paths.length === 0) return;

    const overlayGroup = overlayGroupRef.current;
    while (overlayGroup.children.length > 0) {
      const child = overlayGroup.children[0];
      if (child instanceof THREE.Line) child.geometry.dispose();
      overlayGroup.remove(child);
    }

    paths.forEach(({ faceIndex, points }) => {
      const face = faces[faceIndex];
      if (!face || points.length === 0) return;

      const { sphereVertices, flatVertices } = face;

      // points are already in FLAT space from dymaxion-paths.ts
      const flatPointVectors = points.map((p) => new THREE.Vector3(p.x, p.y, 0));

      const worldPoints = flatPointVectors.map((flatPoint) => {
        const [u, v, w] = toBarycentric(flatPoint, flatVertices[0], flatVertices[1], flatVertices[2]);
        const spherePoint = fromBarycentric(u, v, w, sphereVertices[0], sphereVertices[1], sphereVertices[2]);
        return new THREE.Vector3().lerpVectors(spherePoint, flatPoint, progress);
      });

      const geo = new THREE.BufferGeometry().setFromPoints(worldPoints);
      const mat = new THREE.LineBasicMaterial({ color });
      const line = new THREE.Line(geo, mat);
      overlayGroup.add(line);
    });
  }, [faces, progress, paths, color]);

  return null;
}