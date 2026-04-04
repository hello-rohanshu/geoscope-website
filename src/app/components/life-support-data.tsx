// app/areas/standard-of-life/life-support-data.tsx
import React from "react";
import { Wind } from "lucide-react";

/** Type definition for a metric */
export type Metric = {
  key: string;          // unique identifier, e.g., "food"
  label: string;        // display label
  valuePct: number;     // current percentage meeting ideal (0-100)
  color: string;        // color for pie/line
  icon: React.ReactNode; // icon for pie chart
};

/** Current metrics — used for both pies and lines */
export const metrics: Metric[] = [
  {
    key: "food",
    label: "Food",
    valuePct: 64.6,       // % population with access to & can afford healthy diet
    color: "#16a34a",     // green
    icon: "🍎",
  },
  {
    key: "air",
    label: "Air",
    valuePct: 1,          // % population breathing air within WHO guideline
    color: "#7dd3fc",     // light sky blue
    icon: <Wind size={14} />,
  },
  {
    key: "water",
    label: "Water",
    valuePct: 73,         // % population with safely managed drinking water
    color: "#2563eb",     // blue
    icon: "💧",
  },
  {
    key: "shelter",
    label: "Shelter",
    valuePct: 79.4,       // % population with adequate housing
    color: "#7c4a2e",     // brown
    icon: "🏠",
  },
];

/** Historical trend data (1990–2024) for plotting the line chart */
export const trendData: Record<string, number | string>[] = [
  { x: 1990, food: 50, air: 3, water: 50, shelter: 60 },
  { x: 1995, food: 52, air: 3.5, water: 55, shelter: 62 },
  { x: 2000, food: 55, air: 4, water: 60, shelter: 65 },
  { x: 2005, food: 58, air: 4.5, water: 65, shelter: 68 },
  { x: 2010, food: 60, air: 5, water: 70, shelter: 72 },
  { x: 2015, food: 62, air: 5.5, water: 72, shelter: 75 },
  { x: 2020, food: 64, air: 6, water: 73, shelter: 78 },
  { x: 2024, food: 64.6, air: 6.5, water: 74, shelter: 79.4 },
];
