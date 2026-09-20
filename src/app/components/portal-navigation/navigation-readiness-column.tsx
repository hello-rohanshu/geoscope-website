// src/components/navigation-readiness-column.tsx
import React, { useRef } from "react";
import { tools } from "./navigation-data";

const NavReadinessCol: React.FC = () => {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleWheel = (e: React.WheelEvent, idx: number) => {
    const row = rowRefs.current[idx];
    if (row) {
      row.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden gap-3 bg-white/0 rounded-xl">
      {tools.map((tool, idx) => (
        <div key={tool.name}>
          {/* Heading */}
          <span
            className="text-sm font-bold truncate block"
            style={{ color: tool.color }}
          >
            {tool.name}
          </span>

          {/* Tags Row */}
          <div
            ref={(el) => {
              rowRefs.current[idx] = el; // ✅ assign, don’t return
            }}
            onWheel={(e) => handleWheel(e, idx)}
            className="flex gap-1 overflow-x-auto relative"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {tool.levels.map((level, i) => (
              <div
                key={i}
                className="relative bg-neutral-500/20 text-[0.625rem] whitespace-nowrap flex items-center rounded "
              >
                {/* Background fill */}
                <div
                  className="absolute inset-y-0 left-0 bg-neutral-500/50 rounded"
                  style={{ width: `${level.percent}%` }}
                />
                {/* Label */}
                <span className="relative z-10 text-white px-1">
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

export default NavReadinessCol;
