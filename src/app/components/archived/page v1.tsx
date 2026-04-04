'use client'

import React, { useState } from "react"
import Solarv1 from '../solar-system-attempt-sm'
import ToggleButton from '../toggle-button-design'
import EnergyCardv4 from '../fuel-gauges-vertical-detailed'
import EnergyCardv405 from '../fuel-gauges-vertical-simple'
import SpinningEarth from "../earth-sim"
import EarthOverlay from "../earth-overlay"
import SolarSystemEmbed from "../solar-system-scope-embed"
import NasaSolarEmbed from "../solar-system-nasa-embed"
import DymaxionUnfold from '../dymaxion-unfold-old'
import PopulationCard from "../population-card-v1"

export default function HomePage() {
  const [isToggled, setIsToggled] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative top-0 h-screen">
        <SpinningEarth/>
        {/* <EarthOverlay /> */}
      </div>

      {/* Centered Card Section */}
      <div className="relative z-10 flex flex-col items-center justify-center bg-transparent m-[9.01%] mb-0 pb-[9.01%] gap-6">
        
        {/* Population Card */}
        <div className="bg-gray-900 text-white p-6 w-full shadow-xl">
          <PopulationCard />
        </div>

        {/* Energy Card with Toggle (keeps original width behavior, no rounded corners) */}
        <div className="relative bg-gray-900 text-white p-6 shadow-xl w-full">
          {/* Toggle inside this card (top-right) */}
          <div className="absolute top-4 right-4">
            <ToggleButton
              toggled={isToggled}
              onToggle={() => setIsToggled(prev => !prev)}
            />
          </div>

          {/* Conditional Card Rendering */}
          {!isToggled ? <EnergyCardv405 /> : <EnergyCardv4 />}
        </div>
      </div>
    </main>
  )
}
