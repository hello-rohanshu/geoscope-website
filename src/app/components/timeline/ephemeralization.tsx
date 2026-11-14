"use client";

import React, { useRef, useState, useEffect } from "react";
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
  // Measure the graph container so the SVG can redraw at whatever
  // width/height it's actually given (this is what makes it flexible).
  const graphRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 600, h: 220 });

  useEffect(() => {
    const el = graphRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ w: Math.round(width), h: Math.round(height) });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Padding now in real CSS pixels (SVG viewBox == container size, so
  // 1 SVG unit == 1 pixel). Text stays crisp at any container size.
  const padding = { top: 20, right: 25, bottom: 35, left: 35 };
  const chartW = Math.max(1, size.w - padding.left - padding.right);
  const chartH = Math.max(1, size.h - padding.top - padding.bottom);

  const minVal = 0;
  const maxVal = 100;

  const getX = (index: number) => padding.left + (index / (plotData.length - 1)) * chartW;
  const getY = (value: number) => padding.top + chartH - ((value - minVal) / (maxVal - minVal)) * chartH;

  return (
    <div className="w-full flex flex-col items-center pointer-events-auto">
      {/* Header & Contrast Badge */}
      <div className="w-full mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-2 sm:gap-4">
        <h1 className="title-section">Ephemeralization</h1>

        {/* Contrast Background Badge Link */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-1 text-xs sm:text-sm font-medium rounded-none select-none"
            style={{
              background: "rgba(234, 179, 8, 0.15)",
              color: "rgb(234, 179, 8)",
            }}
          >
            <span aria-hidden="true">🚧</span>
            <span>WIP</span>
          </span>
          <Link
            href="/ephemeralization"
            className="inline-flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-medium rounded-none select-none"
            style={{
              background: "var(--color-surface-elevated)",
              color: "var(--color-text)",
            }}
          >
            <span>Learn More</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Main content — transparent, no card background / shadow */}
      <div className="w-full flex flex-col gap-6">
        {/* Quote Block */}
        <blockquote className="m-0 border-l-2 border-[var(--color-accent)] pl-4 py-1">
          <p
            className="text-xs sm:text-sm md:text-base leading-relaxed font-normal"
            style={{ color: "var(--color-text-summary)" }}
          >
            &ldquo;Because of (A) the constant increase in strength per pound of new metallic alloys, (B) the constant increase in horsepower per each pound and cubic inch of aircraft engines, and (C) the ever-increasing performance per pounds and cubic inches of new chemistries and electronics, in general we have the capability, which can be fully realized within ten years, of producing and sustaining a higher standard of living for all humanity than that ever heretofore experienced or dreamt of by any.&rdquo;
          </p>
          <cite
            className="block text-xs md:text-sm font-medium mt-2.5 not-italic"
            style={{ color: "var(--color-header-muted, #8a94a6)" }}
          >
            — Buckminster Fuller, <span className="italic">Critical Path</span>
          </cite>
        </blockquote>

        {/* Minimal Line Graph */}
        <div
          className="w-full flex flex-col gap-4 p-5 md:p-7"
          style={{
            background: "var(--color-surface)",
            boxShadow: "var(--color-shadow)",
          }}
        >
          {/* Measured container — SVG viewBox tracks its live size */}
          <div ref={graphRef} className="w-full h-[220px]">
            <svg
              viewBox={`0 0 ${size.w} ${size.h}`}
              className="w-full h-full overflow-visible"
            >
              {/* Horizontal Gridlines & Y-Axis Labels */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = getY(val);
                return (
                  <g key={`grid-${val}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={size.w - padding.right}
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
                    y={size.h - 10}
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

          {/* Index Legend (Points A, B, C) — transparent, no chip background */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 -mx-5 md:-mx-7 px-5 md:px-7 border-t border-[var(--color-border)] shrink-0">
            {seriesConfig.map((series) => (
              <div
                key={`legend-${series.key}`}
                className="flex items-center gap-2.5"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: series.rgb }}
                />
                <span
                  className="font-medium truncate text-xs"
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