// components/EnergyCardcopy.tsx
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

export default function EnergyCard() {
  const energySources: EnergySource[] = [
    {
      name: 'Solar',
      usage: 27,
      regen: 3850000,
      renewable: true,
      reservesPercent: 100,
      acceleration: 4.9,
      yearsLeft: Infinity,
      yearsSinceUse: 10,
      reliance: 3
    },
    {
      name: 'Coal',
      usage: 164,
      regen: 0,
      renewable: false,
      reservesPercent: 35,
      acceleration: 2.5,
      yearsLeft: 133,
      yearsSinceUse: 200,
      reliance: 37
    },
    {
      name: 'Oil',
      usage: 180,               // Typically higher usage than coal globally
      regen: 0,                 // Non-renewable
      renewable: false,
      reservesPercent: 45,      // Example: slightly higher reserves than coal
      acceleration: 1.8,        // Somewhat slower acceleration in usage change
      yearsLeft: 80,            // Estimated years left, typically less than coal
      yearsSinceUse: 150,       // Oil has been in use for quite some time
      reliance: 30              // Reliance percentage (subjective example)
    },
    {
      name: 'Gas',
      usage: 120,               // Usage typically less than oil and coal but significant
      regen: 0,                 // Non-renewable
      renewable: false,
      reservesPercent: 50,      // Estimated reserves, often higher than oil in some regions
      acceleration: 1.2,        // Usage growth rate (example)
      yearsLeft: 70,            // Rough estimate of remaining years
      yearsSinceUse: 100,       // Has been used for a long time but less than coal/oil
      reliance: 25              // Reliance percentage (example)
    },
    {
      name: 'Gas',
      usage: 120,               // Usage typically less than oil and coal but significant
      regen: 0,                 // Non-renewable
      renewable: false,
      reservesPercent: 50,      // Estimated reserves, often higher than oil in some regions
      acceleration: 1.2,        // Usage growth rate (example)
      yearsLeft: 70,            // Rough estimate of remaining years
      yearsSinceUse: 100,       // Has been used for a long time but less than coal/oil
      reliance: 25              // Reliance percentage (example)
    },
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
    <div className="w-full p-6 bg-black shadow-md border-8 border-gray-700 rounded-none font-rajdhani overflow-auto scrollbar-custom min-w-[14.59%] ">
      <h2 className="text-3xl font-semibold mb-7 ">Fuel Gauges</h2>

      <div className='pr-[9.01%]'>
        <div className="grid gap-2 gap-y-14 grid-cols-[repeat(auto-fit,_minmax(173,_1fr))] ">
          {energySources.map((src, index) => {
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
                className="flex flex-col items-center text-white p-2 "
              >
                {/* Battery + Metrics Row */}
                <div className="flex flex-row items-center gap-1 w-full relative ">

                  {/* Battery */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 w-8 h-32 bg-gray-800 flex flex-col justify-end overflow-hidden flex-shrink-0"
                    style={{
                      border: '4px solid',
                      borderColor: src.renewable ? '#89ff8fff' : '#7faef9ff'
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

                  </div>

                  {/* Metrics Panel */}
                  <div className="flex flex-col items-start justify-between h-32 py-1 text-base font-medium text-white/9 leading-tight relative ml-[clamp(61.8%,61.8%,61.8%)] ">
                    {/* Years Left Panel metric-child-1*/}
                    <div className='flex flex-col text-center items-center'>
                      {/* years-left first row */}
                      <div className="flex  flex-row whitespace-nowrap text-white/17">
                        <span className="text-5xl font-light tracking-tight">
                          {src.yearsLeft === Infinity ? '∞' : src.yearsLeft}
                        </span>
                        <span className="relative text-white/9 font-normal mt-5.5 ">
                          {src.yearsLeft === Infinity ? '' : '/' + ((+src.yearsSinceUse) + (+src.yearsLeft))}
                        </span>
                      </div>
                      {/* years-left second row */}
                      <div className="self-start flex flex-col text-lg ml-1 mt-[-8] leading-5 text-white/17">
                        <span className="relative">years left</span>
                        <span className="relative"></span>
                      </div>

                    </div>

                    <div className="ml-1 mt-auto whitespace-nowrap self-start">
                      <span>{src.reliance}% reliance</span>
                    </div>
                  </div>
                  {/* Metric Panel Ends */}


                </div>

                {/* Resource Name */}
                <div className="mt-2 text-base text-center font-medium leading-base tracking-wide">{src.name}</div>
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
    </div>
  )
}
