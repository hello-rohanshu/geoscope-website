// app/areas/science/portal.tsx
import React from "react";
import { Compass } from "lucide-react";
import { PortalConfig } from "../../components/portal-config";
import NavigationRadarChart from "../../components/navigation-graph-horizontal";
import NavigationReadinessRow from "../../components/navigation-readiness-row";

const NavigationMetricCard: React.FC = () => {
  return (
    <div className="grid grid-rows-[3fr_auto] w-full h-full text-gray-200">
      {/* Radar Chart Row */}
      <div className="flex flex-col items-center justify-center w-full h-[100%]">
        <NavigationRadarChart />
      </div>

      {/* Readiness Row - scrollable as a whole */}
      <div className="overflow-x-auto w-full scrollbar-custom">
        <NavigationReadinessRow />
      </div>
    </div>
  );
};

const NavigationPortal: PortalConfig = {
  title: "Navigation",
  subtitle: "Science",
  description: "",
  href: "/areas/science",
  icon: Compass,
  mainMetric: "",
  metricCard: <NavigationMetricCard />,
};

export default NavigationPortal;
