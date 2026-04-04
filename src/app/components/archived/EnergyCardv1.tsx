// components/EnergyCard.tsx
'use client'
import React from 'react'

interface EnergySource {
  name: string
  usage: number
  regenerationRate: number
  renewable: boolean
  reservesPercent?: number
}

export default function EnergyCard() {
  const MIN_PULSE_DURATION = 0.5
  const MAX_PULSE_DURATION = 5

  const energySources: EnergySource[] = [
    { name: 'Solar', usage: 8, regenerationRate: 3850000, renewable: true },
    { name: 'Wind', usage: 19, regenerationRate: 2600, renewable: true },
    { name: 'Hydro', usage: 39, regenerationRate: 50, renewable: true },
    { name: 'Bioenergy', usage: 55, regenerationRate: 3000, renewable: true },
    { name: 'Geothermal', usage: 4, regenerationRate: 1400, renewable: true },
    { name: 'Tidal', usage: 0.003, regenerationRate: 3, renewable: true },
    { name: 'Nuclear', usage: 25, regenerationRate: 0, renewable: false, reservesPercent:60 },
    { name: 'Oil', usage: 190, regenerationRate: 0, renewable: false, reservesPercent: 40 },
    { name: 'Coal', usage: 155, regenerationRate: 0, renewable: false, reservesPercent: 30 },
    { name: 'Gas', usage: 145, regenerationRate: 0, renewable: false, reservesPercent: 35 }
  ]

  const pulses = energySources.map(src =>
    Math.abs((src.regenerationRate ?? 0) - (src.usage ?? 0))
  )
  const maxPulse = Math.max(...pulses)

  function getPulseDuration(pulse: number): string {
    if (pulse === 0 || maxPulse === 0) return `${MAX_PULSE_DURATION}s`
    const normalized = pulse / maxPulse
    const duration =
      MAX_PULSE_DURATION - normalized * (MAX_PULSE_DURATION - MIN_PULSE_DURATION)
    return `${duration.toFixed(2)}s`
  }

  function getBatteryColor(percent: number, renewable: boolean): string {
    if (percent > 80) return renewable ? '#22c55e' : '#60a5fa'
    if (percent > 40) return renewable ? '#84cc16' : '#f97316'
    return renewable ? '#facc15' : '#ef4444'
  }

  return (
    <div className="w-3/4 p-6 bg-black shadow-md border-8 border-gray-700 rounded-none">
      <h2 className="text-xl font-semibold mb-7 text-center ">Fuel Gauges</h2>

      <div className="grid grid-cols-4 gap-4">
        {energySources.map((src, index) => {
          const pulse = (src.regenerationRate ?? 0) - (src.usage ?? 0)
          const animationDuration = getPulseDuration(Math.abs(pulse))
          const animationName = pulse >= 0 ? 'shine-up' : 'shine-down'

          let fillPercent = 100
          if (!src.renewable) {
            fillPercent = src.reservesPercent ?? 0
          } else if (pulse < 0) {
            fillPercent = Math.max(100 + (pulse / src.regenerationRate) * 100, 0)
          }

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="relative w-8 h-32 bg-gray-800 flex flex-col justify-end overflow-hidden"
                style={{
                  border: '4px solid',
                  borderColor: src.renewable ? '#89ff8fff' : '#b9d4ffff'
                }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-full opacity-30 bg-gray-500 pointer-events-none"
                  style={{
                    animation: `${animationName} ${animationDuration} linear infinite`
                  }}
                ></div>

                <div
                  className="w-full"
                  style={{
                    height: `${fillPercent}%`,
                    backgroundColor: getBatteryColor(fillPercent, src.renewable)
                  }}
                ></div>

                {src.renewable && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                    ∞
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm text-white text-center">
                {src.name}
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes shine-down {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        @keyframes shine-up {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  )
}
