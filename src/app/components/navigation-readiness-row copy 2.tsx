// src/components/NavigationReadinessRow.tsx
import React from "react";
import { tools } from "./navigation-data";

const NavigationReadinessRow: React.FC = () => {
  return (
    <div className="flex flex-col justify-end w-max h-full px-2">
      {tools.map((tool) => (
        <div key={tool.name} className="flex flex-row items-center mb-1">
          {/* Tool Name */}
          <div
            className="text-sm font-medium pr-3 whitespace-nowrap"
            style={{ color: tool.color }}
          >
            {tool.name}
          </div>

          {/* Levels container */}
          <div className="flex flex-row space-x-2 h-[65%]">
            {tool.levels.map((level, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-gray-700 rounded-sm relative flex items-center justify-center text-xs overflow-hidden px-1"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-green-500/70"
                  style={{ width: `${level.percent}%` }}
                />
                <span className="relative z-10 truncate text-white">
                  {level.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NavigationReadinessRow;
