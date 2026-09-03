"use client";
import { useEffect, useState, useRef } from "react";
import IcosahedronGlobe from "./icosahedron-globe";
import { loadRaster, isLoaded } from "@/utils/raster-engine";
import { sampleRasterPresence, PopulationSample } from "@/utils/population-layer";

const RASTER_URL = "/population_2024_1440x720_cog.tif";

export default function StarryGlobe() {
  const [samples, setSamples] = useState<PopulationSample[]>([]);

  useEffect(() => {
    (isLoaded() ? Promise.resolve(true) : loadRaster(RASTER_URL)).then((ok) => {
      if (ok) setSamples(sampleRasterPresence());
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Starfield canvas layer */}
      <canvas
        ref={(el) => {
          if (!el) return;
          const ctx = el.getContext("2d");
          if (!ctx) return;

          // Set canvas size to match parent
          const resize = () => {
            el.width = el.parentElement?.clientWidth || window.innerWidth;
            el.height = el.parentElement?.clientHeight || window.innerHeight;
          };
          resize();
          window.addEventListener("resize", resize);

          const stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * el.width,
            y: Math.random() * el.height,
            r: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.02 + 0.005,
          }));

          const animate = () => {
            ctx.clearRect(0, 0, el.width, el.height);
            stars.forEach((star) => {
              star.x -= star.speed;
              if (star.x < 0) star.x = el.width;
              ctx.beginPath();
              ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
              ctx.fillStyle = "white";
              ctx.fill();
            });
            requestAnimationFrame(animate);
          };
          animate();
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Globe */}
      <div className="relative z-10 w-full max-w-3xl aspect-square">
        <IcosahedronGlobe
          populationSamples={samples}
          showPopulation={true}
        />
      </div>
    </div>
  );
}