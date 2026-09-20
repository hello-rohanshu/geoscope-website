// src/areas/earth-systems/portal.tsx
import React from "react";
import { Zap } from "lucide-react";

import FuelReliancePie from "../../components/portal-fuel/fuel-reliance-pie";
import TwoGaugesHorizontal from "../../components/portal-fuel/fuel-guages-horizontal";
import EnergyConsumptionChart from "../../components/portal-fuel/fuel-graph";

import { PortalConfig } from "../../components/portal-design/portal-config";

const FuelMetricCard = () => (
  <div className="flex w-full h-full flex-col justify-between">
    <div className="flex w-full flex-row">
      <div className="flex flex-col items-center flex-[5]">
        <TwoGaugesHorizontal />
      </div>

      <div className="flex flex-col justify-center flex-[4]">
        <FuelReliancePie />
      </div>
    </div>

    <div className="flex w-full h-[50%]">
      <EnergyConsumptionChart />
    </div>
  </div>
);

const FuelSystemPortal: PortalConfig = {
  title: "Fuel System",
  subtitle: "Earth Systems",
  description: "Overview of fossil and renewable energy flows.",
  href: "/areas/earth-systems/full-area",
  icon: Zap,
  mainMetric: "",
  secondaryMetric: "",
  metricCard: <FuelMetricCard />,

  // Correct key
  metadataKey: "fuel",
};

export default FuelSystemPortal;
