// app/areas/standard-of-life/portal.tsx
import React from "react";
import { Heart } from "lucide-react";
import { PortalConfig } from "../../components/portal-design/portal-config";
import { LifeSupportPies } from "../../components/portal-life-support/life-support-pies";
import { LifeSupportGraph } from "../../components/portal-life-support/life-support-graph";

const LifeSupportMetricCard: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-around">
      {/* Row 1: pies */}
      <div className="w-full">
        <LifeSupportPies />
      </div>

      {/* Row 2: trend line */}
      <div className="w-full h-[50%]">
        <LifeSupportGraph />
      </div>
    </div>
  );
};

const LifeSupportPortal: PortalConfig = {
  title: "Life Support",
  subtitle: "Living Standards",
  description:
    "",
  href: "/areas/standard-of-life/full-area",
  icon: Heart,
  mainMetric: "",
  secondaryMetric: "",
  metricCard: <LifeSupportMetricCard />, // inject the component here
};

export default LifeSupportPortal;
