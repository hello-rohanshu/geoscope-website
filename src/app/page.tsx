'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import FuelSystemPortal from './areas/earth-systems/portal'
import LifeSupportPortal from './areas/standard-of-life/portal'
import CrewHarmonyPortal from './areas/culture/portal'
import NavigationPortal from './areas/science/portal'
import PopulationPortal from './areas/population/population-portal'
import PortalCard from './components/portal-design'
import EarthSim from './components/earth-sim'
import TimelineDesign from "./timeline/timeline-design"
import DesignScienceProgress from "./components/design-science-progress"
import DymaxionBase from './components/dymaxion-base'

export default function HomePage() {
  const router = useRouter()
  const [showHUD, setShowHUD] = useState(true)

  const portals = [
    LifeSupportPortal,
    CrewHarmonyPortal,
    FuelSystemPortal,
    NavigationPortal,
  ]

  return (
    <main className="bg-black/30 relative">

      {/* --- Top Bar --- */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-4 px-4 py-2 bg-white/5 backdrop-blur border border-white/20 rounded-2xl">
        <button
          className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10"
          onClick={() => setShowHUD(!showHUD)}
        >
          HUD
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10">
          Changelog
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10">
          Discord
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10">
          GitHub
        </button>
      </div>

      {/* --- Section 1: Main Portal Screen --- */}
      <section className="relative h-screen overflow-hidden">

        {/* Fullscreen Background Earth */}
        <div className="absolute inset-0 z-0">
          <EarthSim />
        </div>

        {/* Portal Cards Grid */}
        <div className="relative z-10 p-6 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full justify-items-center items-center pointer-events-none">
          {portals.map((portal, index) => {
            let offscreenX = 0
            if (typeof window !== "undefined") {
              if (index === 0 || index === 2) offscreenX = -window.innerWidth
              if (index === 1 || index === 3) offscreenX = window.innerWidth
            } else {
              if (index === 0 || index === 2) offscreenX = -2000
              if (index === 1 || index === 3) offscreenX = 2000
            }

            let alignmentClasses = ''
            if (index === 0) alignmentClasses = 'self-start justify-self-start'
            if (index === 1) alignmentClasses = 'self-start justify-self-end'
            if (index === 2) alignmentClasses = 'self-end justify-self-start'
            if (index === 3) alignmentClasses = 'self-end justify-self-end'

            return (
              <motion.div
                key={portal.title}
                className={`portal-card-wrapper flex ${alignmentClasses} pointer-events-auto will-change-transfrom`}
                animate={{ x: showHUD ? 0 : offscreenX }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <PortalCard
                  title={portal.title}
                  subtitle={portal.subtitle}
                  icon={portal.icon}
                  description={portal.description}
                  mainMetric={portal.mainMetric}
                  secondaryMetric={portal.secondaryMetric}
                  metricCard={portal.metricCard}
                  href={portal.href}
                  metadataKey={portal.metadataKey}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Population Portal */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto will-change-transform"
          animate={{ y: showHUD ? 0 : window.innerHeight }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <PopulationPortal />
        </motion.div>
      </section>

      {/* --- Section 2 --- */}
      <section className="h-screen">
        <TimelineDesign />
      </section>

      {/* --- Section 3: Dymaxion Map --- */}
      <section className="h-screen">
        <DymaxionBase />
        <DesignScienceProgress />
      </section>

    </main>
  )
}
