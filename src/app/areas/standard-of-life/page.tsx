"use client";

import React from "react";
import LifeSupportPortal from "./portal";
import PortalCard from "../../components/portal-design/portal-design";

export default function StandardOfLifePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{LifeSupportPortal.subtitle}</h1>

      <PortalCard
        title={LifeSupportPortal.title}
        subtitle={LifeSupportPortal.subtitle}
        description={LifeSupportPortal.description}
        icon={LifeSupportPortal.icon}
        mainMetric={LifeSupportPortal.mainMetric}
        secondaryMetric={LifeSupportPortal.secondaryMetric}
        href={LifeSupportPortal.href}
      />

      {/* Add more content specific to Standard of Life here */}
    </div>
  );
}
