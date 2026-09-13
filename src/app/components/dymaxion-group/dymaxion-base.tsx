"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import IcosahedronGlobe from "./icosahedron-globe";
import { GLOBE_STAGES, SEGMENT_COUNT } from "@/utils/icosahedron-geometry";
import { loadRaster } from "@/utils/raster-engine";
import { collectRasterSamples, OverlaySample } from "@/utils/overlay-layer";

// ── Layer registry ────────────────────────────────────────────────────
// Add new rasters here. Each is loaded and cached in raster-engine under
// its `id`, so switching between them is instant after first load.
type LayerId = "population" | "blackmarble";

interface LayerDef {
  id: LayerId;
  label: string;
  url: string;
  color: string;
  size: number;
  opacity: number;
  threshold: number;
  maxSamples?: number;
  stride?: number;
}

// ── To add a raster ───────────────────────────────────────────────────
//   1. drop the .tif in /public/
//   2. widen LayerId with a new string literal
//   3. append a LayerDef below
// Tuning:
//   threshold  = min cell value to keep (know your raster's range;
//                0–255 for grayscale, 0–1 for normalized, etc.)
//   stride     = sample every Nth pixel in x and y (use 2–4 for
//                rasters bigger than ~2000px per side)
//   maxSamples = hard cap; keeps buildOverlayBuffers from freezing

const LAYERS: LayerDef[] = [
  {
    id: "population",
    label: "Population",
    url: "/population_2024_1440x720_cog.tif",
    color: "#ff3b3b",
    size: 0.012,
    opacity: 0.35,
    threshold: 0,
  },
  {
    id: "blackmarble",
    label: "Black Marble (2016)",
    url: "/BlackMarble_2016_3km_gray_geo.tif",
    color: "#ffd97a",
    size: 0.006,
    opacity: 0.5,
    threshold: 40,          // 0–255 gray; raise if too many dots
    maxSamples: 200_000,    // hard cap so buildOverlayBuffers doesn't freeze
    stride: 2,              // 3km raster is big; every other pixel is plenty
  },
];

export default function DymaxionBase() {
  const [activeLayerId, setActiveLayerId] = useState<LayerId | null>(null);
  const [samples, setSamples] = useState<OverlaySample[]>([]);
  const [loading, setLoading] = useState(false);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [stage, setStage] = useState<number>(GLOBE_STAGES.SPHERE);

  // Cache collected samples per layer so flipping back is instant. The
  // decoded raster is already cached in raster-engine; this just saves
  // re-iterating 100k+ cells each time you switch.
  const samplesCacheRef = useRef<Map<LayerId, OverlaySample[]>>(new Map());

  // Load Earth texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load("/earth_day.jpg");
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    setEarthTexture(tex);
  }, []);

  // Load / switch the active raster layer.
  useEffect(() => {
    if (!activeLayerId) {
      setSamples([]);
      return;
    }

    const cached = samplesCacheRef.current.get(activeLayerId);
    if (cached) {
      setSamples(cached);
      return;
    }

    const layer = LAYERS.find((l) => l.id === activeLayerId)!;
    let cancelled = false;
    setLoading(true);

    (async () => {
      const ok = await loadRaster(layer.id, layer.url);
      if (!ok || cancelled) {
        setLoading(false);
        return;
      }
      const collected = collectRasterSamples({
        rasterId: layer.id,
        threshold: layer.threshold,
        maxSamples: layer.maxSamples,
        stride: layer.stride,
      });
      samplesCacheRef.current.set(layer.id, collected);
      if (!cancelled) {
        setSamples(collected);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeLayerId]);

  const activeLayer = activeLayerId
    ? LAYERS.find((l) => l.id === activeLayerId)
    : null;

  const atFlat = stage === GLOBE_STAGES.DYMAXION;

  return (
    <div className="relative w-full p-4 sm:p-8 lg:p-12 flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8 bg-transparent">
      {/* Stage Prev/Next — always visible */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setStage((s) => Math.max(0, s - 1))}
          disabled={stage <= 0}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold tracking-wide transition-colors shadow-lg"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setStage((s) => Math.min(SEGMENT_COUNT, s + 1))}
          disabled={stage >= SEGMENT_COUNT}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold tracking-wide transition-colors shadow-lg"
        >
          Next
        </button>
      </div>

      {/* Left Column: Map + Timeline */}
      <div className="flex flex-col gap-6 flex-[2]">
        {/* Globe Container */}
        <div className="w-full max-w-[720px] mx-auto aspect-[2/1] max-h-[38vh] rounded-2xl shadow-xl overflow-hidden">
          {earthTexture ? (
            <IcosahedronGlobe
              stage={stage}
              onStageChange={setStage}
              overlaySamples={samples}
              showOverlay={activeLayerId !== null}
              overlayColor={activeLayer?.color}
              overlaySize={activeLayer?.size}
              overlayOpacity={activeLayer?.opacity}
              baseLayer={{ mode: "texture", texture: earthTexture }}
            />
          ) : (
            <IcosahedronGlobe
              stage={stage}
              onStageChange={setStage}
              overlaySamples={samples}
              showOverlay={activeLayerId !== null}
              overlayColor={activeLayer?.color}
              overlaySize={activeLayer?.size}
              overlayOpacity={activeLayer?.opacity}
              baseLayer={{ mode: "debug" }}
            />
          )}
        </div>

        {/* Timeline Placeholder — only at dymaxion stage */}
        {atFlat && (
          <div className="w-full h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400 font-mono text-sm px-4">
            Timeline will appear here
          </div>
        )}
      </div>

      {/* Right Column: Controls + Cards — only at dymaxion stage */}
      {atFlat && (
        <div className="flex flex-col gap-6 flex-[1] min-w-0 lg:min-w-[280px]">
          <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 space-y-3 flex-1">
            <div className="text-gray-300 font-semibold tracking-wide">
              Overlays
            </div>

            <label className="flex items-center gap-3 text-gray-300 cursor-pointer select-none">
              <input
                type="radio"
                name="layer"
                checked={activeLayerId === null}
                onChange={() => setActiveLayerId(null)}
                className="accent-red-500"
              />
              <span>Off</span>
            </label>

            {LAYERS.map((l) => (
              <label
                key={l.id}
                className="flex items-center gap-3 text-gray-300 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="layer"
                  checked={activeLayerId === l.id}
                  onChange={() => setActiveLayerId(l.id)}
                  className="accent-red-500"
                />
                <span>{l.label}</span>
              </label>
            ))}

            {loading && (
              <div className="text-gray-500 text-xs pt-1">Loading…</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}