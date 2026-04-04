"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import * as d3 from "d3";
import { merge } from "topojson-client";
import { geoAirocean } from "d3-geo-polygon";
import worldData from "@/data/world-110m.json";

// Context to share projection with overlays
const MapContext = createContext<d3.GeoProjection | null>(null);
export function useMapProjection() {
  return useContext(MapContext);
}

export default function DymaxionMap({
  children,
}: {
  children?: React.ReactNode;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [projection, setProjection] = useState<d3.GeoProjection | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const parent = svgEl.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const proj = geoAirocean().fitExtent(
      [[20, 20], [width - 20, height - 20]],
      { type: "Sphere" }
    );

    const path = d3.geoPath(proj);

    const mergedLand = {
      type: "Feature",
      geometry: merge(
        worldData as any,
        (worldData as any).objects.countries.geometries
      ),
    } as GeoJSON.Feature;

    // Base land
    svg
      .append("path")
      .datum(mergedLand)
      .attr("d", path as any)
      .attr("fill", "#c1c1c1ff")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5);

    // Overlay mount point
    svg.append("g").attr("id", "overlay-layer");

    setProjection(() => proj);
  }, []);

  return (
    <svg ref={svgRef} className="w-full h-full block">
      {projection && (
        <MapContext.Provider value={projection}>
          {children}
        </MapContext.Provider>
      )}
    </svg>
  );
}
