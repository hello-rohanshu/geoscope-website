'use client';

import React from 'react';

interface Milestone {
  id: string;
  label: string;
  completed: boolean;
  active?: boolean;
}

const milestones: Milestone[] = [
  { id: 'internet', label: 'World Information Grid', completed: true },
  { id: 'grid', label: 'World Electric Grid', completed: false, active: true },
  { id: 'unknown', label: 'To Be Discovered', completed: false },
];

function HexNut({ completed }: { completed: boolean }) {
  return (
    <svg 
      className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 select-none z-10 relative" 
      viewBox="0 0 64 64"
    >
      {/* Outer Hexagon */}
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="#334155" />

      {/* Inner Circle */}
      <circle
        cx="32"
        cy="32"
        r="17"
        fill={completed ? '#10b981' : '#020617'}
      />

      {/* Checkmark */}
      {completed && (
        <path
          d="M25 32L30 37L38 28"
          fill="none"
          stroke="#022c22"
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      )}
    </svg>
  );
}

export default function DesignScienceProgress() {
  return (
    <div className="w-full min-h-[360px] sm:min-h-[480px] md:min-h-[560px] flex flex-col justify-between py-6 sm:py-12 md:py-20 px-4 sm:px-6 pointer-events-auto bg-transparent overflow-hidden">
      {/* Continuous Pulse Animations */}
      <style>{`
        @keyframes singlePassPulseHorizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes singlePassPulseVertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-continuous-pulse {
          position: absolute;
          inset: 0;
          width: 100%;
          background: linear-gradient(90deg, transparent 40%, #144f41 40%, #144f41 60%, transparent 60%);
          animation: singlePassPulseHorizontal 1.6s infinite linear;
        }
        @media (max-width: 639px) {
          .animate-continuous-pulse {
            background: linear-gradient(180deg, transparent 40%, #144f41 40%, #144f41 60%, transparent 60%);
            animation: singlePassPulseVertical 1.6s infinite linear;
          }
        }
      `}</style>

      {/* Header */}
      <div className="w-full text-left mb-6 sm:mb-0">
        <h1 className="title-section">Design Science Revolution</h1>
      </div>

      {/* Pipeline & Stepper: Switches to Vertical on mobile (< sm) & Horizontal on tablets+ (>= sm) */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:gap-0 my-auto">
        {milestones.map((m, idx) => {
          const isNextActive =
            idx < milestones.length - 1 &&
            m.completed &&
            (milestones[idx + 1].completed || milestones[idx + 1].active);

          return (
            <div 
              key={m.id} 
              className="flex-1 flex flex-row sm:flex-col items-center sm:text-center group min-w-0 relative"
            >
              {/* Pipe & Nut Connector Row */}
              <div className="flex sm:w-full items-center justify-center relative sm:mb-6 md:mb-8 shrink-0">
                {/* Connecting Pipe */}
                {idx < milestones.length - 1 && (
                  <>
                    {/* Horizontal Pipe (sm screens and above) */}
                    <div
                      className={`hidden sm:block absolute left-1/2 w-full h-2 sm:h-2.5 md:h-3.5 top-1/2 -translate-y-1/2 z-0 overflow-hidden ${
                        isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      {isNextActive && <div className="animate-continuous-pulse" />}
                    </div>

                    {/* Vertical Pipe (mobile screens) */}
                    <div
                      className={`sm:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-[calc(100%+2.5rem)] z-0 overflow-hidden ${
                        isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      {isNextActive && <div className="animate-continuous-pulse" />}
                    </div>
                  </>
                )}

                {/* Hex Nut Node */}
                <HexNut completed={m.completed} />
              </div>

              {/* Label */}
              <h2 
                className={`title-card transition-colors duration-300 pl-4 sm:pl-0 sm:px-2 md:px-3 text-left sm:text-center ${
                  m.completed || m.active ? 'text-white' : 'text-slate-600'
                }`}
              >
                {m.label}
              </h2>
            </div>
          );
        })}
      </div>
    </div>
  );
}