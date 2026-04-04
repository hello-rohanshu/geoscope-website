import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

type Level = {
  label: string;
  percent: number;
};

type Tool = {
  name: string;
  levels: Level[];
  engagement: number;
  color: string;
  dx?: number;
  dy?: number;
  barsAbove?: boolean;
};

const tools: Tool[] = [
  {
    name: "Synergetics",
    levels: [
      { label: "Book", percent: 100 },
      { label: "Digital", percent: 0 },
      { label: "Lectures", percent: 100 },
    ],
    engagement: 1,
    color: "#f97316", // orange
    dx:0,
    dy: 0,
    barsAbove: true,
  },
  {
    name: "World Game",
    levels: [
      { label: "Data", percent: 30 },
      { label: "Geoscope", percent: 20 },
      { label: "Platform", percent: 0 },
    ],
    engagement: 2,
    color: "#3b82f6", // blue
    dx: -5,
    dy: 15,
  },
  {
    name: "Geoscope",
    levels: [
      { label: "Digital", percent: 30 },
      { label: "VR", percent: 10 },
      { label: "Physical", percent: 10 },
    ],
    engagement: 3,
    color: "#22c55e", // green
    dx: 5,
    dy: 15,
  },
];

// engagement values for radar chart
const data = tools.map((tool) => ({
  subject: tool.name,
  engagement: tool.engagement,
}));

const CustomTick = ({ x, y, index }: any) => {
  const tool = tools[index];
  const { dx = 0, dy = 0, barsAbove } = tool;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Toolstate bars */}
      <foreignObject
        x={barsAbove? -50: -50}
        y={barsAbove ? -35 : 20}
        width={100}
        height={50}
        style={{ overflow: "visible" }}
      >
        <div className="grid grid-cols-3 gap-1 w-full justify-items-center items-center">
          {tool.levels.map((lvl, i) => (
            <div key={i} className="w-full flex flex-col items-center">
              <div className="w-full h-1 bg-green-700 rounded-sm">
                <div
                  className="h-1 bg-green-500 rounded-sm"
                  style={{ width: `${lvl.percent}%` }}
                />
              </div>
              <div className="text-[0.6rem] text-white mt-0.5">{lvl.label}</div>
            </div>
          ))}
        </div>
      </foreignObject>

      {/* Main label */}
      <text
        x={dx}
        y={dy}
        textAnchor="middle"
        fill={tool.color}
        className="text-xs"
      >
        {tool.name} ({tool.engagement}%)
      </text>
    </g>
  );
};

const NavigationTriangle: React.FC = () => {
  return (
    <div className="h-[100%] w-[100%] flex items-center justify-center overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="60%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={<CustomTick />} />
          {tools.map((tool, i) => (
            <Radar
              key={i}
              name={tool.name}
              dataKey="engagement"
              stroke={tool.color}
              fill={tool.color}
              fillOpacity={0.2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NavigationTriangle;
