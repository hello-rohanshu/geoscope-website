// lib/unfold-geometry.ts
// Extracts icosahedron face data and maps 3D → 2D Dymaxion positions

import { geoAirocean } from "d3-geo-polygon";

// Standard icosahedron vertices (normalized to unit sphere)
const PHI = (1 + Math.sqrt(5)) / 2;

const vertices3D = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
].map(v => {
  const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
  return [v[0]/len, v[1]/len, v[2]/len] as [number, number, number];
});

// The 20 faces (indices into vertices3D)
const faceIndices = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

// Convert 3D unit vector to lat/lon
function toLatLon([x, y, z]: [number, number, number]): [number, number] {
  const lat = Math.asin(y) * (180 / Math.PI);
  const lon = Math.atan2(x, z) * (180 / Math.PI);
  return [lon, lat];
}

export interface FaceData {
  id: number;
  vertices3D: [number, number, number][];
  vertices2D: [number, number][];
}

export function extractFaceData(width: number, height: number): FaceData[] {
  const projection = geoAirocean()
    .fitExtent([[20, 20], [width - 20, height - 20]], { type: "Sphere" });

  return faceIndices.map((indices, i) => {
    const verts3D = indices.map(i => vertices3D[i]);
    const verts2D = indices.map(i => {
      const [lon, lat] = toLatLon(vertices3D[i]);
      return projection([lon, lat]) as [number, number];
    });
    return { id: i, vertices3D: verts3D, vertices2D: verts2D };
  });
}