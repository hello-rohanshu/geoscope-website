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

  const formatShort = (value: number): string => {
    const abs = Math.abs(value);

    if (abs >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B';
    if (abs >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
    if (abs >= 1_000) return (value / 1_000).toFixed(2) + 'K';

    return Math.round(value).toString();
  };

  return (
    <div className="flex flex-col justify-between h-full text-white">
      {/* --- Top Half --- */}
      <div className="flex flex-col leading-tight">
        <div className="text-3xl font-semibold tracking-wide">
          {currentPopulation.toLocaleString('en-US')}
        </div>
        <div className="text-gray-300 text-xl font-medium [word-spacing:3px]">passengers</div>
      </div>

      {/* --- Bottom Half --- */}
      <div className="flex items-stretch text-sm text-gray-300">
        {/* Left column: rates */}
        <div className="flex flex-col justify-center">
          <div className="text-emerald-400 font-medium">
            +{formatShort(rates.births)} passengers
          </div>

          <div className="text-rose-400 font-medium">
            −{formatShort(rates.deaths)} passengers
          </div>

        </div>

        {/* Slash divider */}
        <div className="flex items-center justify-center px-2 pb-2">
          <div className="text-gray-400 text-4xl leading-none select-none">/</div>
        </div>

        {/* Right column: unit button */}
        <button
          onClick={cycleUnit}
          className="
            flex items-center justify-center pb-[2%]
            px-2 rounded-md text-base text-gray-300
            bg-white/3 hover:bg-white/8
            transition-colors
            font-normal leading-tight
          "
        >
          {unit}
        </button>
      </div>
    </div>
  )
}
