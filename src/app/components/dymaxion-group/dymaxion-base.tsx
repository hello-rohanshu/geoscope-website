"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import IcosahedronGlobe from "./icosahedron-globe";
import { GLOBE_STAGES, SEGMENT_COUNT } from "@/utils/icosahedron-geometry";
import { loadRaster, isLoaded } from "@/utils/raster-engine";
import { sampleRasterPresence, PopulationSample } from "@/utils/population-layer";

const RASTER_URL = "/population_2024_1440x720_cog.tif";

export default function DymaxionBase() {
  const [showPopulation, setShowPopulation] = useState(false); // ← off by default
  const [samples, setSamples] = useState<PopulationSample[]>([]);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [stage, setStage] = useState<number>(GLOBE_STAGES.SPHERE);

  // Load Earth texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load("/earth_day.jpg");
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    setEarthTexture(tex);
  }, []);

  // Load population raster data
  useEffect(() => {
    (isLoaded() ? Promise.resolve(true) : loadRaster(RASTER_URL)).then((ok) => {
      if (ok) setSamples(sampleRasterPresence());
    });
  }, []);

  const atFlat = stage === GLOBE_STAGES.DYMAXION;

  return (
    <div className="relative w-full p-4 sm:p-8 lg:p-12 flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8 bg-transparent">
      {/* Stage Prev/Next — always visible */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setStage((s) => Math.max(0, s - 1))}
          disabled={stage <= 0}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold tracking-wide transition-colors shadow-lg"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setStage((s) => Math.min(SEGMENT_COUNT, s + 1))}
          disabled={stage >= SEGMENT_COUNT}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold tracking-wide transition-colors shadow-lg"
        >
          Next
        </button>
      </div>

      {/* Left Column: Map + Timeline */}
      <div className="flex flex-col gap-6 flex-[2]">
        {/* Globe Container */}
        <div className="w-full max-w-[720px] mx-auto aspect-[2/1] max-h-[38vh] rounded-2xl shadow-xl overflow-hidden">
          {earthTexture ? (
            <IcosahedronGlobe
              stage={stage}
              onStageChange={setStage}
              populationSamples={samples}
              showPopulation={showPopulation}
              baseLayer={{ mode: 'texture', texture: earthTexture }}
            />
          ) : (
            <IcosahedronGlobe
              stage={stage}
              onStageChange={setStage}
              populationSamples={samples}
              showPopulation={showPopulation}
              baseLayer={{ mode: 'debug' }}
            />
          )}
        </div>

        {/* Timeline Placeholder — only at dymaxion stage */}
        {atFlat && (
          <div className="w-full h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400 font-mono text-sm px-4">
            Timeline will appear here
          </div>
        )}
      </div>

      {/* Right Column: Controls + Cards — only at dymaxion stage */}
      {atFlat && (
        <div className="flex flex-col gap-6 flex-[1] min-w-0 lg:min-w-[280px]">
          <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 space-y-4 flex-1">
            <div className="text-gray-300 font-semibold tracking-wide">
              Overlays
            </div>

            <label className="flex items-center gap-3 text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPopulation}
                onChange={() => setShowPopulation(v => !v)}
                className="accent-red-500"
              />
              <span>Population</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}