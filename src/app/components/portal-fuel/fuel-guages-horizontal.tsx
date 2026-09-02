'use client';

import React from 'react';
import {
  fossilReserves,
  annualFlows,
  renewablePotential,
  fossilYearsLeft
} from './fuel-data';

export default function TwoGaugesHorizontal() {
  // --- Stocks ---
  const fossilTotal = fossilReserves.totalEJ;
  const fossilLeft = fossilReserves.remainingEJ;

  // --- Rates (EJ/year) ---
  const fossilUse = annualFlows.fossilUseEJ;
  const renewableUse = annualFlows.renewableUseEJ;
  const renewableIncome = renewablePotential.totalEJ;


  const fossilNetRate = 0 - fossilUse;
  const renewableNetRate = renewableIncome - renewableUse;

  const fossilPercentage = (fossilLeft / fossilTotal) * 100;

  // --- Speed scaling ---
  const minSpeed = 0.21;
  const maxSpeed = 2.1;

  const getSpeed = (rate: number) => {
    const magnitude = Math.abs(rate);
    const normalized = Math.min(1, magnitude / 200_000);
    return maxSpeed - (maxSpeed - minSpeed) * normalized;
  };

  const fossilSpeed = getSpeed(fossilNetRate);
  const renewableSpeed = getSpeed(renewableNetRate);

  return (
    <div className="flex flex-col space-y-3 w-[71%]">

      {/* Fossil Fuel */}
      <div className="flex flex-col space-y-1">
        <div className="text-sm text-orange-500">Fossil Savings</div>

        <div className="relative flex w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${fossilPercentage}%`,
              backgroundColor: 'rgba(249,115,22,0.4)'
            }}
          />
          <div
            className="absolute top-0 left-0 h-full rounded-full mix-blend-screen"
            style={{
              width: `${fossilPercentage}%`,
              background:
                'linear-gradient(270deg, rgba(249,115,22,0) 0%, rgba(249,115,22,0.9) 50%, rgba(249,115,22,0) 100%)',
              backgroundSize: '200% 100%',
              animation: `moveFossil ${fossilSpeed}s linear infinite`
            }}
          />
        </div>

        <div className="text-xs font-bold text-gray-500">
          {Math.round(fossilYearsLeft)} years left
        </div>
      </div>

      {/* Renewable */}
      <div className="flex flex-col space-y-1">
        <div className="text-sm text-green-600">Energy Income</div>

        <div className="relative flex w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `100%`,
              backgroundColor: 'rgba(34,197,94,0.4)'
            }}
          />
          <div
            className="absolute top-0 left-0 h-full rounded-full mix-blend-screen"
            style={{
              width: `100%`,
              background:
                'linear-gradient(90deg, rgba(34,197,94,0) 0%, rgba(34,197,94,0.9) 50%, rgba(34,197,94,0) 100%)',
              backgroundSize: '200% 100%',
              animation: `moveRenew ${renewableSpeed}s linear infinite`
            }}
          />
        </div>

        <div className="text-xs font-bold text-gray-500">
          Using {((renewableUse / renewableIncome) * 100).toFixed(4)}%
        </div>
      </div>

      <style jsx>{`
        @keyframes moveFossil {
          from { background-position: 0% 0; }
          to { background-position: 200% 0; }
        }
        @keyframes moveRenew {
          from { background-position: 200% 0; }
          to { background-position: 0% 0; }
        }
      `}</style>
    </div>
  );
}
