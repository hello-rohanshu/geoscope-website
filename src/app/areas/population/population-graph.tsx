'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { populationData } from './population-data'

export default function PopulationGraph() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={populationData}
          margin={{ top: 0, right: 0, left: -20, bottom: -13 }} // no internal offset
        >
          <XAxis
            dataKey="year"
            stroke="#aaa"
            tick={{ fill: '#aaa', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            padding={{ right: 30 }}
          />
          <YAxis
            stroke="#aaa"
            tick={{ fill: '#aaa', fontSize: 12 }}
            tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: 12,
            }}
            formatter={(value: number) =>
              `${(value / 1_000_000_000).toFixed(2)} billion`
            }
            labelStyle={{ color: '#00d8ff' }}
          />
          <Line
            type="monotone"
            dataKey="population"
            stroke="#00d8ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#00d8ff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
