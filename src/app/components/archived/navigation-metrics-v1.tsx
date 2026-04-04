// src/components/NavigationMetricsRadar.tsx
import React from "react";
import NavigationRadarChart from "../navigation-graph-horizontal"
import NavigationReadinessRow from "../navigation-readiness-row";

const NavigationMetricsRadar: React.FC = () => {
  return (
    <div className="grid grid-rows-[3fr_0.5fr] w-full h-full text-gray-200 ">
      {/* Radar Chart Row */}
      <div className="flex flex-col items-center justify-center w-full h-[110%]">
        <NavigationRadarChart />
      </div>

      {/* Readiness Row */}
      <NavigationReadinessRow />
    </div>
  );
};

export default NavigationMetricsRadar;
