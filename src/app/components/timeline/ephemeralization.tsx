"use client";

import React from "react";
import Link from "next/link";

interface DataPoint {
  xLabel: string;
  valA: number;
  valB: number;
  valC: number;
}

// 4-plot dummy data representing progress across phases
const plotData: DataPoint[] = [
  { xLabel: "Phase 1", valA: 20, valB: 15, valC: 10 },
  { xLabel: "Phase 2", valA: 38, valB: 32, valC: 28 },
  { xLabel: "Phase 3", valA: 56, valB: 60, valC: 64 },
  { xLabel: "Phase 4", valA: 82, valB: 88, valC: 96 },
];

const seriesConfig = [
  {
    key: "valA" as const,
    label: "(A) Metallic Alloys Strength / lb",
    rgb: "rgb(239, 68, 68)", // Red RGB
  },
  {
    key: "valB" as const,
    label: "(B) Engine Horsepower / lb & cu.in",
    rgb: "rgb(34, 197, 94)", // Green RGB
  },
  {
    key: "valC" as const,
    label: "(C) Chemistries & Electronics Performance / lb & cu.in",
    rgb: "rgb(59, 130, 246)", // Blue RGB
  },
];

export default function Ephemeralization() {
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 25, bottom: 35, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = 0;
  const maxVal = 100;

  const getX = (index: number) => padding.left + (index / (plotData.length - 1)) * chartW;
  const getY = (value: number) => padding.top + chartH - ((value - minVal) / (maxVal - minVal)) * chartH;

  return (
    <div className="w-full flex flex-col items-center pointer-events-auto">
      {/* Header & Contrast Badge */}
      <div className="w-full mb-3 md:mb-4 flex items-center justify-between shrink-0 gap-4">
        <h1 className="title-section">Ephemeralization</h1>

        {/* Contrast Background Badge Link */}
        <Link
          href="/ephemeralization"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 rounded-sm select-none hover:opacity-90 active:scale-95 shrink-0"
          style={{
            background: "var(--color-accent)",
            color: "#0d0e11",
          }}
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-black/20 text-[11px] font-bold">
            ?
          </span>
          <span>Learn More &gt;</span>
        </Link>
      </div>

      {/* Main Card Wrapper */}
      <div
        className="w-full flex flex-col relative z-10 overflow-hidden p-5 md:p-7 gap-6"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--color-shadow)",
        }}
      >
        {/* Quote Block */}
        <blockquote className="m-0 border-l-2 border-[var(--color-accent)] pl-4 py-1">
          <p
            className="text-xs sm:text-sm md:text-base leading-relaxed italic font-normal"
            style={{ color: "var(--color-text-summary)" }}
          >
            &ldquo;Because of (A) the constant increase in strength per pound of new metallic alloys, (B) the constant increase in horsepower per each pound and cubic inch of aircraft engines, and (C) the ever-increasing performance per pounds and cubic inches of new chemistries 198 World Game 199 and electronics, in general we have the capability, which can be fully real ized within ten years, of producing and sustaining a higher standard of liv ing for all humanity than that ever heretofore experienced or dreamt of by any.&rdquo;
          </p>
          <cite
            className="block text-xs md:text-sm font-medium mt-2.5 not-italic"
            style={{ color: "var(--color-header-muted, #8a94a6)" }}
          >
            — Buckminster Fuller, <span className="italic">Critical Path</span>
          </cite>
        </blockquote>

        {/* Minimal Line Graph */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto min-w-[320px] overflow-visible"
            >
              {/* Horizontal Gridlines & Y-Axis Labels */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = getY(val);
                return (
                  <g key={`grid-${val}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill="var(--color-text-muted)"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Labels */}
              {plotData.map((d, i) => {
                const x = getX(i);
                return (
                  <text
                    key={`x-label-${i}`}
                    x={x}
                    y={height - 10}
                    fill="var(--color-text-muted)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {d.xLabel}
                  </text>
                );
              })}

              {/* RGB Lines & Plot Points */}
              {seriesConfig.map((series) => {
                const pointsSvg = plotData
                  .map((d, i) => `${getX(i)},${getY(d[series.key])}`)
                  .join(" ");

                return (
                  <g key={series.key}>
                    <polyline
                      fill="none"
                      stroke={series.rgb}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pointsSvg}
                    />
                    {plotData.map((d, i) => {
                      const cx = getX(i);
                      const cy = getY(d[series.key]);
                      return (
                        <circle
                          key={`pt-${series.key}-${i}`}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="var(--color-surface)"
                          stroke={series.rgb}
                          strokeWidth="2"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Index Legend (Points A, B, C) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--color-border)]">
            {seriesConfig.map((series) => (
              <div
                key={`legend-${series.key}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-xs"
                style={{ background: "var(--color-surface-elevated)" }}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: series.rgb }}
                />
                <span
                  className="font-medium truncate"
                  style={{ color: "var(--color-text)" }}
                  title={series.label}
                >
                  {series.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}