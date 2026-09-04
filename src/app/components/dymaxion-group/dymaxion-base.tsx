"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import IcosahedronGlobe from "./icosahedron-globe";
import { loadRaster, isLoaded } from "@/utils/raster-engine";
import { sampleRasterPresence, PopulationSample } from "@/utils/population-layer";

const RASTER_URL = "/population_2024_1440x720_cog.tif";

export default function DymaxionBase() {
  const [showPopulation, setShowPopulation] = useState(true);
  const [samples, setSamples] = useState<PopulationSample[]>([]);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);

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

  return (
    <div className="w-full p-4 sm:p-8 lg:p-12 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Left Column: Map + Timeline */}
      <div className="flex flex-col gap-6 flex-[2]">
        {/* Globe Container */}
        <div className="w-full aspect-[2/1] rounded-2xl shadow-xl overflow-hidden border border-gray-700 bg-gray-900">
          {earthTexture ? (
            <IcosahedronGlobe
              populationSamples={samples}
              showPopulation={showPopulation}
              baseLayer={{ mode: 'texture', texture: earthTexture }}
            />
          ) : (
            <IcosahedronGlobe
              populationSamples={samples}
              showPopulation={showPopulation}
              baseLayer={{ mode: 'debug' }}
            />
          )}
        </div>

        {/* Timeline Placeholder */}
        <div className="w-full h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400 font-mono text-sm px-4">
          Timeline will appear here
        </div>
      </div>

      {/* Right Column: Controls + Cards */}
      <div className="flex flex-col gap-6 flex-[1] min-w-0 lg:min-w-[280px]">
        {/* Overlay Toggles */}
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
    </div>
  );
}