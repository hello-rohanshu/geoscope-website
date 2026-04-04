import React from 'react'

// Fake sparkline data generator (replace with real historical acceleration data later)
function generateSparklineData(): number[] {
  return Array.from({ length: 12 }, () => Math.round(Math.random() * 100))
}

interface EnergySource {
  name: string
  usage: number // in EJ/year
  regenerationRate: number // in EJ/year
  renewable: boolean
  reservesPercent: number // 0 to 100
  acceleration: number // in EJ/year²
  yearsLeft: number
  yearsSinceUse: number
  reliance: number // 0 to 100
  trend?: number[] // recent acceleration trend
}

const energySources: EnergySource[] = [
  {
    name: 'Oil',
    usage: -190,
    regenerationRate: 0,
    acceleration: -3.2,
    reservesPercent: 40,
    yearsLeft: 150,
    yearsSinceUse: 111,
    reliance: 32,
    renewable: false,
    trend: generateSparklineData()
  },
  // Add more sources similarly
]

function getBatteryColor(percent: number, renewable: boolean): string {
  if (percent > 80) return renewable ? '#22c55e' : '#60a5fa'
  if (percent > 40) return renewable ? '#84cc16' : '#f97316'
  return renewable ? '#facc15' : '#ef4444'
}

function getAccelerationPercent(acceleration: number, usage: number): number | null {
  if (usage === 0) return null
  return Math.round(Math.abs((acceleration / usage) * 100))
}

function getAccelColorAndArrow(acceleration: number, renewable: boolean): { color: string, arrow: string } {
  const isPositive = acceleration > 0
  if (renewable) {
    return {
      color: isPositive ? 'text-green-900' : 'text-red-900',
      arrow: isPositive ? '↑' : '↓'
    }
  } else {
    return {
      color: isPositive ? 'text-red-900' : 'text-green-900',
      arrow: isPositive ? '↑' : '↓'
    }
  }
}


export default function EnergyTrajectoryCard() {
  return (
    <div className="w-3/4 p-6 bg-black shadow-md border-8 border-gray-700 rounded-none font-rajdhani overflow-x-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255, 255, 255, 0.15) transparent",
      }}
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Oil</h2>

      <div className="flex gap-4">
        <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto" >
          {energySources.map((src, index) => (
            <div key={index} className="flex flex-col items-start text-white ">
              <div className="flex items-stretch">
                <div
                  className="relative w-8 h-32 bg-gray-800 flex flex-col justify-end overflow-hidden mr-2 shrink-0"
                  style={{
                    border: '4px solid',
                    borderColor: src.renewable ? '#89ff8fff' : '#7faef9ff'
                  }}
                >
                  <div
                    className="w-full"
                    style={{
                      height: `${src.reservesPercent}%`,
                      backgroundColor: getBatteryColor(src.reservesPercent, src.renewable)
                    }}
                  ></div>

                  {src.renewable && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                      ∞
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="flex flex-col justify-between h-32 py-1 text-base font-medium text-white/17 leading-tight relative -top-2.5 ">
                  {/* Future */}
                  <div className="flex items-center whitespace-nowrap text-white/40">
                    <span className="text-8xl font-light tracking-tighter">{src.yearsLeft}</span>
                    <div className="flex flex-col text-lg justify-center items-start ml-1 leading-tight">
                      <span className="relative top-1 text-white/17 font-normal">/{src.yearsSinceUse + src.yearsLeft}</span>
                      <span className="relative">years</span>
                      <span className="relative">left</span>
                    </div>
                  </div>

                  <div className="-mt-2">
                    {/* Present */}
                    <div className="leading-tight flex items-center">
                      {(() => {
                        const accelPercent = getAccelerationPercent(src.acceleration, src.usage)
                        const { color, arrow } = getAccelColorAndArrow(src.acceleration, src.renewable)

                        return accelPercent !== null ? (
                          <>
                            <div className="flex items-center">

                              <span className={color + " mr-1 font-black relative -top-0.25"}>{arrow}</span>
                              <span className={color}>{accelPercent}%/yr </span>
                              <span>&nbsp;deceleration</span>
                            </div>

                          </>
                        ) : (
                          <div className="text-white/30">N/A</div>
                        )
                      })()}
                    </div>

                    {/* Systemic */}
                    <div className="">{src.reliance}% reliance</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
