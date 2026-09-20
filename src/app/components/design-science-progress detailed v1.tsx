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
  { id: 'consecration', label: 'World Consecration Grid', completed: false },
];

const internetTimeline = [
  { date: '1940s–1950s', title: 'Computer', desc: 'A thinking machine that started out mostly alone.' },
  { date: 'Early 1960s', title: 'Packet switching', desc: 'Breaking messages into small pieces to send them more easily.' },
  { date: '1969', title: 'ARPANET', desc: 'The first playground where computers talked to each other.' },
  { date: '1970s–1983', title: 'TCP/IP', desc: 'Common rules that let different networks understand each other.' },
  { date: '1983', title: 'Internet', desc: 'Networks connected together into one big worldwide system.' },
  { date: '1989–1991', title: 'World Wide Web', desc: 'Clickable pages that made the internet easy to use.' },
];

function HexNut({ completed }: { completed: boolean }) {
  return (
    <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 select-none z-10 relative" viewBox="0 0 64 64">
      {/* Outer Hexagon */}
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="#334155" />

      {/* Inner Circle */}
      <circle
        cx="32"
        cy="32"
        r="20"
        fill={completed ? '#10b981' : '#020617'}
      />

      {/* Checkmark */}
      {completed && (
        <path
          d="M21 32L28 39L43 23"
          fill="none"
          stroke="#022c22"
          strokeWidth="4.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      )}
    </svg>
  );
}

export default function DesignScienceProgress() {
  return (
    <div className="w-full min-h-[480px] flex flex-col justify-start gap-8 py-8 pointer-events-auto bg-transparent">
      {/* Single Continuous Pulse Animation */}
      <style>{`
        @keyframes singlePassPulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-continuous-pulse {
          position: absolute;
          inset: 0;
          width: 100%;
          background: linear-gradient(90deg, transparent, #022c22 50%, transparent);
          animation: singlePassPulse 1.4s infinite linear;
        }
      `}</style>

      {/* Header */}
      <div className="w-full text-left">
        <h1 className="title-section">Design Science Revolution</h1>
      </div>

      {/* Pipeline & Stepper */}
      <div className="w-full flex items-center justify-between">
        {milestones.map((m, idx) => {
          const isNextActive =
            idx < milestones.length - 1 &&
            m.completed &&
            (milestones[idx + 1].completed || milestones[idx + 1].active);

          return (
            <div key={m.id} className="flex-1 flex flex-col items-center text-center group min-w-0">
              {/* Pipe & Nut Connector Row */}
              <div className="w-full flex items-center justify-center relative mb-4">
                {/* Single Pipe spanning from nut center to next nut center */}
                {idx < milestones.length - 1 && (
                  <div
                    className={`absolute left-1/2 w-full h-3 top-1/2 -translate-y-1/2 z-0 overflow-hidden ${
                      isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    {isNextActive && <div className="animate-continuous-pulse" />}
                  </div>
                )}

                {/* Hex Nut Node */}
                <HexNut completed={m.completed} />
              </div>

              {/* Label */}
              <h2 className={`title-card transition-colors duration-300 px-2 ${m.completed || m.active ? 'text-white' : 'text-slate-600'}`}>
                {m.label}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Sharp, Minimal Timeline Checklist */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-900/80 p-5 rounded-none">
          <ul className="space-y-4">
            {internetTimeline.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-left">
                {/* Sharp Check Indicator */}
                <div className="mt-0.5 shrink-0 w-3.5 h-3.5 bg-emerald-500 rounded-none flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                    <span className="text-xs font-semibold text-slate-200">– {item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}