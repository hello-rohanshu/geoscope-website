import React from 'react'

interface EnergySource {
  name: string
  usage: number // in EJ/year
  regen: number // in EJ/year
  acceleration: number // in EJ/year²
  reservesPercent: number // 0 to 100
  yearsLeft: number
  yearsSinceUse: number
  reliance: number // 0 to 100
  renewable: boolean
}

const energySources: EnergySource[] = [
  {
    name: 'Oil',
    usage: -190,
    regen: 0,
    acceleration: -3.2,
    reservesPercent: 40,
    yearsLeft: 78,
    yearsSinceUse: 111,
    reliance: 32,
    renewable: false
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
      color: isPositive ? 'text-green-400' : 'text-red-400',
      arrow: isPositive ? '↑' : '↓'
    }
  } else {
    return {
      color: isPositive ? 'text-red-400' : 'text-green-400',
      arrow: isPositive ? '↑' : '↓'
    }
  }
}

export default function EnergyTrajectoryCard() {
  return (
    <div className="w-3/4 p-6 bg-black shadow-md border-8 border-gray-700 rounded-none font-manrope overflow-x-auto"
      style={{
        scrollbarWidth: "thin", // Firefox
        scrollbarColor: "rgba(255, 255, 255, 0.15) transparent", // Firefox
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
              <div className="flex flex-col justify-between h-32 py-1 text-base font-medium text-white/20 leading-tight relative -top-2.5 ">
                {/* Future */}
                <div className="flex items-center whitespace-nowrap text-white/40">
                  <span className="text-7xl font-light tracking-tighter">{src.yearsLeft}</span>
                  <div className="flex flex-col justify-center items-start ml-1 leading-tight">
                    <span className=" relative top-1  text-white/20">/{src.yearsSinceUse + src.yearsLeft}</span>
                    <span className=" relative ">years</span>
                    <span className=" relative ">left</span>
                  </div>
                </div>

                {/* Present */}
                <div className="leading-tight text-sm">
                  {/* Acceleration */}
                  {(() => {
                    const accelPercent = getAccelerationPercent(src.acceleration, src.usage)
                    const { color, arrow } = getAccelColorAndArrow(src.acceleration, src.renewable)

                    return accelPercent !== null ? (
                      <div className={`flex items-center ${color}`}>
                        <span className="mr-1">{arrow}</span>
                        <span>{accelPercent}%/yr</span>
                      </div>
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
        ))}
      </div>
      </div>
    </div>
  )
}
