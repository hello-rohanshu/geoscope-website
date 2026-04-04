"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature, merge } from "topojson-client";
import { geoAirocean } from "d3-geo-polygon";
import worldData from "@/data/world-110m.json";
import isoCountries from "@/data/isoCountries";
import type { Feature, Geometry } from "geojson";

export default function DymaxionMap() {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 960;
    const height = 480;
    const g = svg.append("g");

    const world: any = worldData;
    const countries = feature(world, world.objects.countries).features;

    // ---- FIXED: TypeScript requires properties: {} ----


const mergedLand: Feature<Geometry> = {
  type: "Feature",
  properties: {},
  geometry: merge(
    world,
    world.objects.countries.geometries
  ) as Geometry,        // <-- explicit cast fixes the error completely
};


    const projection = geoAirocean()
      .scale(240)
      .translate([width / 2 - 100, height / 2]);

    const path = d3.geoPath(projection as any);

    // Draw the seamless landmass (no borders, no seams)
    g.append("path")
      .attr("class", "landmass")
      .attr("d", path(mergedLand)!)
      .attr("fill", "#dcdcdc")
      .attr("stroke", "none");

    // Single-path hover highlight
    const highlight = g.append("path")
      .attr("fill", "rgba(120,180,255,0.4)")
      .attr("stroke", "none")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Hover label
    const labelGroup = svg.append("g").style("pointer-events", "none");

    const labelBg = labelGroup.append("rect")
      .attr("fill", "white")
      .attr("rx", 4)
      .attr("ry", 4)
      .style("opacity", 0);

    const labelText = labelGroup.append("text")
      .attr("fill", "#000")
      .attr("font-size", 14)
      .attr("font-weight", "500")
      .style("opacity", 0)
      .style("font-family", "sans-serif");

    // Invisible hit-layer for hover detection
    g.selectAll("path.hit-country")
      .data(countries)
      .join("path")
      .attr("class", "hit-country")
      .attr("d", path as any)
      .attr("fill", "transparent")
      .attr("stroke", "none")
      .on("mouseover", function (event, d: any) {
        highlight
          .attr("d", path(d)!)
          .style("opacity", 1);

        const name = isoCountries[d.id as keyof typeof isoCountries] || `ID ${d.id}`;

        labelText.text(name)
          .attr("x", event.offsetX + 8)
          .attr("y", event.offsetY - 8)
          .style("opacity", 1);

        const bbox = labelText.node()!.getBBox();
        labelBg
          .attr("x", bbox.x - 4)
          .attr("y", bbox.y - 2)
          .attr("width", bbox.width + 8)
          .attr("height", bbox.height + 4)
          .style("opacity", 0.9);
      })
      .on("mousemove", function (event) {
        labelText
          .attr("x", event.offsetX + 8)
          .attr("y", event.offsetY - 8);

        const bbox = labelText.node()!.getBBox();
        labelBg
          .attr("x", bbox.x - 4)
          .attr("y", bbox.y - 2);
      })
      .on("mouseout", function () {
        highlight.style("opacity", 0);
        labelText.style("opacity", 0);
        labelBg.style("opacity", 0);
      });

    // Zoom & pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 10])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    // Initial zoom-out
    const initialScale = 0.2;
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(
          (width / 2) * (1 - initialScale),
          (height / 2) * (1 - initialScale)
        )
        .scale(initialScale)
    );
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 960 480"
      className="w-full h-full"
      style={{ background: "#1a1a1a", cursor: "grab" }}
    />
  );
}
