//components/dymaxion-overlays/overlay-population.tsx
"use client";

import { useEffect } from "react";
import * as d3 from "d3";

import isoCountries from "@/data/isoCountries.json";

type ISOEntry = {
    iso3: string;
    name: string;
};

const population: Record<string, number> = {
    AFG: 40_000_000,
    IND: 1_420_000_000,
    CHN: 1_410_000_000,
    USA: 330_000_000,
    BRA: 214_000_000,
    NGA: 220_000_000,
    MEX: 128_000_000,
    FRA: 65_000_000,
    NPL: 30_000_000,
    IDN: 275_000_000,
    RUS: 145_000_000,
};

export default function OverlayPopulation() {
    useEffect(() => {
        // 1. Select ONLY the Dymaxion map SVG
        const svg = d3.select("#dymaxion-map");
        if (!svg.node()) return;

        const overlay = svg.select("#overlay-layer");
        if (!overlay.node()) return;

        const projection = (svg.node() as any).__projection;
        const countries = (svg.node() as any).__countries;

        if (!projection || !countries) return;

        overlay.selectAll("*").remove();

        countries.forEach((country: any) => {
            // 2. Convert country.id to a padded ISO2 key
            const iso2 = country.id.toString().padStart(3, "0");

            const entry: ISOEntry | undefined = (isoCountries as any)[iso2];
            if (!entry) return;

            const iso3 = entry.iso3;
            const pop = population[iso3];
            if (!pop) return;

            const centroid = projection(d3.geoCentroid(country));
            if (!centroid) return;
            if (!Array.isArray(centroid) || centroid.some(isNaN)) return;

            overlay
                .append("circle")
                .attr("cx", centroid[0])
                .attr("cy", centroid[1])
                .attr("r", Math.sqrt(pop) * 0.002)
                .attr("fill", "rgba(255,0,0,0.6)");
        });
    }, []);

    return null;
}

