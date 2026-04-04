import React from "react";
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { tools, radarData } from "./navigation-data";

// custom tick renderer same as before
const renderToolTick = (props: any) => {
  const { x, y, payload } = props;
  const tool = tools.find((t) => t.name === payload.value);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-gray-300 text-xs"
    >
      {tool ? `${tool.name} (${radarData.find(r => r.tool === tool.name)?.engagement ?? 0}%)` : payload.value}
    </text>
  );
};

// Custom component for drawing outer outline polygon
const OuterPolygon: React.FC<{ data: any[]; radius?: number; cx?: number; cy?: number }> = ({
  data,
  radius = 100, // you’d compute this relative to chart size
  cx = 0,
  cy = 0,
}) => {
  if (!data || data.length === 0) return null;

  // compute the points around the circle for each “tool”
  const angleStep = (2 * Math.PI) / data.length;
  const pts = data.map((entry, i) => {
    const angle = angleStep * i - Math.PI / 2; // -90° start
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return `${x},${y}`;
  });

  return (
    <path
      d={`M${pts.join("L")}Z`}
      fill="none"
      stroke="#4f46e5"
      strokeWidth={2}
    />
  );
};

const NavigationRadarChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radarData}>
        {/* Hide PolarGrid entirely */}
        {/* Use custom polygon outline */}

        <PolarAngleAxis dataKey="tool" tick={renderToolTick} />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: "#888" }}
          axisLine={false}
          tickLine={false}
        />

        <Radar
        x="50%"
        y="100%"
          name="Engagement"
          dataKey="engagement"
          stroke="#ffffffff"
          fill="#ffffffff"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={false}
        />

        {/* Insert outer polygon outline layer */}
        {/* You’ll need to compute chart center & radius, perhaps via ref or known size */}
        <OuterPolygon data={radarData} radius={120} cx={200} cy={200} />

        <text
          x="50%"
          y="82%"
          textAnchor="middle"
          className="fill-gray-300 text-sm font-bold"
        >
          Engagement Levels
        </text>
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default NavigationRadarChart;
