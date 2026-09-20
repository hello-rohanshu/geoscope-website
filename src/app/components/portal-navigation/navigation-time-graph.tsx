// app/components/navigation-time-graph.tsx
"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { navTimeData, tools } from "./navigation-data";

type Props = {
    offsetX?: number;
    offsetY?: number;
};

export default function NavigationTimeGraph({ offsetX = -11, offsetY = 13 }: Props) {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={navTimeData}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                    {/* Wrap the chart in an SVG transform for positioning */}
                    <g transform={`translate(${offsetX}, ${offsetY})`}>
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 10, fill: "#aaa" }}
                            axisLine={true}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "#aaa" }}
                            axisLine={true}
                            tickLine={false}
                            domain={[0, 100]}
                        />
                        {/* Custom Y-axis label */}
                        <text
                            x={offsetX -30}        // horizontal position
                            y={offsetY - 35}        // vertical base position
                            dy={50}                 // fine tune vertical offset
                            textAnchor="middle"
                            transform={`rotate(-90)`}
                            style={{ fontSize: 12, fill: "#aaa" }}
                        >
                            Engagement
                        </text>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(30,30,30,0.9)",
                                border: "none",
                                borderRadius: "0.5rem",
                                fontSize: "0.75rem",
                                color: "#fff",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="synergetics"
                            stroke={tools[0].color}
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="worldGame"
                            stroke={tools[1].color}
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="geoscope"
                            stroke={tools[2].color}
                            strokeWidth={2}
                            dot={false}
                        />
                    </g>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
