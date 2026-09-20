"use client";

import React from "react";
import NavigationPortal from "./portal";
import PortalCard from "../../components/portal-design/portal-design";
import { Navigation } from "lucide-react";

export default function SciencePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{NavigationPortal.subtitle}</h1>

      <PortalCard
        title={NavigationPortal.title}
        subtitle={NavigationPortal.subtitle}
        description={NavigationPortal.description}
        icon={NavigationPortal.icon}
        mainMetric={NavigationPortal.mainMetric}
        secondaryMetric={NavigationPortal.secondaryMetric}
        href={NavigationPortal.href}
      />

      {/* Add more content specific to Science here */}
    </div>
  );
}
