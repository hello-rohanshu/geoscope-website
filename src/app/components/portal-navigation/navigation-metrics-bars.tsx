import React from "react";

type Level = {
  label: string;
  percent: number; // readiness %
};

type Tool = {
  name: string;
  levels: Level[];
  engagement: number; // %
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
  },
  {
    name: "World Game",
    levels: [
      { label: "Data", percent: 30 },
      { label: "Geoscope", percent: 20 },
      { label: "Platform", percent: 0 },
      { label: "Platform", percent: 0 },
    ],
    engagement: 2,
  },
  {
    name: "Geoscope",
    levels: [
      { label: "Digital", percent: 30 },
      { label: "VR", percent: 10 },
      { label: "Physical", percent: 10 },
    ],
    engagement: 3,
  },
];

const NavigationMetricsv1: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 text-gray-200 text-sm w-full ">
      {tools.map((tool) => (
        <div key={tool.name} className="flex flex-col gap-2">
          {/* Tool Heading */}
          <div className="font-semibold text-lg text-left text-blue-500">
            {tool.name}
          </div>

          {/* Two-column layout: Tool State | Engagement */}
          <div className="grid grid-cols-2 gap-4 items-start">
            {/* Tool State */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tool.levels.map((level, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-start gap-1"
                >
                  <div className="w-full bg-gray-700 rounded-sm h-2">
                    <div
                      className="bg-green-500 h-2 rounded-sm"
                      style={{ width: `${level.percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    {level.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Engagement Bar */}
            <div className="flex items-center">
              <div className="relative w-full bg-gray-700 rounded-sm overflow-hidden h-6">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${tool.engagement}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white font-medium">
                  Engagement: {tool.engagement}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NavigationMetricsv1;
