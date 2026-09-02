"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature, merge } from "topojson-client";
import { geoAirocean } from "d3-geo-polygon";
import isoCountries from "@/data/isoCountries"; // Add this import
import type { Feature, MultiPolygon } from "geojson";

export default function DymaxionMapDataOverlayExample() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // simple local population dataset keyed by country numeric ID
  const popData: Record<number, number> = {
    356: 1400000000, // India
    840: 330000000,  // USA
    156: 1410000000, // China
    250: 67000000,   // France
    76: 210000000,   // Brazil
  };

  useEffect(() => {
    // Fetch the world data from public directory
    fetch('/data/world-110m.json')
      .then(res => res.json())
      .then(data => setWorldData(data))
      .catch(err => console.error('Error loading world data:', err));
  }, []);

  useEffect(() => {
    if (!ref.current || !worldData) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 960;
    const height = 480;

    const g = svg.append("g");

    const countries = feature(worldData, worldData.objects.countries).features;

    // --- MERGED LAND (clean, TS-safe) ---------------------
    const mergedGeom = merge(
      worldData,
      worldData.objects.countries.geometries
    ) as MultiPolygon;

    const mergedLand: Feature<MultiPolygon> = {
      type: "Feature",
      properties: {},
      geometry: mergedGeom
    };
    // --------------------------------------------------------

    const projection = geoAirocean().scale(240).translate([width / 2, height / 2]);
    const path = d3.geoPath(projection as any);

    // base landmass
    g.append("path")
      .attr("d", path(mergedLand)!)
      .attr("fill", "#dcdcdc")
      .attr("stroke", "none");

    // population circles
    countries.forEach((d: any) => {
      const id = d.id;
      const pop = popData[id];
      if (!pop) return;

      const centroid = path.centroid(d);
      if (isNaN(centroid[0]) || isNaN(centroid[1])) return;

      g.append("circle")
        .attr("cx", centroid[0])
        .attr("cy", centroid[1])
        .attr("r", Math.sqrt(pop) / 5000)
        .attr("fill", "rgba(255,0,0,0.5)")
        .attr("stroke", "#800")
        .attr("stroke-width", 0.4);
    });

    // hover highlight
    const highlight = g.append("path")
      .attr("fill", "rgba(120,180,255,0.4)")
      .attr("stroke", "none")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // label
    const labelGroup = svg.append("g").style("pointer-events", "none");
    const labelBg = labelGroup.append("rect")
      .attr("fill", "white")
      .attr("rx", 4)
      .attr("ry", 4)
      .style("opacity", 0);
    const labelText = labelGroup.append("text")
      .attr("fill", "black")
      .attr("font-size", 14)
      .attr("font-weight", "500")
      .style("opacity", 0)
      .style("font-family", "sans-serif");

    // hit layer
    g.selectAll("path.hit-country")
      .data(countries)
      .join("path")
      .attr("class", "hit-country")
      .attr("d", path as any)
      .attr("fill", "transparent")
      .attr("stroke", "none")
      .on("mouseover", function (event, d: any) {
        highlight.attr("d", path(d)!).style("opacity", 1);

        const entry = isoCountries[d.id as keyof typeof isoCountries];
        const countryName = entry?.name || `ID ${d.id}`;
        const pop = popData[d.id] ? ` (Pop: ${popData[d.id].toLocaleString()})` : "";

        labelText
          .text(`${countryName}${pop}`)
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
        labelBg.attr("x", bbox.x - 4).attr("y", bbox.y - 2);
      })
      .on("mouseout", function () {
        highlight.style("opacity", 0);
        labelText.style("opacity", 0);
        labelBg.style("opacity", 0);
      });

    // zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.150, 10])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

  }, [worldData]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 960 480"
      className="w-full h-full"
      style={{ background: "#1a1a1a" }}
    />
  );
}