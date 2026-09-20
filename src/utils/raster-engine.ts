// raster-engine.ts
import { fromUrl } from "geotiff";

export type RasterMeta = {
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
};

interface RasterState {
  data: ArrayLike<number>;
  width: number;
  height: number;
  meta: RasterMeta;
}

// Target pixel dimensions for initial load — whole globe, low res.
// Fast to fetch, whole image present, no missing regions.
// Raise these for more detail (costs load time).
const INITIAL_WIDTH = 720;
const INITIAL_HEIGHT = 360;

const rasters = new Map<string, RasterState>();

const DEFAULT_META: RasterMeta = {
  lonMin: -180,
  lonMax: 180,
  latMin: -90,
  latMax: 90,
};

export async function loadRaster(
  id: string,
  url: string,
  targetWidth?: number,
  targetHeight?: number,
  resampleMethod: "nearest" | "bilinear" = "nearest",
): Promise<boolean> {
  if (rasters.has(id)) return true;

  try {
    const tiff = await fromUrl(url);

    // tiff.readRasters (on the tiff, not image) auto-picks the best overview
    // for the requested width/height, and uses HTTP range requests — no full download.
    const raw = await tiff.readRasters({
      ...(targetWidth && targetHeight ? { width: targetWidth, height: targetHeight } : {}),
      interleave: false,
      resampleMethod,
    }) as ArrayLike<number>[] | ArrayLike<number>;

    const bands = Array.isArray(raw) ? raw : [raw];
    const data = bands[0];

    if (!data || typeof data.length !== "number") {
      console.error(`[Raster Engine] readRasters returned unexpected type for ${id}`);
      return false;
    }

    // Get bbox from the full-res image for correct coordinate mapping
    const image = await tiff.getImage();
    const bbox = image.getBoundingBox();

    // Use the actual read dimensions when available (readRasters attaches them
    // to the returned band arrays), falling back to the requested target size,
    // and finally to the full-res image dimensions.
    const actualWidth = (raw as any).width ?? targetWidth ?? image.getWidth();
    const actualHeight = (raw as any).height ?? targetHeight ?? image.getHeight();

    rasters.set(id, {
      data,
      width: actualWidth,
      height: actualHeight,
      meta: {
        lonMin: bbox[0],
        latMin: bbox[1],
        lonMax: bbox[2],
        latMax: bbox[3],
      },
    });

    console.log(`[Raster Engine] Loaded ${id} at ${targetWidth}x${targetHeight}`);
    return true;
  } catch (error) {
    console.error(`[Raster Engine] Failed to load ${id}:`, error);
    return false;
  }
}

// Call this to reload a layer at higher resolution (the "lever")
export async function refineRaster(id: string, url: string, targetWidth: number, targetHeight: number): Promise<boolean> {
  rasters.delete(id);
  return loadRaster(id, url, targetWidth, targetHeight);
}

export function isLoaded(id: string): boolean {
  return rasters.has(id);
}

export function getRasterDimensions(id: string): { width: number; height: number } {
  const s = rasters.get(id);
  return { width: s?.width ?? 0, height: s?.height ?? 0 };
}

export function getRasterMeta(id: string): RasterMeta {
  return rasters.get(id)?.meta ?? DEFAULT_META;
}

export function getValueAt(id: string, lon: number, lat: number): number {
  const s = rasters.get(id);
  if (!s || s.width <= 0 || s.height <= 0) return 0;
  const { meta, width, height, data } = s;
  const lonClamped = Math.max(meta.lonMin, Math.min(meta.lonMax, lon));
  const latClamped = Math.max(meta.latMin, Math.min(meta.latMax, lat));
  const x = ((lonClamped - meta.lonMin) / (meta.lonMax - meta.lonMin)) * (width - 1);
  const y = ((meta.latMax - latClamped) / (meta.latMax - meta.latMin)) * (height - 1);
  return sampleBilinear(data, width, height, x, y);
}

export function getValueAtIndex(id: string, i: number): number {
  const s = rasters.get(id);
  if (!s || s.width <= 0 || s.height <= 0) return 0;
  const len = s.data.length;
  const idx = Math.max(0, Math.min(len - 1, Math.floor(i)));
  const v = (s.data as any)[idx];
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

export function getLonLatForIndex(id: string, i: number): [number, number] {
  const s = rasters.get(id);
  if (!s || s.width <= 0 || s.height <= 0) return [0, 0];
  const { meta, width, height } = s;
  const idx = Math.max(0, Math.min(width * height - 1, Math.floor(i)));
  const x = idx % width;
  const y = Math.floor(idx / width);
  const lon = meta.lonMin + (x / (width - 1)) * (meta.lonMax - meta.lonMin);
  const lat = meta.latMax - (y / (height - 1)) * (meta.latMax - meta.latMin);
  return [lon, lat];
}

function sampleBilinear(data: ArrayLike<number>, width: number, height: number, x: number, y: number): number {
  if (width <= 1 || height <= 1) return 0;
  const xClamped = Math.max(0, Math.min(width - 1, x));
  const yClamped = Math.max(0, Math.min(height - 1, y));
  const xi = Math.floor(Math.max(0, Math.min(width - 2, xClamped)));
  const yi = Math.floor(Math.max(0, Math.min(height - 2, yClamped)));
  const xf = xClamped - xi;
  const yf = yClamped - yi;
  const safeRead = (xx: number, yy: number): number => {
    const i = yy * width + xx;
    if (i < 0 || i >= data.length) return 0;
    const v = (data as any)[i];
    return typeof v === "number" && !Number.isNaN(v) ? v : 0;
  };
  const v00 = safeRead(xi, yi);
  const v10 = safeRead(xi + 1, yi);
  const v01 = safeRead(xi, yi + 1);
  const v11 = safeRead(xi + 1, yi + 1);
  return (v00 * (1 - xf) + v10 * xf) * (1 - yf) + (v01 * (1 - xf) + v11 * xf) * yf;
}