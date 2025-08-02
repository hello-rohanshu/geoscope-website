import React from 'react'

interface Need {
  icon: string
  label: string
  fulfilled: number // from 0 to 100
  description?: string
}

const needs: Need[] = [
  {
    icon: '💧',
    label: 'Water',
    fulfilled: 50,
    description: 'have access to clean water',
  },
  {
    icon: '🍃',
    label: 'Air',
    fulfilled: 1,
    description: 'breathe healthy air',
  },
  {
    icon: '🏠',
    label: 'Shelter',
    fulfilled: 72, // midpoint between 64% and 98%
    description: 'live in decent housing',
  },
  {
    icon: '🍊',
    label: 'Nutrition',
    fulfilled: 82.5,
    description: 'are not undernourished',
  },
  {
    icon: '⚡',
    label: 'Electricity',
    fulfilled: 90,
    description: 'have access to electricity',
  },
]

function getHue(fulfilled: number): string {
  const hue = (fulfilled / 100) * 120 // 0 = red, 120 = green
  return `hsl(${hue}, 60%, 45%)` // reduced saturation and slightly darker
}

export default function HumanPhysicalNeedsCard() {
  return (
    <div className="w-3/4 p-6 bg-black shadow-md border-8 border-gray-700 rounded-none">
      <h2 className="text-xl font-semibold mb-4 text-white">Human Physical Needs</h2>
      <div className="space-y-4">
        {needs.map((need, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="text-2xl">{need.icon}</span>
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-white">{need.label}</span>
                <span className="text-sm text-white">{need.fulfilled.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-700">
                <div
                  className="h-full"
                  style={{
                    width: `${need.fulfilled}%`,
                    backgroundColor: getHue(need.fulfilled),
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
