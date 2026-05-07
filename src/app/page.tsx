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
    <main className="bg-black relative">

      {/* ============ SECTION 1: TITLE SCREEN ============ */}
      <section className="h-screen flex flex-col items-center justify-center bg-black px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white">
            Geoscope
          </h1>

          <div className="w-12 h-px bg-white/20 mx-auto mt-8 mb-6" />

          <p className="text-sm sm:text-base font-light text-white/40 tracking-wide uppercase">
            A design science experiment
          </p>

          <p className="text-xs sm:text-sm font-light text-white/30 mt-2 max-w-sm mx-auto">
            Inspired by Buckminster Fuller
          </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[11px] sm:text-xs font-light text-white/20 tracking-wider uppercase">
            Scroll
          </p>
        </div>
      </section>

      {/* ============ SECTION 2: STORY OF HUMANITY (TIMELINE) ============ */}
      <section className="h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950">
        <TimelineDesign />
      </section>

      {/* ============ SECTION 3: DYMAXION MAP ============ */}
      <section className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center">
        <div className="w-full pt-16 lg:pt-20">
          <div className="px-6 lg:px-12 pb-8 lg:pb-10">
            <h2 className="text-3xl lg:text-4xl font-serif text-white mb-2">Dymaxion Map</h2>
            <p className="text-gray-400 text-sm lg:text-base max-w-lg">
              A global systems visualization inspired by Buckminster Fuller's projection —
              revealing planetary patterns without distorting the relationships between lands and peoples.
            </p>
          </div>
          <DymaxionBase />
        </div>
      </section>

      {/* ============ FUTURE FEATURES (hidden for V1) ============ */}
      {false && (
        <>
          {/* Top Bar */}
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

          {/* Main Portal Screen */}
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
        </>
      )}
    </main>
  )
}