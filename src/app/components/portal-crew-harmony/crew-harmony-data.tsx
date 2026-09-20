// app/data/crew-harmony-data.tsx
"use client";

import React from "react";
import {
  HeartCrack,
  Skull,
  Briefcase,
  Banknote,
} from "lucide-react";

export type HarmonyPoint = {
  year: number;
  suicides: number;
  violentDeaths: number;
  displaced: number;
  gdpImpact: number;
};

export const harmonyData: HarmonyPoint[] = [
  { year: 2000, suicides: 800000, violentDeaths: 450000, displaced: 23000000, gdpImpact: 2.3 },
  { year: 2005, suicides: 820000, violentDeaths: 500000, displaced: 25000000, gdpImpact: 2.5 },
  { year: 2010, suicides: 810000, violentDeaths: 520000, displaced: 27000000, gdpImpact: 2.7 },
  { year: 2015, suicides: 800000, violentDeaths: 550000, displaced: 30000000, gdpImpact: 3.0 },
  { year: 2020, suicides: 770000, violentDeaths: 600000, displaced: 35000000, gdpImpact: 3.3 },
  { year: 2024, suicides: 750000, violentDeaths: 580000, displaced: 40000000, gdpImpact: 3.6 },
];

export const harmonyMetrics = {
  suicides: {
    key: "suicides",
    label: "Suicide",
    subLabel: "1/40s",
    color: "#ff0000ff", // red
    icon: HeartCrack,
  },
  violentDeaths: {
    key: "violentDeaths",
    label: "Murder",
    subLabel: "1/60s",
    color: "#ff0000ff", // orange
    icon: Skull,
  },
  displaced: {
    key: "displaced",
    label: "Displaced",
    subLabel: "1 in 70",
    color: "#1E90FF", // blue
    icon: Briefcase,
  },
  gdpImpact: {
    key: "gdpImpact",
    label: "Violence Cost",
    subLabel: "11% GDP",
    color: "#32CD32", // green
    icon: Banknote,
  },
};

export const CrewHarmonyData: React.FC = () => {
  return <></>; // placeholder
};
