"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { GlobeControls } from "../scene/GlobeR3F";
import { GLOBE_STAGES } from "@/utils/icosahedron-geometry";
import { loadRaster } from "@/utils/raster-engine";
import { collectRasterSamples, OverlaySample } from "@/utils/overlay-layer";

export type LayerId = "population" | "blackmarble";

export interface LayerDef {
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

export const LAYERS: LayerDef[] = [
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

/**
 * All the state and data-loading effects that used to live inside
 * DymaxionBase (texture load, raster load + sample cache, fold stage,
 * the map-controls ref). Pulled into one hook so page.tsx can call it
 * ONCE and pass the results down to both DymaxionBase (HTML UI) and
 * GeoscopeScene (3D) — a single source of truth, so the raster-loading
 * effect below only ever runs once per layer switch, not once per
 * consumer.
 *
 * This deviates from the port spec's §8 wording ("globeRef is created in
 * DymaxionBase... passed up to page.tsx") — refs and state are easier to
 * reason about flowing DOWN from a single owner than being created in a
 * child and threaded upward, and it avoids either duplicating this
 * effect in two places or leaving DymaxionBase awkwardly half-stateful.
 * The actual logic inside is unchanged from the original DymaxionBase.
 */
export function useDymaxionState() {
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
   * Forwarded into GeoscopeScene as its ref; read directly by DymaxionBase's
   * zoom/reset buttons.
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

  return {
    stage,
    setStage,
    activeLayerId,
    setActiveLayerId,
    activeLayer,
    samples,
    loading,
    earthTexture,
    globeRef,
  };
}
