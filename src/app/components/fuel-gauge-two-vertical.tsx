// components/EnergyCardv5.tsx
'use client'
import React from 'react'

interface EnergySource {
  name: string
  usage: number
  regen: number
  renewable: boolean
  reservesPercent: number
  acceleration: number
  yearsLeft: number
  yearsSinceUse: number
  reliance: number
}

const EnergyCard: React.FC = () => {
  const energySources: EnergySource[] = [
    {
      name: 'Renewable',
      usage: 200,
      regen: 11100,
      renewable: true,
      reservesPercent: 100,
      acceleration: 3.0,
      yearsLeft: 5e9,
      yearsSinceUse: 50,
      reliance: 30
    },
    {
      name: 'Fossil',
      usage: 529,
      regen: 0,
      renewable: false,
      reservesPercent: 52,
      acceleration: 1.8,
      yearsLeft: 95,
      yearsSinceUse: 150,
      reliance: 70
    }
  ]

  const MIN_PULSE_DURATION = 0.5
  const MAX_PULSE_DURATION = 5

  const pulses = energySources.map(src =>
    Math.abs((src.regen ?? 0) - (src.usage ?? 0))
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
    <div className="w-full max-w-3xl mx-auto font-manrope p-4">
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
        {energySources
          .slice()
          .sort((a, b) => b.reliance - a.reliance)
          .map((src, index) => {
            const pulse = (src.regen ?? 0) - (src.usage ?? 0)
            const animationDuration = getPulseDuration(Math.abs(pulse))
            const animationName = pulse >= 0 ? 'shine-up' : 'shine-down'

            let fillPercent = 100
            if (!src.renewable) {
              fillPercent = src.reservesPercent ?? 0
            } else if (pulse < 0) {
              fillPercent = Math.max(100 + (pulse / src.regen) * 100, 0)
            }

            return (
              <div
                key={index}
                className="flex flex-col items-center text-white gap-2 border rounded-md p-4"
              >
                {/* Battery + Metrics Row */}
                <div className="flex flex-row gap-4 w-full items-center justify-center">
                  {/* Battery */}
                  <div
                    className="relative min-w-8 h-32 bg-gray-800 flex flex-col justify-end overflow-hidden border-4"
                    style={{
                      borderColor: src.renewable ? '#89ff8fff' : '#7faef9ff'
                    }}
                  >
                    {/* Pulse animation inside battery */}
                    <div
                      className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.4) 100%)',
                        animation: `${animationName} ${animationDuration} linear infinite`
                      }}
                    ></div>

                    {/* Fill bar */}
                    <div
                      className="w-full"
                      style={{
                        height: `${fillPercent}%`,
                        backgroundColor: getBatteryColor(fillPercent, src.renewable)
                      }}
                    ></div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col justify-between h-32 text-white/70 text-sm">
                    <div className="text-lg font-thin">
                      {src.yearsLeft >= 1e6 ? <>10<sup>9</sup></> : src.yearsLeft}{' '}
                      years left
                    </div>
                    <div>{src.reliance}% reliance</div>
                  </div>
                </div>

                {/* Resource Name */}
                <div className="text-base font-medium text-center">{src.name}</div>
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

export default EnergyCard
