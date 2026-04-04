"use client";

import React from "react";
import FuelSystemPortal from "./portal";
import PortalCard from "../../components/portal-design";

export default function EarthSystemsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{FuelSystemPortal.subtitle}</h1>

      {/* Render portal in smaller form */}
      <PortalCard
        title={FuelSystemPortal.title}
        subtitle={FuelSystemPortal.subtitle}
        description={FuelSystemPortal.description}
        icon={FuelSystemPortal.icon}
        mainMetric={FuelSystemPortal.mainMetric}
        secondaryMetric={FuelSystemPortal.secondaryMetric}
        href = {FuelSystemPortal.href}
      />

      {/* Add more content specific to Earth Systems here */}
    </div>
  );
}
