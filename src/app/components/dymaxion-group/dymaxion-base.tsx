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
  targetWidth?: number;
  targetHeight?: number;
  resampleMethod?: "nearest" | "bilinear";
}

const LAYERS: LayerDef[] = [
  {
    id: "population",
    label: "Population Density (2024)",
    url: "/population_2024_1440x720_cog.tif",
    color: "#ff3b3b",
    size: 0.006,
    opacity: 0.6,
    threshold: 0,
    // no targetWidth/Height — loads full res, already fast
  },
  {
    id: "blackmarble",
    label: "Black Marble (2016)",
    url: "/BlackMarble_2016_3km_gray_geo_cog.tif",
    color: "#ffd97a",
    size: 0.006,
    opacity: 1,
    threshold: 20,
    // maxSamples: 200_000,
    stride: 2,
    targetWidth: 2700,   // half of 13500, still sharp enough
    targetHeight: 1350,
    resampleMethod: "nearest",
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
      const ok = await loadRaster(layer.id, layer.url, layer.targetWidth, layer.targetHeight, layer.resampleMethod);
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

  /**
   * Drop any active overlay the moment the globe stops being fully unfolded.
   * Folding is a "put it away" gesture — leaving a data layer lit on a
   * partially folded globe reads as a stale/buggy state, so we clear it here
   * rather than relying on every caller to remember.
   */
  useEffect(() => {
    if (stage < GLOBE_STAGES.WIRES_GONE) {
      setActiveLayerId(null);
    }
  }, [stage]);

  const activeLayer = activeLayerId
    ? LAYERS.find((l) => l.id === activeLayerId)
    : null;

  const atFlat = stage >= GLOBE_STAGES.DYMAXION;
  const isUnfolded = stage >= GLOBE_STAGES.WIRES_GONE;

  /**
   * Single-active toggle: checking an unchecked layer activates it; checking
   * the already-active layer clears the selection. This replaces the old
   * radio group + explicit "Off" row — one fewer control, same behavior.
   * (Single-active is dictated by the globe's overlay API, which only accepts
   * one color/size/opacity set at a time.)
   */
  const toggleLayer = (id: LayerId) => {
    setActiveLayerId((current) => (current === id ? null : id));
  };

  return (
    <div className="w-full flex flex-col items-center pointer-events-auto select-none">
      {/* Header Bar */}
      <div className="w-full mb-3 md:mb-4 flex items-center justify-between shrink-0">
        {/* <h1 className="title-section">Dymaxion Projection</h1> */}

        {/* 
            INTENTIONALITY: Equalized button geometry (`w-36 h-9`) matching design tokens.
            No borders; surface elevation distinguish state changes cleanly without jumps.
            This is the one control that survives BOTH folded and unfolded states — every
            other piece of chrome is gated behind `isUnfolded`.
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
          `items-stretch` (explicit, though it's the grid default) is what lets the
          overlay panel fill the full height of the canvas column on desktop.
      */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

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
              INTENTIONALITY: Map controls fade in only once the unfold has fully
              completed. Zoom and pan have no meaning on a sphere (or mid-fold), so
              rendering them earlier would be dead chrome. `tabIndex` is mirrored to
              the same gate so keyboard users can't tab into invisible, unusable
              buttons — the same discipline the `pointer-events-none` class already
              enforces for mice.
          */}
          <div
            className={`w-full flex items-center gap-2 transition-opacity duration-300 ${isUnfolded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            aria-hidden={!isUnfolded}
          >
            <button
              type="button"
              onClick={() => globeRef.current?.zoomIn()}
              aria-label="Zoom in"
              tabIndex={isUnfolded ? 0 : -1}
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
              tabIndex={isUnfolded ? 0 : -1}
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
              tabIndex={isUnfolded ? 0 : -1}
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

          {/* 
              Timeline placeholder. Now matches the overlay panel's surface color so
              the two read as one family of floating cards. The "coming soon" tag is
              rendered inline beside the label rather than replacing it.
          */}
          <div
            className={`w-full h-9 flex items-center justify-center gap-3 text-xs font-semibold tracking-wider uppercase transition-opacity duration-300 ${isUnfolded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            aria-hidden={!isUnfolded}
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            <span>Timeline</span>
            <span>🚧 Coming soon</span>
          </div>
        </div>

        {/* Floating Overlay Controls */}
        <div
          className={`lg:col-span-1 w-full transition-opacity duration-300 ${isUnfolded ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          aria-hidden={!isUnfolded}
        >
          <div
            className="p-5 flex flex-col gap-3 h-full"
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

            {/* 
                INTENTIONALITY: Square, sharp-cornered checkboxes replace the old
                radio group + explicit "Off" row. `appearance-none` gives us full
                control over the box geometry so it honors the zero-radius design
                language (native checkboxes round their corners on some platforms).
                Unchecked uses the page background — a recessed square that stays
                visible against the panel; checked fills with the accent color.
                Single-active by design — see `toggleLayer` above.
            */}
            <div className="flex flex-col gap-2">
              {LAYERS.map((l) => {
                const checked = activeLayerId === l.id;
                return (
                  <label
                    key={l.id}
                    className="flex items-center gap-3 text-sm cursor-pointer select-none transition-colors duration-150"
                    style={{ color: "var(--color-text)" }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleLayer(l.id)}
                      className="appearance-none w-4 h-4 shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: "var(--color-bg)",
                        backgroundImage: checked
                          ? "linear-gradient(var(--color-accent), var(--color-accent))"
                          : "none",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "8px 8px",
                      }}
                    />
                    <span>{l.label}</span>
                  </label>
                );
              })}
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