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
  badgeText?: string;
  badgeColor?: string;
  centerX?: number | string;
  centerY?: number | string;
  outerRadius?: number;
};

// Correctly typed custom tick renderer
const renderToolTick = (props: any): React.ReactElement<SVGElement> => {
  const { x, y, payload } = props;
  const tool = tools.find((t) => t.name === payload.value);
  if (!tool) return <g />; // return empty <g>, not null

  return (
    <g>
      {/* Dot */}
      <circle cx={x} cy={y} r={6} fill={tool.color} />

      {/* Percentage text */}
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        dominantBaseline="hanging"
        style={{ fill: "#ffffff", fontSize: "10px" }}
      >
        {tool.engagement}%
      </text>
    </g>
  );
};

const NavigationRadarChart: React.FC<Props> = ({
  badgeText = "Engagement Graph",
  badgeColor = "rgba(135, 133, 133, 0)",
  centerX = "40%",
  centerY = "55%",
  outerRadius = 75,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Badge */}
      <div
        className="absolute px-2 py-3 text-base font-normal text-white/20 rounded-full text-center font-mono"
        style={{
          backgroundColor: badgeColor,
          top: -10,
          right: 0,
          width: 100,
        }}
      >
        {badgeText}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} cx={centerX} cy={centerY}>
          <PolarGrid
            gridType="polygon"
            radialLines={true}
            polarRadius={[outerRadius]}
            stroke="#ffffff5a"
            strokeWidth={2}
          />

          {/* Fixed custom ticks */}
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
            stroke="#ffffffff"
            fill="#ffffff"
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
