'use client'

import React from 'react'
import PopulationMetrics from './population-metrics'
import PopulationGraph from './population-graph'

export default function PopulationPortal() {
  return (
    <div
      className="
        bg-white/5
        backdrop-blur
        border border-white/20
        rounded-xl
        flex flex-row
        overflow-hidden
        pointer-events-auto
        w-[30rem]          /* wider than standard portal */
        h-[10rem]          /* shorter height */
        p-3
      "
    >
      {/* Left: live metrics */}
      <div className="flex flex-col justify-center items-start w-1/2 pr-3">
        <PopulationMetrics />
      </div>

      {/* Right: historic graph */}
      <div className="flex items-center justify-center w-1/2 pl-3">
        <PopulationGraph />
      </div>
    </div>
  )
}
