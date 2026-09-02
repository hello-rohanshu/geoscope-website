"use client";

import React from "react";
import CrewHarmonyPortal from "./portal";
import PortalCard from "../../components/portal-design/portal-design";

export default function CulturePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{CrewHarmonyPortal.subtitle}</h1>

      <PortalCard
        title={CrewHarmonyPortal.title}
        subtitle={CrewHarmonyPortal.subtitle}
        description={CrewHarmonyPortal.description}
        icon={CrewHarmonyPortal.icon}
        mainMetric={CrewHarmonyPortal.mainMetric}
        secondaryMetric={CrewHarmonyPortal.secondaryMetric}
        metricCard={CrewHarmonyPortal.metricCard}
        href={CrewHarmonyPortal.href}       // ← REQUIRED
      />

      {/* Add more content specific to Culture here */}
    </div>
  );
}
