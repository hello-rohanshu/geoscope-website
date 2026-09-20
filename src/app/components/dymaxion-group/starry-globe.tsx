"use client";

import { useEffect, useRef, useState } from "react";
import IcosahedronGlobe from "./icosahedron-globe";
import { loadRaster } from "@/utils/raster-engine";
import { collectRasterSamples, OverlaySample } from "@/utils/overlay-layer";

const RASTER_ID = "population";
const RASTER_URL = "/population_2024_1440x720_cog.tif";

export default function StarryGlobe() {
  const [samples, setSamples] = useState<OverlaySample[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load population raster → samples
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await loadRaster(RASTER_ID, RASTER_URL);
      if (!ok || cancelled) return;
      const collected = collectRasterSamples({ rasterId: RASTER_ID, threshold: 0 });
      if (!cancelled) setSamples(collected);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.02 + 0.005,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        star.x -= star.speed;
        if (star.x < 0) star.x = canvas.width;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-3xl aspect-square">
        <IcosahedronGlobe
          overlaySamples={samples}
          showOverlay={true}
        />
      </div>
    </div>
  );
}