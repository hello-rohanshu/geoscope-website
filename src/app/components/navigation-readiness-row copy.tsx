// src/components/NavigationReadinessRow.tsx
import React from "react";
import { tools } from "./navigation-data";

const NavigationReadinessRow: React.FC = () => {
  return (
    <div className="flex w-full h-full">
      {/* Fixed left column with tool names */}
      <div className="flex flex-col pr-3">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: tool.color }}
          >
            {tool.name}
          </div>
        ))}
      </div>

      {/* Shared scrollable right column with levels */}
      <div className="flex-1 overflow-x-auto scrollbar-custom content-end pt-1">
        <div className="flex flex-col">
          {tools.map((tool) => (
            <div key={tool.name} className="flex flex-row space-x-2 mb-1 h-[65%]">
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationReadinessRow;
