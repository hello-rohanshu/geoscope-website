// app/areas/science/portal.tsx
import React from "react";
import { Compass } from "lucide-react";
import { PortalConfig } from "../../components/portal-config";
import NavigationRadarChart from "../../components/navigation-graph-vertical";
import NavReadinessCol from "../../components/navigation-readiness-column";
import NavigationTimeGraph from "../../components/navigation-time-graph";

const NavigationMetricCard: React.FC = () => {
  return (
    <div className="grid grid-rows-[3fr_2fr] w-full h-full text-gray-200 border-gray-500 min-h-0 ">
      {/* Top Row: Radar + Readiness */}
      <div className="grid grid-cols-2 w-full h-full border-gray-500 min-h-0 justify-center">
        {/* Column 1 */}
        <div className="flex items-start pl-3 w-full h-full border-gray-500 min-h-0">
          <div className="w-[75%] h-[90%]">
            <NavReadinessCol />
          </div>
        </div>
        {/* Column 2 */}
        <div className="flex items-start justify-center w-full h-full border-gray-500 min-h-0 overflow-hidden">
          <div className="h-[90%] w-[100%]">
          <NavigationRadarChart />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-center w-full h-full border-gray-500 min-h-0">
        <div className="w-full h-full">
        <NavigationTimeGraph />
        </div>
      </div>
    </div>
  );
};

const NavigationPortal: PortalConfig = {
  title: "Navigation",
  subtitle: "Science",
  description: "",
  href: "/areas/science/full-area",
  icon: Compass,
  mainMetric: "",
  metricCard: <NavigationMetricCard />,
};

export default NavigationPortal;
