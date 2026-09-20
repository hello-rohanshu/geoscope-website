"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import IcosahedronGlobe, { type GlobeControls } from "./icosahedron-globe";
import EarthInfo from "../earth-info";
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
  },
  {
    id: "blackmarble",
    label: "Black Marble (2016)",
    url: "/BlackMarble_2016_3km_gray_geo_cog.tif",
    color: "#ffd97a",
    size: 0.006,
    opacity: 1,
    threshold: 20,
    stride: 2,
    targetWidth: 2700,
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
  const [targetStage, setTargetStage] = useState<number>(GLOBE_STAGES.SPHERE);

  const lastLayerRef = useRef<LayerDef | null>(null);
  const samplesCacheRef = useRef<Map<LayerId, OverlaySample[]>>(new Map());
  const globeRef = useRef<GlobeControls>(null);

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

  useEffect(() => {
    if (!activeLayerId) return;

    const cached = samplesCacheRef.current.get(activeLayerId);
    if (cached) {
      setSamples(cached);
      return;
    }

    const layer = LAYERS.find((l) => l.id === activeLayerId)!;
    let cancelled = false;
    setLoading(true);

    (async () => {
      const ok = await loadRaster(
        layer.id,
        layer.url,
        layer.targetWidth,
        layer.targetHeight,
        layer.resampleMethod
      );
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

  useEffect(() => {
    const target =
      activeLayerId && samples.length > 0
        ? LAYERS.find((l) => l.id === activeLayerId)?.opacity ?? 1
        : 0;
    if (target > 0 || samples.length === 0) return;
    const t = setTimeout(() => {
      setSamples((s) => (s.length ? [] : s));
    }, 900);
    return () => clearTimeout(t);
  }, [activeLayerId, samples.length]);

  useEffect(() => {
    if (stage < GLOBE_STAGES.WIRES_GONE) {
      setActiveLayerId(null);
    }
  }, [stage]);

  const activeLayer = activeLayerId
    ? LAYERS.find((l) => l.id === activeLayerId)
    : null;

  if (activeLayer) lastLayerRef.current = activeLayer;
  const visualLayer = activeLayer ?? lastLayerRef.current;
  const targetOpacity =
    activeLayerId && samples.length > 0
      ? LAYERS.find((l) => l.id === activeLayerId)?.opacity ?? 1
      : 0;

  const atFlat = stage >= GLOBE_STAGES.DYMAXION;
  const isUnfolded = targetStage >= GLOBE_STAGES.DYMAXION;
  const uiVisible = stage >= GLOBE_STAGES.WIRES_GONE;
  const hudVisible = !isUnfolded && stage < GLOBE_STAGES.SPHERE_TRIANGULATED;

  const toggleLayer = (id: LayerId) => {
    setActiveLayerId((current) => (current === id ? null : id));
  };

  return (
    <div className="w-full flex flex-col items-center pointer-events-auto select-none max-w-none">
      {/* Dynamic Grid Layout with smooth grid-template-columns transition */}
      <div
        className={`w-full grid transition-all duration-500 ease-in-out items-stretch ${uiVisible
          ? "grid-cols-1 lg:grid-cols-[2fr_1fr] lg:gap-6"
          : "grid-cols-1 lg:grid-cols-[1fr_0fr] lg:gap-0"
          }`}
      >
        {/* Canvas & Floating HUD Area */}
        <div className="w-full flex flex-col gap-3 min-w-0">

          {/* Action Bar - Positioned outside and left-aligned so it doesn't move during grid resize */}
          <div className="w-full flex items-center justify-start">
            <button
              type="button"
              onClick={() =>
                setTargetStage(
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

          <div
            className="w-full aspect-[16/9] max-h-[480px] min-h-[320px] relative overflow-hidden flex items-center justify-center rounded-none"
            data-globe-hit
            data-globe-flat={atFlat ? "" : undefined}
            style={{
              boxShadow: "var(--color-shadow)",
              border: "0px solid white",
            }}
          >
            {/* 3D Canvas */}
            <IcosahedronGlobe
              ref={globeRef}
              stage={targetStage}
              onStageChange={setStage}
              overlaySamples={samples}
              showOverlay={samples.length > 0}
              overlayColor={visualLayer?.color}
              overlaySize={visualLayer?.size}
              overlayOpacity={targetOpacity}
              baseLayer={
                earthTexture
                  ? { mode: "texture", texture: earthTexture }
                  : { mode: "debug" }
              }
            />

            {/* FLOATING SPACE HUD TELEMETRY (Only active when folded) */}
            <div
              className={`absolute top-4 left-4 md:top-0 md:left-0 z-10 w-48 md:w-72 transition-all duration-500 transform ${hudVisible
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
            >
              <EarthInfo />
            </div>
          </div>

          {/* Map Controls */}
          <div
            className={`w-full flex items-center gap-2 transition-opacity duration-300 ${uiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            aria-hidden={!uiVisible}
          >
            <button
              type="button"
              onClick={() => globeRef.current?.zoomIn()}
              aria-label="Zoom in"
              tabIndex={uiVisible ? 0 : -1}
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
              tabIndex={uiVisible ? 0 : -1}
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
              tabIndex={uiVisible ? 0 : -1}
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

          {/* Timeline Placeholder */}
          <div
            className={`w-full h-12 flex items-center justify-center gap-3 text-xs font-semibold tracking-wider uppercase transition-opacity duration-300 ${uiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            aria-hidden={!uiVisible}
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            <span>Timeline</span>
            <span>🚧 Coming soon</span>
          </div>
        </div>

        {/* Side Panel: Overlay Controls */}
        <div
          className={`w-full h-full overflow-hidden transition-all duration-500 ease-in-out ${uiVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
            }`}
        >
          <div
            className="p-5 flex flex-col gap-3 h-full min-w-[280px]"
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

            <div
              className={`text-xs pt-1 ${loading ? "" : "invisible"}`}
              style={{ color: "var(--color-text-muted)" }}
            >
              Loading raster data…
            </div>

            <div
              className="mt-2 pt-3 text-base text-center"
              style={{ color: "var(--color-text-muted)" }}
            >
              🚧 More overlays coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}