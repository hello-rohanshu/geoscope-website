// src/components/portal-config.tsx
import React from "react";
import { MetadataKey } from "./metadata-index";

export type PortalConfig = {
  title: string;
  subtitle: React.ReactNode;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;

  mainMetric?: string;
  secondaryMetric?: string;
  metricCard?: React.ReactNode;

  metadataKey?: MetadataKey; // <- fully type-safe now
};
