"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import IcosahedronGlobe, { type GlobeControls } from "./icosahedron-globe";
import { GLOBE_STAGES } from "@/utils/icosahedron-geometry";
import { loadRaster } from "@/utils/raster-engine";
import { collectRasterSamples, OverlaySample } from "@/utils/overlay-layer";

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

const LAYERS: LayerDef[] = [
  {
    id: "population",
    label: "Population Density (2024)",
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
    threshold: 40,
    maxSamples: 200_000,
    stride: 2,
  },
];

export default function DymaxionBase() {
  const [activeLayerId, setActiveLayerId] = useState<LayerId | null>(null);
  const [samples, setSamples] = useState<OverlaySample[]>([]);
  const [loading, setLoading] = useState(false);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [stage, setStage] = useState<number>(GLOBE_STAGES.SPHERE);

  const samplesCacheRef = useRef<Map<LayerId, OverlaySample[]>>(new Map());

  /**
   * Imperative handle to the globe's map-view API. Zoom and reset are
   * commands, not state — they bypass React's render cycle on purpose,
   * so a wheel-scroll or button-mash never re-renders the whole tree.
   */
  const globeRef = useRef<GlobeControls>(null);

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

  // Load / switch active raster layer
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

  const atFlat = stage >= GLOBE_STAGES.DYMAXION;
  const isUnfolded = stage >= GLOBE_STAGES.WIRES_GONE;

  return (
    <div className="w-full flex flex-col items-center pointer-events-auto select-none">
      {/* Header Bar */}
      <div className="w-full mb-3 md:mb-4 flex items-center justify-between shrink-0">
        {/* <h1 className="title-section">Dymaxion Projection</h1> */}

        {/* 
            INTENTIONALITY: Equalized button geometry (`w-36 h-9`) matching design tokens.
            No borders; surface elevation distinguish state changes cleanly without jumps.
        */}
        <button
          type="button"
          onClick={() =>
            setStage(
              isUnfolded ? GLOBE_STAGES.SPHERE : GLOBE_STAGES.WIRES_GONE
            )
          }
          className="w-36 h-9 flex items-center justify-center text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer outline-none shrink-0"
          style={{
            background: isUnfolded
              ? "var(--color-surface-elevated)"
              : "var(--color-surface)",
            color: isUnfolded
              ? "var(--color-text)"
              : "var(--color-header-text)",
            boxShadow: "var(--color-shadow)",
          }}
        >
          {isUnfolded ? "Fold" : "Unfold"}
        </button>
      </div>

      {/* 
          INTENTIONALITY: Unframed Grid with Zero Borders.
          Panels use exact CSS system tokens (`var(--color-surface)`, `var(--color-surface-elevated)`) 
          and native shadows to float seamlessly over the site backdrop.
      */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Canvas & Timeline Track */}
        <div className="lg:col-span-2 w-full flex flex-col gap-3">
          <div
            className="w-full aspect-[2/1] max-h-[420px] relative overflow-hidden flex items-center justify-center"
            data-globe-hit
            data-globe-flat={atFlat ? "" : undefined}
            style={{
              boxShadow: "var(--color-shadow)",
            }}
          >
            {earthTexture ? (
              <IcosahedronGlobe
                ref={globeRef}
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
                ref={globeRef}
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

          {/* 
              INTENTIONALITY: Map controls fade in only once the fold has settled flat.
              Zoom and pan have no meaning on a sphere, so rendering them earlier
              would be dead chrome. `tabIndex` is mirrored to the same gate so
              keyboard users can't tab into invisible, unusable buttons — the same
              discipline the `pointer-events-none` class already enforces for mice.
          */}
          <div
            className={`w-full flex items-center gap-2 transition-opacity duration-300 ${atFlat ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            aria-hidden={!atFlat}
          >
            <button
              type="button"
              onClick={() => globeRef.current?.zoomIn()}
              aria-label="Zoom in"
              tabIndex={atFlat ? 0 : -1}
              className="w-9 h-9 flex items-center justify-center text-base font-medium cursor-pointer outline-none"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-header-text)",
                boxShadow: "var(--color-shadow)",
              }}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => globeRef.current?.zoomOut()}
              aria-label="Zoom out"
              tabIndex={atFlat ? 0 : -1}
              className="w-9 h-9 flex items-center justify-center text-base font-medium cursor-pointer outline-none"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-header-text)",
                boxShadow: "var(--color-shadow)",
              }}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => globeRef.current?.resetView()}
              tabIndex={atFlat ? 0 : -1}
              className="h-9 px-4 flex items-center justify-center text-xs md:text-sm font-medium cursor-pointer outline-none"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-header-text)",
                boxShadow: "var(--color-shadow)",
              }}
            >
              Reset view
            </button>
          </div>

          <div
            className={`w-full h-9 flex items-center justify-center text-xs font-semibold tracking-wider uppercase transition-opacity duration-300 ${atFlat ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            style={{
              background: "var(--color-progress-track)",
              color: "var(--color-text-muted)",
            }}
          >
            Timeline Track
          </div>
        </div>

        {/* Floating Overlay Controls */}
        <div
          className={`lg:col-span-1 w-full transition-opacity duration-300 ${atFlat ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <div
            className="p-5 flex flex-col gap-3"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--color-shadow)",
            }}
          >
            <h2
              className="title-card"
              style={{ color: "var(--color-header-text)" }}
            >
              Overlays
            </h2>

            <div className="flex flex-col gap-2">
              <label
                className="flex items-center gap-3 text-sm cursor-pointer select-none transition-colors duration-150"
                style={{ color: "var(--color-text)" }}
              >
                <input
                  type="radio"
                  name="layer"
                  checked={activeLayerId === null}
                  onChange={() => setActiveLayerId(null)}
                  className="accent-[var(--color-accent)] cursor-pointer"
                />
                <span>Off</span>
              </label>

              {LAYERS.map((l) => (
                <label
                  key={l.id}
                  className="flex items-center gap-3 text-sm cursor-pointer select-none transition-colors duration-150"
                  style={{ color: "var(--color-text)" }}
                >
                  <input
                    type="radio"
                    name="layer"
                    checked={activeLayerId === l.id}
                    onChange={() => setActiveLayerId(l.id)}
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>

            {loading && (
              <div
                className="text-xs pt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Loading raster data…
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}