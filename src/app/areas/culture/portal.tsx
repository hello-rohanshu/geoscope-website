// app/areas/culture/portal.tsx
import React from "react";
import { Users } from "lucide-react";
import { PortalConfig } from "../../components/portal-config";
import {CulturePortal} from "../../components/crew-harmony-portal";

const CrewMetricCard: React.FC = () => {
  return <div className="h-full w-full">
    <CulturePortal/>
  </div>;
};

const CrewHarmonyPortal: PortalConfig = {
  title: "Crew Harmony",
  subtitle: "Culture",
  description:
    "",
  href: "/areas/culture/full-area",
  icon: Users,
  mainMetric: "",
  metricCard: <CrewMetricCard />,
};

export default CrewHarmonyPortal;
