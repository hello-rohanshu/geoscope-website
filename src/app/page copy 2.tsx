
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import FuelSystemPortal from './areas/earth-systems/portal'
import LifeSupportPortal from './areas/standard-of-life/portal'
import CrewHarmonyPortal from './areas/culture/portal'
import NavigationPortal from './areas/science/portal'

import PortalCard from './components/portal-design'
import EnergyCardCompact from './components/trash/fuel-mockup'
import DymaxionMap from './components/trash/dymaxion-map'
import  EarthSim  from './components/earth-sim'

export default function HomePage() {
  const router = useRouter()

  const portals = [
    LifeSupportPortal,
    CrewHarmonyPortal,
    FuelSystemPortal,
    NavigationPortal,
  ]

  return (
    <div className="relative min-h-screen bg-black/30 font-manrope overflow-hidden p-6">
      {/* Background Earth */}
      <div className="absolute inset-0 z-0">
<EarthSim/>
      </div>

      {/* Portal Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full justify-items-center items-center pointer-events-none">
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
    </div>
  )
}
