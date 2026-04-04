'use client'

import React, { useEffect, useState } from 'react'
import {
  populationNow,
  getRates,
  TimeUnit,
  netGrowthPerSecond,
} from './population-data'

export default function PopulationMetrics() {
  const [currentPopulation, setCurrentPopulation] = useState(Math.floor(populationNow))
  const [unit, setUnit] = useState<TimeUnit>('second')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPopulation((prev) => Math.floor(prev + netGrowthPerSecond))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const cycleUnit = () => {
    const order: TimeUnit[] = ['second', 'minute', 'hour', 'day', 'year']
    const next = (order.indexOf(unit) + 1) % order.length
    setUnit(order[next])
  }

  const rates = getRates(unit)

  return (
    <div className="flex flex-col justify-between h-full text-white">
      {/* --- Top Half --- */}
      <div className="flex flex-col leading-tight">
        <div className="text-2xl font-semibold tracking-wide">
          {currentPopulation.toLocaleString('en-US')}
        </div>
        <div className="text-gray-300 text-base">humans</div>
      </div>

      {/* --- Bottom Half --- */}
      <div className="flex items-stretch text-sm text-gray-300">
        {/* Left column: rates */}
        <div className="flex flex-col justify-between">
          <div className="text-emerald-400 font-medium">
            +{Math.round(rates.births).toLocaleString()} humans
          </div>
          <div className="text-rose-400 font-medium">
            −{Math.round(rates.deaths).toLocaleString()} humans
          </div>
        </div>

        {/* Slightly smaller gap */}
        <div className="w-2" />

        {/* Right column: per-unit button */}
        <button
          onClick={cycleUnit}
          className="
            flex flex-col items-center justify-center
            px-2 rounded-md text-xs text-gray-300
            bg-white/5 hover:bg-white/10
            transition-colors
            w-12 text-center leading-tight
          "
        >
          <span>per</span>
          <span>{unit}</span>
        </button>
      </div>
    </div>
  )
}
