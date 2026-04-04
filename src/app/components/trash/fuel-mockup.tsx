// components/EnergyCardCompact.tsx
'use client';

import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface EnergyData {
    totalEnergy: number;        // EJ
    fossilUsed: number;         // EJ
    fossilRemaining: number;    // EJ
    renewableIncome: number;    // EJ per year
    usageRate: number;          // EJ per year
}

const mockData: EnergyData = {
    totalEnergy: 1000,
    fossilUsed: 100,
    fossilRemaining: 100,
    renewableIncome: 800,
    usageRate: 120,
};

const EnergyCardCompact: React.FC = () => {
    const { totalEnergy, fossilUsed, fossilRemaining, renewableIncome, usageRate } = mockData;
    const fossilPercent = (fossilRemaining / (fossilRemaining + fossilUsed)) * 100;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',      // instead of fixed 21rem
                maxHeight: '100%',
                padding: '0.5rem',
                background: '#1f1f1f',
                borderRadius: '1rem',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* Total Energy */}
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Total Energy</h4>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{totalEnergy} EJ</p>
            </div>

            {/* Fossil Fuel Arc */}
            <div style={{ width: '8rem', height: '8rem' }}>
                <CircularProgressbar
                    value={fossilPercent}
                    text={`${fossilRemaining} EJ`}
                    maxValue={100}
                    styles={buildStyles({
                        pathColor: '#FF7F50',
                        textColor: 'white',
                        trailColor: '#555',
                        textSize: '0.7rem',
                    })}
                />
                <p style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.65rem' }}>Fossil Remaining</p>
            </div>

            {/* Renewable Income Bar */}
            <div style={{ width: '90%' }}>
                <h5 style={{ margin: '0.25rem 0', fontSize: '0.75rem' }}>Renewable Income</h5>
                <div style={{ background: '#333', borderRadius: '0.25rem', height: '0.8rem', overflow: 'hidden' }}>
                    <div
                        style={{
                            width: `${(renewableIncome / totalEnergy) * 100}%`,
                            height: '100%',
                            background: '#00FF7F',
                            transition: 'width 1s ease-in-out',
                        }}
                    />
                </div>
                <p style={{ fontSize: '0.65rem', textAlign: 'right', margin: '0.2rem 0 0 0' }}>
                    {renewableIncome} EJ/year
                </p>
            </div>

            {/* Usage Rate Sparkline */}
            <div style={{ width: '90%' }}>
                <h5 style={{ margin: '0.25rem 0', fontSize: '0.75rem' }}>Usage Rate Trend</h5>
                <Sparklines data={[usageRate * 0.9, usageRate, usageRate * 1.1, usageRate]} limit={10} width={160} height={30}>
                    <SparklinesLine color="#FFA500" style={{ strokeWidth: 2, fill: 'none' }} />
                </Sparklines>
                <p style={{ fontSize: '0.65rem', textAlign: 'center', margin: '0.2rem 0 0 0' }}>{usageRate} EJ/year</p>
            </div>
        </div>
    );
};

export default EnergyCardCompact;
