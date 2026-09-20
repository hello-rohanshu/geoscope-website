'use client';

import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { fuelPieData, fuelPieTotal } from './fuel-data';

export default function FuelReliancePie() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <PieChart width={120} height={80}>
        <Pie
          data={fuelPieData}
          cx="50%"
          cy="50%"
          outerRadius={40}
          innerRadius={0}
          dataKey="value"
          labelLine={false}
          stroke="black"
          cornerRadius={0}
          paddingAngle={3}
          label={({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, payload }) => {
            const RADIAN = Math.PI / 180;
            const radius = outerRadius * 1.3;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            const percent = Math.round((payload.value / fuelPieTotal) * 100);

            return (
              <text
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="11px"
                fontWeight="500"
                fill="rgba(255,255,255,0.6)"
              >
                {percent}%
              </text>
            );
          }}
        >
          {fuelPieData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      <div className="text-sm text-white/50 font-rajdhani">Reliance</div>
    </div>
  );
}
