// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import IcosahedronGlobe from "./components/icosahedron-globe";
import LandmassOverlay from "./components/landmass-overlay";
import { loadDymaxionPaths } from "./components/dymaxion-paths";
import type { DymaxionPath } from "./components/dymaxion-paths";

export default function HomePage() {
  const [paths, setPaths] = useState<DymaxionPath[]>([]);

  useEffect(() => {
    import("@/data/world-110m.json").then((worldData: any) => {
      loadDymaxionPaths(worldData.default || worldData).then((data: DymaxionPath[]) => {
        setPaths(data);
      });
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "24px",
      padding: "40px 20px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <h1 style={{
        color: "#666",
        fontSize: "14px",
        fontWeight: 400,
        letterSpacing: "2px",
        textTransform: "uppercase",
        margin: 0,
      }}>
        Icosahedron Globe
      </h1>

      <div style={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 0 60px rgba(0,0,0,0.5)",
      }}>
        <IcosahedronGlobe width={680} height={500}>
          <LandmassOverlay paths={paths} color="#666666" />
        </IcosahedronGlobe>
      </div>

      <p style={{
        color: "#555",
        fontSize: "12px",
        margin: 0,
      }}>
        Click globe to toggle • Drag to rotate
      </p>
    </div>
  );
}