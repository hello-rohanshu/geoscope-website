'use client';

import React from 'react';

interface Milestone {
  id: string;
  label: string;
  sublabel?: string;
  completed: boolean;
  active?: boolean;
}

const milestones: Milestone[] = [
  { id: 'internet', label: 'World Information Grid', sublabel: 'Internet', completed: true },
  { id: 'grid', label: 'World Electric Grid', sublabel: 'Supergrid', completed: false, active: true },
  { id: 'unknown', label: 'To Be Discovered', sublabel: 'n/a', completed: false },
];

function HexNut({ completed }: { completed: boolean }) {
  return (
    <svg
      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 select-none z-10 relative drop-shadow-sm"
      viewBox="0 0 64 64"
    >
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="#334155" />
      <circle
        cx="32"
        cy="32"
        r="17"
        fill={completed ? '#10b981' : '#020617'}
      />
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
    <div className="w-full min-h-[480px] sm:min-h-[500px] md:min-h-[560px] flex flex-col justify-between py-8 sm:py-12 md:py-20 px-5 sm:px-6 pointer-events-auto bg-transparent overflow-hidden">
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

      <div className="w-full text-left mb-8 sm:mb-0">
        <h1 className="title-section text-xl sm:text-2xl font-bold tracking-tight">Design Science Revolution</h1>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-12 sm:gap-0 my-auto">
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
              <div className="flex sm:w-full items-center justify-center relative sm:mb-6 md:mb-8 shrink-0">
                {idx < milestones.length - 1 && (
                  <>
                    <div
                      className={`hidden sm:block absolute left-1/2 w-full h-2.5 md:h-3.5 top-1/2 -translate-y-1/2 z-0 overflow-hidden ${isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                    >
                      {isNextActive && <div className="animate-continuous-pulse" />}
                    </div>

                    <div
                      className={`sm:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-3.5 h-[calc(100%+4.5rem)] z-0 overflow-hidden ${isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                    >
                      {isNextActive && <div className="animate-continuous-pulse" />}
                    </div>
                  </>
                )}

                <HexNut completed={m.completed} />
              </div>

              <div className="flex-1 sm:flex-none min-w-0">
                <h2
                  className={`title-card text-base sm:text-lg font-semibold transition-colors duration-300 pl-5 sm:pl-0 sm:px-2 md:px-3 text-left sm:text-center leading-snug ${m.completed || m.active ? 'text-white' : 'text-slate-500'
                    }`}
                >
                  {m.label}
                </h2>
                {m.sublabel && (
                  <span className="block pl-5 sm:pl-0 sm:px-2 md:px-3 text-left sm:text-center text-xs sm:text-sm md:text-base font-normal opacity-60">
                    {m.sublabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}