// src/components/NavigationMetricsRadar.tsx
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Level = { label: string; percent: number };
type Tool = {
  name: string;
  levels: Level[];
  engagement: number;
  color: string;
};

const tools: Tool[] = [
  {
    name: "Synergetics",
    levels: [
      { label: "Book", percent: 100 },
      { label: "Digital", percent: 0 },
      { label: "Lectures", percent: 100 },
    ],
    engagement: 1, // 👈 empty/dummy value
    color: "#d1d5db", // neutral gray
  },
  {
    name: "World Game",
    levels: [
      { label: "Data", percent: 30 },
      { label: "Geoscope", percent: 20 },
      { label: "Platform", percent: 0 },
    ],
    engagement: 2, // 👈 dummy mid value
    color: "#3b82f6", // blue
  },
  {
    name: "Geoscope",
    levels: [
      { label: "Digital", percent: 30 },
      { label: "VR", percent: 10 },
      { label: "Physical", percent: 10 },
    ],
    engagement: 3, // 👈 dummy max value
    color: "#22c55e", // green
  },
];

const radarData = tools.map((tool) => ({
  tool: tool.name,
  engagement: tool.engagement,
}));

// Custom tick renderer with % beside label
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
      {tool ? `${tool.name} (${tool.engagement}%)` : payload.value}
    </text>
  );
};

const NavigationMetricsRadar: React.FC = () => {
  return (
    <div className="grid grid-rows-[2.5fr_1fr] w-full h-full text-gray-200">
      {/* Radar Chart Row */}
      <div className="flex flex-col items-center justify-center w-full h-full ">
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis dataKey="tool" tick={renderToolTick} />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#555"
              tick={{ fontSize: 9, fill: "#666" }}
            />
            {tools.map((tool) => (
              <Radar
                key={tool.name}
                name={tool.name}
                dataKey="engagement"
                stroke={tool.color}
                fill={tool.color}
                fillOpacity={0.25}
              />
            ))}
            <text
              x="50%"
              y="85%"
              textAnchor="middle"
              className="fill-gray-300 text-sm font-medium"
            >
              Engagement Levels
            </text>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Readiness Row */}
      <div className="flex flex-col justify-evenly w-full h-full space-y-1">
        {tools.map((tool) => (
          <div key={tool.name} className="flex flex-row items-center w-full">
            <div
              className="text-sm font-medium pr-1 whitespace-nowrap"
              style={{ color: tool.color }}
            >
              {tool.name}
            </div>
            <div className="flex flex-1 flex-row space-x-1">
              {tool.levels.map((level, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gray-700 rounded-sm relative flex items-center justify-center text-[0.65rem]"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-sm bg-green-500"
                    style={{ width: `${level.percent}%` }}
                  />
                  <span className="relative z-10 px-1 truncate text-white">
                    {level.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationMetricsRadar;
