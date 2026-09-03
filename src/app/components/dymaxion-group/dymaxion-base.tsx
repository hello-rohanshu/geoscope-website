"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import IcosahedronGlobe from "./icosahedron-globe";
import { loadRaster, isLoaded } from "@/utils/raster-engine";
import { sampleRasterPresence, PopulationSample } from "@/utils/population-layer";

const RASTER_URL = "/population_2024_1440x720_cog.tif";

export default function DymaxionBase() {
  const [samples, setSamples] = useState<PopulationSample[]>([]);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load("/earth_day.jpg");
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    setEarthTexture(tex);
  }, []);

  useEffect(() => {
    (isLoaded() ? Promise.resolve(true) : loadRaster(RASTER_URL)).then((ok) => {
      if (ok) setSamples(sampleRasterPresence());
    });
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-900">
      {earthTexture ? (
        <IcosahedronGlobe
          populationSamples={samples}
          showPopulation={true}
          baseLayer={{ mode: 'texture', texture: earthTexture }}
        />
      ) : (
        <IcosahedronGlobe
          populationSamples={samples}
          showPopulation={true}
          baseLayer={{ mode: 'debug' }}
        />
      )}
    </div>
  );
}