// components/EnergyCardv4.tsx
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
      yearsLeft: 5e9,
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
      name: 'Nuclear',
      usage: 65,                // Lower than gas, oil, coal; significant in some countries
      regen: 0,                  // Non-renewable (uranium/thorium are finite)
      renewable: false,
      reservesPercent: 80,       // Estimated reserves; fairly high with known uranium + breeder potential
      acceleration: 0.8,         // Slower growth rate; expansion limited by policy/cost
      yearsLeft: 90,             // Rough estimate based on known uranium resources & current tech
      yearsSinceUse: 70,         // Commercial use began mid-20th century
      reliance: 10               // Global reliance relatively low (~10% of total electricity)
    },
    {
      name: 'Wind',
      usage: 19,                  // Global average usage (EJ/year or equivalent)
      regen: 2600,                // Huge renewable potential
      renewable: true,
      reservesPercent: 100,       // Effectively unlimited (renewable)
      acceleration: 3.5,          // Rapid growth in recent decades
      yearsLeft: 5e9,        // Renewable
      yearsSinceUse: 50,          // Modern commercial wind since ~1970s
      reliance: 7                 // ~7% of global electricity, smaller % of total energy
    },
    {
      name: 'Hydro',
      usage: 39,                  // Largest renewable share globally
      regen: 50,                  // Limited by geography and climate
      renewable: true,
      reservesPercent: 85,        // Most viable sites already tapped
      acceleration: 0.5,          // Growth is slow due to saturation
      yearsLeft: 5e9,        // Renewable
      yearsSinceUse: 140,         // Large dams since early 20th century
      reliance: 16                // ~16% of global electricity, smaller % of total energy
    },
    {
      name: 'Bioenergy',
      usage: 55,                  // Significant but often inefficient
      regen: 3000,                // Renewable potential depends on land & crops
      renewable: true,
      reservesPercent: 90,        // Can be sustained if managed well
      acceleration: 1.0,          // Slow to moderate growth
      yearsLeft: 5e9,        // Renewable
      yearsSinceUse: 2000,        // Human use of biomass for millennia
      reliance: 8                 // Mostly heat & transport fuels in developing regions
    },
    {
      name: 'Geothermal',
      usage: 4,                   // Small but steady contribution
      regen: 1400,                // Very high potential, limited by drilling tech
      renewable: true,
      reservesPercent: 100,       // Effectively unlimited heat source
      acceleration: 1.5,          // Gradual growth
      yearsLeft: 5e9,        // Renewable
      yearsSinceUse: 120,         // Modern plants since early 20th century
      reliance: 0.4               // Tiny global share
    },
    {
      name: 'Tidal',
      usage: 0.003,                // Experimental scale globally
      regen: 3,                    // Predictable but limited potential
      renewable: true,
      reservesPercent: 100,        // Tidal cycles are perpetual
      acceleration: 0.3,           // Very slow growth
      yearsLeft: 5e9,         // Renewable
      yearsSinceUse: 60,           // Small-scale plants since mid-20th century
      reliance: 0.01               // Negligible current reliance
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
    <div className="w-full p-6 bg-black shadow-md border-8 border-gray-700  rounded-none font-manrope overflow-auto scrollbar-custom min-w-[14.59%] ">
      <h2 className="text-3xl font-semibold mb-7 text-center mb-[9.01%]">Fuel Gauges</h2>

      <div className='pr-[] mb-[9.01%]'>
        <div className="grid gap-2 gap-y-14 grid-cols-[repeat(auto-fit,_minmax(193,_1fr))] ">
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
                  className="flex flex-col items-center text-white p-2"
                >
                  {/* Battery + Metrics Row */}
                  <div className="flex flex-row items-center gap-1 w-full relative ">

                    {/* Battery */}
                    <div
                      className="relative left-1/2 transform -translate-x-1/2 w-8 h-32 bg-gray-800 flex flex-col justify-end overflow-hidden flex-shrink-0"
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

                    {/* Metric Panel Ends */}


                  </div>

                  {/* Resource Name metric-child-2*/}
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

