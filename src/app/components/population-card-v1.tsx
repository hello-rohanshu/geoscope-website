"use client";

import React, { useEffect, useState, memo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Historical population data in billions
const populationData = [
  { year: 1000, population: 0.31 },
  { year: 1500, population: 0.44 },
  { year: 1600, population: 0.55 },
  { year: 1700, population: 0.61 },
  { year: 1750, population: 0.79 },
  { year: 1800, population: 0.98 },
  { year: 1850, population: 1.26 },
  { year: 1900, population: 1.65 },
  { year: 1950, population: 2.53 },
  { year: 1970, population: 3.7 },
  { year: 1990, population: 5.3 },
  { year: 2010, population: 6.9 },
  { year: 2025, population: 8.242839999 },
];

// Memoize the graph to prevent re-renders
const PopulationGraph = memo(() => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={populationData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <XAxis
        dataKey="year"
        tick={{ fill: "#aaa", fontSize: 10 }}
        interval="preserveStartEnd"
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: "#aaa", fontSize: 10 }}
        tickFormatter={(val) => `${Math.round(val)}`}
        axisLine={false}
        tickLine={false}
      />
      <Line
        type="monotone"
        dataKey="population"
        stroke="#4ade80"
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
));

export default function PopulationCard() {
  const [population, setPopulation] = useState(8_242_839_999); // 8.24B
  const birthsPerSec = 4.3;
  const deathsPerSec = 1.8;
  const netGrowth = birthsPerSec - deathsPerSec;

  // Live population update
  useEffect(() => {
    const interval = setInterval(() => {
      setPopulation((prev) => prev + netGrowth / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [netGrowth]);

  return (
    <div className="bg-gray-900 text-white p-6 mx-auto font-manrope w-full max-w-[1600px]">
      {/* Heading */}
      <h2 className="text-3xl font-semibold mb-6">Population</h2>

      {/* Live Population Figure with fixed "humans" text */}
      <div className="relative text-5xl font-medium leading-tight overflow-hidden mb-4">
        <span>{Math.round(population).toLocaleString()}</span>
        <span className="absolute text-xl right-0 top-1/2 -translate-y-1/2">humans</span>
      </div>

      {/* Rate figures inline */}
      <div className="flex flex-row justify-start gap-6 text-gray-400 mb-4 text-sm">
        <div className="text-red-400">
          {netGrowth >= 0 ? `+${netGrowth.toFixed(1)}` : netGrowth.toFixed(1)} humans/s
        </div>
        <div>Deaths: {deathsPerSec.toFixed(1)} /s</div>
        <div>Births: {birthsPerSec.toFixed(1)} /s</div>
      </div>

      {/* Graph stacked below */}
      <div className="w-full h-40">
        <PopulationGraph />
      </div>
    </div>
  );
}
