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

// Custom tick renderer: colored dot + % label
const renderToolTick = (props: any): React.ReactElement<SVGElement> => {
  const { x, y, payload } = props;
  const tool = tools.find((t) => t.name === payload.value);
  if (!tool) return <g />;

  return (
    <g>
      {/* Dot */}
      <circle cx={x} cy={y} r={6} fill={tool.color} />

      {/* Engagement percentage */}
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        dominantBaseline="hanging"
        style={{ fill: "#ffffff", fontSize: "10px" }}
      >
        {radarData.find(r => r.tool === tool.name)?.engagement ?? 0}%
        
      </text>
    </g>
  );
};

const NavigationRadarChart: React.FC<Props> = ({
  badgeText = "Engagement Graph",
  badgeColor = "rgba(135, 133, 133, 0)",
  centerX = "50%",
  centerY = "55%",
  outerRadius = 60,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Badge */}
      <div
        className="absolute px-2 py-3 text-xs/4 font-medium text-white/50 rounded-full text-center "
        style={{
          backgroundColor: badgeColor,
          top: 100,
          right: 20,
          width: 100,
        }}
      >
        {badgeText}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} cx={centerX} cy={centerY} outerRadius={outerRadius}>
          {/* Polygon grid */}
          <PolarGrid   polarRadius={[outerRadius]} gridType="polygon" radialLines={true} stroke="#ffffff5a" strokeWidth={1} />

          {/* Custom ticks with dots + labels */}
          <PolarAngleAxis dataKey="tool" tick={renderToolTick} />

          {/* Engagement as percentage scale */}
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]} // <-- keep engagement as % (0–100)
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
            strokeWidth={1}
            dot={false} // we already render dots via custom tick
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NavigationRadarChart;
