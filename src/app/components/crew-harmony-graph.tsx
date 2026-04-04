"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { harmonyData, harmonyMetrics } from "../components/crew-harmony-data";

type CrewHarmonyGraphProps = {
  metric: keyof typeof harmonyMetrics;
  showAxes?: boolean;
};

const formatNumberShort = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

export const CrewHarmonyGraph: React.FC<CrewHarmonyGraphProps> = ({
  metric,
  showAxes = false,
}) => {
  const { color } = harmonyMetrics[metric];

  // Min/max for Y
  const values = harmonyData.map((d) => d[metric]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // First and last year for X-axis
  const firstYear = harmonyData[0]?.year;
  const lastYear = harmonyData[harmonyData.length - 1]?.year;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={harmonyData}
          margin={{ top: 0, right: 5, bottom: -10, left: 5 }}
        >
          <Line
            type="monotone"
            dataKey={metric}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          <XAxis
            dataKey="year"
            ticks={[firstYear, lastYear]}
            tickLine={false}
            axisLine={true}
            interval="preserveStartEnd"
            tick={({ x, y, payload }) => {
              // shift endpoints toward center for more balance
              const offset =
                payload.value === firstYear
                  ? 1 // push right
                  : payload.value === lastYear
                  ? -1 // push left
                  : 0;

              return (
                <text
                  x={x + offset}
                  y={y + 2}
                  fill="#fff"
                  fontSize={9} // small font
                  textAnchor="middle"
                  style={{ overflow: "visible" }}
                >
                  {payload.value}
                </text>
              );
            }}
          />

          <YAxis
            ticks={[minValue, maxValue]}
            domain={[
              (dataMin: number) => Math.floor(dataMin * 0.95), // pad
              (dataMax: number) => Math.ceil(dataMax * 1.05),
            ]}
            hide={true}
            axisLine={false}
            tickLine={false}
            allowDataOverflow={true}
            tick={({ x, y, payload }) => (
              <text
                x={x + 40}
                y={y - 2}
                fill="#fff"
                fontSize={8} // reduced font size
                textAnchor="end"
                style={{ overflow: "visible" }}
              >
                {formatNumberShort(payload.value)}
              </text>
            )}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1f293733",
              borderRadius: "8px",
              border: "0px solid #fff",
              padding: "6px 10px",
              color: "#fff",
              fontSize: 11,
            }}
            cursor={{ stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
