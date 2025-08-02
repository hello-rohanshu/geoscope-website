// components/PopulationCard.tsx
'use client'
import React, { useEffect, useState } from 'react'

function formatNumberShort(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

function getPopulationBarColorDeviation(deviation: number): string {
  if (deviation < 10) return '#22c55e'   // Green
  if (deviation < 30) return '#facc15'   // Yellow
  if (deviation < 60) return '#f97316'   // Orange
  return '#ef4444'                       // Red
}

export default function PopulationCard() {
  const [current, setCurrent] = useState<number | null>(null)
  const optimal = 3_000_000_000
  const max = 12_000_000_000

  useEffect(() => {
    fetch(
      'https://api.worldbank.org/v2/country/WLD/indicator/SP.POP.TOTL?format=json&per_page=1'
    )
      .then((res) => res.json())
      .then((json) => {
        const row = json[1]?.[0]
        if (row?.value) setCurrent(row.value)
      })
      .catch((err) => console.error(err))
  }, [])

  const percent = current ? Math.min((current / max) * 100, 100) : 0
  const deviationPercent = current
    ? Math.min(Math.abs(current - optimal) / (max - optimal) * 100, 100)
    : 0

  const transitionPointPercentOptimal = (optimal / max) * 100

  return (
    <div className="w-1/4 p-6 bg-black shadow-md border-8 border-gray-700 rounded-none">
      <h2 className="text-xl font-semibold mb-4">Passengers</h2>

      <div className="relative w-full bg-gray-700 h-4 overflow-hidden mb-8 rounded-none">
        <div
          className="h-full transition-all duration-1000 rounded-none"
          style={{
            width: `${percent}%`,
            backgroundColor: getPopulationBarColorDeviation(deviationPercent)
          }}
        />
      </div>

      <div className="relative w-full -mt-2">
        <div
          className="absolute -bottom-0 text-xs text-white whitespace-nowrap"
          style={{ left: `${transitionPointPercentOptimal}%`, transform: 'translateX(-50%)' }}
        >
          {formatNumberShort(optimal)}
        </div>

        <div
          className="absolute -bottom-0 text-xs text-white whitespace-nowrap"
          style={{ left: '100%', transform: 'translateX(-100%)' }}
        >
          {formatNumberShort(max)}
        </div>
      </div>
    </div>
  )
}
