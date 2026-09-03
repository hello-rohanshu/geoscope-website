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

  // Load earth texture on client only (fixes SSR/document error)
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load("/earth_day.jpg");
    setEarthTexture(tex);
  }, []);

  useEffect(() => {
    (isLoaded() ? Promise.resolve(true) : loadRaster(RASTER_URL)).then((ok) => {
      if (ok) setSamples(sampleRasterPresence());
    });
  }, []);

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8">
      <div className="flex flex-col gap-6 flex-[3] min-w-0">
        <div className="w-full flex-1 min-h-[500px] lg:min-h-[600px] rounded-2xl shadow-xl overflow-hidden border border-gray-700 bg-gray-900">
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
        <div className="w-full h-24 bg-gray-800 rounded-lg border border-gray-600 p-4 flex items-center">
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>1950</span>
              <span>1975</span>
              <span>2000</span>
              <span>2024</span>
            </div>
            <div className="relative h-2 bg-gray-700 rounded-full">
              <div className="absolute left-0 top-0 h-full w-1/3 bg-red-500 rounded-full"></div>
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 flex-[1] min-w-0 xl:min-w-[300px] xl:max-w-[400px]">
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 space-y-6 flex-1">
          <div className="text-gray-300 font-semibold tracking-wide text-lg">Overlays</div>
          <label className="flex items-center gap-3 text-gray-300 cursor-pointer select-none group">
            <input 
              type="checkbox" 
              checked={showPopulation} 
              onChange={() => setShowPopulation(v => !v)} 
              className="accent-red-500 w-4 h-4 cursor-pointer" 
            />
            <span className="group-hover:text-white transition-colors">Population</span>
          </label>
        </div>
      </div>
    </div>
  );
}