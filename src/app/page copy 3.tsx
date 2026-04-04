'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import FuelSystemPortal from './areas/earth-systems/portal'
import LifeSupportPortal from './areas/standard-of-life/portal'
import CrewHarmonyPortal from './areas/culture/portal'
import NavigationPortal from './areas/science/portal'
import PopulationPortal from './areas/population/population-portal'
import PortalCard from './components/portal-design'
import EarthSim from './components/earth-sim'
import TimelineDesign from "./timeline/timeline-design";

export default function HomePage() {
  const router = useRouter()
  const portals = [
    LifeSupportPortal,
    CrewHarmonyPortal,
    FuelSystemPortal,
    NavigationPortal,
  ]

  return (
    <main className="bg-black/30 ">
      {/* --- Section 1: Main Portal Screen --- */}
      <section className="relative h-screen overflow-hidden">
        {/* Fullscreen Background Earth */}
        <div className="absolute inset-0 z-0 ">
          <EarthSim />
        </div>

        {/* Portal Cards Grid */}
        <div className="relative z-10 p-6 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full justify-items-center items-center pointer-events-none">
          {portals.map((portal, index) => {
            let alignmentClasses = ''
            if (index === 0) alignmentClasses = 'self-start justify-self-start' // top-left
            if (index === 1) alignmentClasses = 'self-start justify-self-end'   // top-right
            if (index === 2) alignmentClasses = 'self-end justify-self-start'   // bottom-left
            if (index === 3) alignmentClasses = 'self-end justify-self-end'     // bottom-right

            return (
              <div
                key={portal.title}
                className={`portal-card-wrapper flex ${alignmentClasses} pointer-events-auto`}
              >
                <PortalCard
                  title={portal.title}
                  subtitle={portal.subtitle}
                  icon={portal.icon}
                  description={portal.description}
                  mainMetric={portal.mainMetric}
                  secondaryMetric={portal.secondaryMetric}
                  metricCard={portal.metricCard}
                  /* onClick={() => router.push(portal.href)} */
                />
              </div>
            )
          })}
        </div>

        {/* Population Portal - bottom center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <PopulationPortal />
        </div>
      </section>

      {/* --- Section 2: Scrollable Space Below --- */}
      <section className="h-screen">
        <TimelineDesign />
      </section>
    </main>
  )
}
