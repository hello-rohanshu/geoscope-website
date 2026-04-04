// raster-engine.ts
// Unified raster loader and sampler for global Earth rasters (GeoTIFF).
// Type-safe and ready to import into your Dymaxion overlay code.

import * as GeoTIFF from "geotiff";

export type RasterMeta = {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
};

let rasterData: ArrayLike<number> | null = null;
let width = 0;
let height = 0;
let loaded = false;

let meta: RasterMeta = {
  lonMin: -180,
  lonMax: 180,
  latMin: -90,
  latMax: 90,
};

export async function loadRaster(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[Raster Engine] fetch failed:", response.status, response.statusText);
      return false;
    }

    const buffer = await response.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(buffer);
    const image = await tiff.getImage(); // first image

    // readRasters can return many typed-array shapes; accept whatever numeric array-like is returned.
    // Requesting non-interleaved bands by default; we take the first band.
    const rasters = await image.readRasters({ interleave: false }) as ArrayLike<number>[] | ArrayLike<number>;
    // Normalize to an array of bands
    const bands = Array.isArray(rasters) ? rasters : [rasters];
    const data = bands[0];

    if (!data || typeof data.length !== "number") {
      console.error("[Raster Engine] readRasters returned an unexpected type", typeof data);
      return false;
    }

    const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]

    width = image.getWidth();
    height = image.getHeight();
    rasterData = data;
    loaded = true;

    meta = {
      lonMin: bbox[0],
      latMin: bbox[1],
      lonMax: bbox[2],
      latMax: bbox[3],
    };

    console.log(`[Raster Engine] Loaded GeoTIFF: ${width}x${height}`);
    return true;
  } catch (error) {
    console.error("[Raster Engine] Failed to load GeoTIFF:", error);
    return false;
  }
}

export function isLoaded(): boolean {
  return loaded;
}

export function getRasterDimensions() {
  return { width, height };
}

export function getRasterMeta(): RasterMeta {
  return meta;
}

export function getValueAt(lon: number, lat: number): number {
  if (!loaded || !rasterData || width <= 0 || height <= 0) return 0;

  // clamp lon/lat to meta bounds to avoid sampling outside domain
  const lonClamped = Math.max(meta.lonMin, Math.min(meta.lonMax, lon));
  const latClamped = Math.max(meta.latMin, Math.min(meta.latMax, lat));

  const x = ((lonClamped - meta.lonMin) / (meta.lonMax - meta.lonMin)) * (width - 1);
  // assuming North-up: latMax maps to y=0
  const y = ((meta.latMax - latClamped) / (meta.latMax - meta.latMin)) * (height - 1);

  return sampleBilinear(x, y);
}

export function getValueAtIndex(i: number): number {
  if (!loaded || !rasterData || width <= 0 || height <= 0) return 0;
  const len = rasterData.length;
  const idx = Math.max(0, Math.min(len - 1, Math.floor(i)));
  // ArrayLike<number> indexing returns number | undefined in JS/TS runtime; guard it.
  const v = (rasterData as any)[idx];
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

export function getLonLatForIndex(i: number): [number, number] {
  if (width <= 0 || height <= 0) return [0, 0];

  const idx = Math.max(0, Math.min(width * height - 1, Math.floor(i)));
  const x = idx % width;
  const y = Math.floor(idx / width);

  const lon = meta.lonMin + (x / (width - 1)) * (meta.lonMax - meta.lonMin);
  const lat = meta.latMax - (y / (height - 1)) * (meta.latMax - meta.latMin);

  return [lon, lat];
}

export const getPopulationAt = getValueAt;

/** Internal helpers */

function sampleBilinear(x: number, y: number): number {
  if (!rasterData || width <= 1 || height <= 1) return 0;

  // Clamp coordinates to [0, width-1] and [0, height-1]
  const xClamped = Math.max(0, Math.min(width - 1, x));
  const yClamped = Math.max(0, Math.min(height - 1, y));

  const xi = Math.floor(Math.max(0, Math.min(width - 2, xClamped)));
  const yi = Math.floor(Math.max(0, Math.min(height - 2, yClamped)));

  const xf = xClamped - xi;
  const yf = yClamped - yi;

  const idx = (xx: number, yy: number) => yy * width + xx;

  const safeRead = (xx: number, yy: number) => {
    const i = idx(xx, yy);
    if (!rasterData || i < 0 || i >= rasterData.length) return 0;
    const v = (rasterData as any)[i];
    return typeof v === "number" && !Number.isNaN(v) ? v : 0;
  };

  const v00 = safeRead(xi, yi);
  const v10 = safeRead(xi + 1, yi);
  const v01 = safeRead(xi, yi + 1);
  const v11 = safeRead(xi + 1, yi + 1);

  const v0 = v00 * (1 - xf) + v10 * xf;
  const v1 = v01 * (1 - xf) + v11 * xf;

  return v0 * (1 - yf) + v1 * yf;
}
