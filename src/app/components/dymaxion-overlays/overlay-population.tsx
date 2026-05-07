"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import {
  loadRaster,
  isLoaded,
  getRasterDimensions,
  getValueAtIndex,
  getLonLatForIndex,
} from "@/lib/raster-engine";
import { useMapProjection } from "../dymaxion-map";

const RASTER_URL = "/population_2024_1440x720.tif";

/* ------------------ CONTROLS ------------------ */
const samplingStep = 1; // 1 = every raster cell
const dotRadius = 0.4; // Presence marker only
const opacity = 0.33;
const color = "#ff0000";
const maxDots = 35_000_00; // Hard safety valve
/* ---------------------------------------------- */

export default function OverlayPopulation({
  onSourceFile,
}: {
  onSourceFile?: (filename: string) => void;
}) {
  const projection = useMapProjection();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoaded()) {
      setReady(true);
      onSourceFile?.(RASTER_URL.split("/").pop()!);
      return;
    }
    loadRaster(RASTER_URL).then((ok) => {
      if (ok) {
        setReady(true);
        onSourceFile?.(RASTER_URL.split("/").pop()!);
      }
    });
  }, []);

  useEffect(() => {
    if (!projection || !ready) return;

    const { width, height } = getRasterDimensions();
    const layer = d3.select("#overlay-layer");
    layer.selectAll("*").remove();

    const points: { x: number; y: number }[] = [];
    let count = 0;
    const total = width * height;

    for (let i = 0; i < total; i += samplingStep) {
      if (count >= maxDots) break;

      const value = getValueAtIndex(i);
      if (value <= 0) continue; // TRUE presence test (no smoothing)

      const [lon, lat] = getLonLatForIndex(i);
      const pos = projection([lon, lat]);
      if (!pos) continue;

      points.push({ x: pos[0], y: pos[1] });
      count++;
    }

    layer
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", dotRadius)
      .attr("fill", color)
      .attr("opacity", opacity)
      .style("pointer-events", "none");

    console.log(`[Population] Rendered ${points.length} presence dots`);

    return () => {
      layer.selectAll("*").remove();
    };
  }, [projection, ready]);

  return null;
}