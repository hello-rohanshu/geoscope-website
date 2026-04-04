// src/components/NavigationRadarChart.tsx
import React from "react";
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  PolarGrid,
} from "recharts";
import { tools, radarData } from "./navigation-data";

type Props = {
  /** Optional badge text */
  badgeText?: string;
  /** Badge color */
  badgeColor?: string;
  /** Radar center X/Y */
  centerX?: number | string;
  centerY?: number | string;
  /** Outer triangle radius */
  outerRadius?: number;
};

const renderToolTick = (props: any) => {
  const { x, y, payload } = props;
  const tool = tools.find((t) => t.name === payload.value);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="hanging"
      style={{ fill: tool?.color ?? "#ffffff5a" }} // use tool color, fallback to default
      className="text-xs"
    >
      {tool ? `${tool.name} (${tool.engagement}%)` : payload.value}
      
    </text>
  );
};


const NavigationRadarChart: React.FC<Props> = ({
  badgeText = "Engagement Graph",
  badgeColor = "rgba(135, 133, 133, 0)", // violet by default
  centerX = "40%",
  centerY = "55%",
  outerRadius = 90,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Colored badge above the chart */}
      <div
        className="absolute px-2 py-3 text-base font-normal text-white/20 rounded-full text-center font-mono"
        style={{
          backgroundColor: badgeColor,
          top: 30,
          right: 0,
          width: 100,             // fixed width for wrapping
         // whiteSpace: "normal",  // allow line breaks
        }}
      >
        {badgeText}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} cx={centerX} cy={centerY}>
          {/* Only outer polygon, no radial lines */}
          <PolarGrid
            gridType="polygon"
            radialLines={true}
            polarRadius={[outerRadius]}
            stroke="#ffffff43"
            strokeWidth={2}
          />

          <PolarAngleAxis dataKey="tool" tick={renderToolTick} />

          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "#ffffff5a" }}
            axisLine={false}
            tickLine={false}
          />

          <Radar
            name="Engagement"
            dataKey="engagement"
            stroke="rgba(255, 0, 0, 1)"
            fill="#ffffffff"
            fillOpacity={0.2}
            strokeWidth={0}
            dot={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NavigationRadarChart;
