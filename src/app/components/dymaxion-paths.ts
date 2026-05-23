// app/components/dymaxion-paths.ts

import { geoAirocean } from "d3-geo-polygon";
import { feature } from "topojson-client";
import * as d3 from "d3";
import * as THREE from "three";

// ── Same transform as icosahedron-globe ───────────────────────────────
import { FLAT_TRANSFORM } from "./icosahedron-globe";

const { cx, cy, mr, cosR, sinR } = FLAT_TRANSFORM;
const SC = 1.65 / mr;

function transformPoint(x: number, y: number): [number, number] {
  const rx = (x - cx) * SC;
  const ry = (-(y - cy)) * SC;
  return [
    rx * cosR - ry * sinR,
    rx * sinR + ry * cosR,
  ];
}

// ── Transformed face vertices for point-in-triangle testing ───────────
const FACES_RAW: [number, number][][] = [
  [[-0.500000,-0.288675],[0.500000,-0.288675],[0.000000,0.577350]],
  [[-0.500000,-0.288675],[0.000000,-1.154701],[0.500000,-0.288675]],
  [[-0.500000,-0.288675],[-1.000000,-1.154701],[0.000000,-1.154701]],
  [[-1.500000,-2.020726],[-1.000000,-2.886751],[-0.500000,-2.020726]],
  [[-2.000000,-2.886751],[-1.500000,-3.752777],[-1.000000,-2.886751]],
  [[1.500000,-0.288675],[1.000000,0.577350],[0.500000,-0.288675]],
  [[0.500000,-0.288675],[1.000000,-1.154701],[1.500000,-0.288675]],
  [[1.000000,-1.154701],[0.500000,-0.288675],[0.000000,-1.154701]],
  [[0.000000,-1.154701],[0.500000,-2.020726],[1.000000,-1.154701]],
  [[0.500000,-2.020726],[0.000000,-1.154701],[-0.500000,-2.020726]],
  [[-0.500000,-2.020726],[0.000000,-2.886751],[0.500000,-2.020726]],
  [[0.000000,-2.886751],[-0.500000,-2.020726],[-1.000000,-2.886751]],
  [[-1.000000,-2.886751],[-0.500000,-3.752777],[0.000000,-2.886751]],
  [[-0.500000,-3.752777],[-1.000000,-2.886751],[-1.500000,-3.752777]],
  [[-1.5, -3.752777],[-0.75, -4.185790],[-0.5, -3.752777]],
  [[1.5, -0.866026],[1.5, -0.288675],[1.0, -1.154701]],
  [[1.500000,-2.020726],[1.000000,-1.154701],[0.500000,-2.020726]],
  [[1.000000,-2.886751],[0.500000,-2.020726],[0.000000,-2.886751]],
  [[1.000000,-2.886751],[0.000000,-2.886751],[0.500000,-3.752777]],
  [[2.0, -1.154701],[2.0, -0.288675],[1.5, -0.288675]],
  [[1.5, -2.020726],[1.5, -1.443376],[1.0, -1.154701]],
  [[2.0, -1.154701],[1.5, -0.288675],[1.5, -0.866026]],
  [[2.0, 0.57735],[1.5, -0.288675],[2.0, -0.288675]],
  [[2.0, -0.288675],[2.0, -1.154701],[2.5, -0.288675]],
];

// Pre-transform all face vertices
const FACES: [number, number][][] = FACES_RAW.map(face => 
  face.map(([x, y]) => transformPoint(x, y)) as [number, number][]
);

// ── Point-in-triangle test ────────────────────────────────────────────
function pointInTriangle(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): boolean {
  const v0x = cx - ax, v0y = cy - ay;
  const v1x = bx - ax, v1y = by - ay;
  const v2x = px - ax, v2y = py - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const denom = dot00 * dot11 - dot01 * dot01;
  if (Math.abs(denom) < 0.000001) return false;
  const u = (dot11 * dot02 - dot01 * dot12) / denom;
  const v = (dot00 * dot12 - dot01 * dot02) / denom;
  return u >= -0.001 && v >= -0.001 && u + v <= 1.001;
}

function findFace(x: number, y: number): number {
  for (let i = 0; i < FACES.length; i++) {
    const [a, b, c] = FACES[i];
    if (pointInTriangle(x, y, a[0], a[1], b[0], b[1], c[0], c[1])) {
      return i;
    }
  }
  return -1;
}

// ── Types ─────────────────────────────────────────────────────────────
type FlatPath = {
  faceIndex: number;
  points: [number, number][];
};

export interface DymaxionPath {
  faceIndex: number;
  points: THREE.Vector3[];
}

// ── Ring to paths ─────────────────────────────────────────────────────
function ringToPaths(
  coords: number[][],
  projection: d3.GeoProjection
): FlatPath[] {
  const paths: FlatPath[] = [];
  let currentPath: FlatPath | null = null;

  for (const coord of coords) {
    const [lon, lat] = coord;
    const projected = projection([lon, lat]);
    if (!projected) continue;

    // Transform to match FLAT coordinate space before finding face
    const [px, py] = transformPoint(projected[0], projected[1]);
    const faceIndex = findFace(px, py);

    if (faceIndex === -1) {
      if (currentPath && currentPath.points.length > 0) {
        paths.push(currentPath);
      }
      currentPath = null;
      continue;
    }

    if (!currentPath || currentPath.faceIndex !== faceIndex) {
      if (currentPath && currentPath.points.length > 0) {
        paths.push(currentPath);
      }
      currentPath = { faceIndex, points: [] };
    }

    currentPath.points.push([px, py]);
  }

  if (currentPath && currentPath.points.length > 0) {
    paths.push(currentPath);
  }

  return paths;
}

// ── Main export ───────────────────────────────────────────────────────
export async function loadDymaxionPaths(
  topojsonData: any
): Promise<DymaxionPath[]> {
  const projection = geoAirocean()
    .translate([0, 0])
    .scale(1);

  const countries = feature(
    topojsonData,
    topojsonData.objects.countries
  ) as any;

  const allPaths: DymaxionPath[] = [];
  const features: any[] = countries.features;

  for (let i = 0; i < features.length; i++) {
    const geom = features[i].geometry;
    if (!geom) continue;

    const coordsList: number[][][] = geom.type === "Polygon" 
      ? geom.coordinates 
      : geom.type === "MultiPolygon" 
        ? geom.coordinates.flat(1) 
        : [];

    for (const ring of coordsList) {
      const flatPaths = ringToPaths(ring, projection);
      for (const fp of flatPaths) {
        allPaths.push({
          faceIndex: fp.faceIndex,
          points: fp.points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
        });
      }
    }
  }

  return allPaths;
}