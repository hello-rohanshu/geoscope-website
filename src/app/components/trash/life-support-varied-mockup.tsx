import React from 'react'

interface ResourceTrajectory {
  icon: string
  label: string
  past: number  // e.g., average over 10 years ago
  present: number // current fulfillment %
  future: number  // projected 10 years ahead
}

const needsTrajectory: ResourceTrajectory[] = [
  {
    icon: '💧',
    label: 'Water',
    past: 45,
    present: 50,
    future: 60,
  },
  {
    icon: '🍃',
    label: 'Air',
    past: 2,
    present: 1,
    future: 0.5,
  },
  {
    icon: '🏠',
    label: 'Shelter',
    past: 70,
    present: 80,
    future: 85,
  },
  {
    icon: '🍊',
    label: 'Nutrition',
    past: 87,
    present: 89.2,
    future: 91,
  },
  {
    icon: '⚡',
    label: 'Electricity',
    past: 80,
    present: 90,
    future: 96,
  },
]

function getColor(percent: number): string {
  const hue = (percent / 100) * 120
  return `hsl(${hue}, 60%, 45%)`
}

export default function HumanNeedsTrajectoryCard() {
  return (
    <div className="w-3/4 p-6 bg-black shadow-md border-8 border-gray-700 rounded-none">
      <h2 className="text-xl font-semibold mb-4 text-white">Trajectory of Physical Needs</h2>
      <div className="space-y-6">
        {needsTrajectory.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="text-2xl">{item.icon}</span>
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Past</span>
                <span>Now</span>
                <span>Future</span>
              </div>
              <div className="flex gap-1 w-full">
                {[item.past, item.present, item.future].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 h-4"
                    style={{
                      backgroundColor: getColor(value),
                    }}
                    title={`${value.toFixed(1)}%`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
