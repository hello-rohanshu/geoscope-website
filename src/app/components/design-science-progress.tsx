'use client';

import React from 'react';

interface Milestone {
  id: string;
  label: string;
  sublabel?: string;
  completed: boolean;
  active?: boolean;
}

interface TimelineItem {
  date: string;
  title: string;
  desc: string;
  done?: boolean;
}

const milestones: Milestone[] = [
  { id: 'internet', label: 'World Information Grid', sublabel: 'Internet', completed: true },
  { id: 'grid', label: 'World Electric Grid', sublabel: 'Supergrid', completed: false, active: true },
  { id: 'unknown', label: 'To Be Discovered', sublabel: 'n/a', completed: false },
];

const internetTimeline: TimelineItem[] = [
  { date: '1940s–1950s', title: 'Computer', desc: 'A thinking machine that started out mostly alone.', done: true },
  { date: 'Early 1960s', title: 'Packet switching', desc: 'Breaking messages into small pieces to send them more easily.', done: true },
  { date: '1969', title: 'ARPANET', desc: 'The first playground where computers talked to each other.', done: true },
  { date: '1970s–1983', title: 'TCP/IP', desc: 'Common rules that let different networks understand each other.', done: true },
  { date: '1983', title: 'Internet', desc: 'Networks connected together into one big worldwide system.', done: true },
  { date: '1989–1991', title: 'World Wide Web', desc: 'Clickable pages that made the internet easy to use.', done: true },
];

const supergridTimeline: TimelineItem[] = [
  { date: '1882', title: 'DC transmission demo', desc: 'First long-distance electric power sent 57 km from Miesbach to Munich — proof electricity could travel.', done: true },
  { date: '1938', title: "Fuller's vision", desc: 'Buckminster Fuller proposed a global electric grid to share energy across day/night sides of the planet.', done: true },
  { date: '1954', title: 'HVDC (Gotland link)', desc: 'First commercial high-voltage DC line, Sweden to Gotland — the key technology for intercontinental grids.', done: true },
  { date: '1970s', title: 'Thyristor valves', desc: 'Solid-state thyristors replaced mercury-arc converters, making HVDC scalable and cheap enough to spread.', done: true },
  { date: '2010s', title: 'China UHVDC buildout', desc: 'Thousands of km of ultra-high-voltage DC lines built inside China — the largest supergrid footprint yet.', done: true },
  { date: '', title: 'Bering Strait link', desc: 'A 90 km undersea HVDC cable connects the North American and Asian grids for the first time.', done: false },
  { date: '', title: 'Sahara–Europe corridor', desc: 'Solar power from the Sahara reaches European cities via HVDC lines through the Strait of Gibraltar.', done: false },
  { date: '', title: 'World Electric Grid', desc: 'All major regional grids interconnected. Energy begins flowing across time zones, smoothing out the day/night imbalance Fuller described in 1938.', done: false },
];

function HexNut({ completed }: { completed: boolean }) {
  return (
    <svg
      className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 select-none z-10 relative drop-shadow-sm"
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
    <div className="w-full h-full min-h-0 flex flex-col justify-between py-2 sm:py-4 px-4 sm:px-6 pointer-events-auto bg-transparent">
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

        /* Visible Scrollbar Styles */
        .visible-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #334155 #0f172a;
        }
        .visible-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
          display: block;
        }
        .visible-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .visible-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 0px;
        }
        .visible-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>

      {/* Header (shrink-0 so it never collapses) */}
      <div className="w-full text-left shrink-0 mb-3">
        <h1 className="title-section text-xl sm:text-2xl font-bold tracking-tight">Design Science Revolution</h1>
      </div>

      {/* Stepper Pipeline (shrink-0 so it stays fixed) */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0 shrink-0 my-auto">
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
              <div className="flex sm:w-full items-center justify-center relative sm:mb-4 md:mb-6 shrink-0">
                {idx < milestones.length - 1 && (
                  <>
                    <div
                      className={`hidden sm:block absolute left-1/2 w-full h-2.5 md:h-3.5 top-1/2 -translate-y-1/2 z-0 overflow-hidden ${
                        isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      {isNextActive && <div className="animate-continuous-pulse" />}
                    </div>

                    <div
                      className={`sm:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-3.5 h-[calc(100%+2rem)] z-0 overflow-hidden ${
                        isNextActive ? 'bg-emerald-500' : 'bg-slate-800'
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
                  className={`title-card text-sm sm:text-base md:text-lg font-semibold transition-colors duration-300 pl-4 sm:pl-0 sm:px-2 md:px-3 text-left sm:text-center leading-snug ${
                    m.completed || m.active ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {m.label}
                </h2>
                {m.sublabel && (
                  <span className="block pl-4 sm:pl-0 sm:px-2 md:px-3 text-left sm:text-center text-xs sm:text-sm font-normal opacity-60">
                    {m.sublabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Container (Takes remaining space and forces cards to shrink) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 flex-1 min-h-0 md:grid-rows-[minmax(0,1fr)]">
        {/* Column 1: Internet */}
        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-none flex flex-col justify-start h-full min-h-0 overflow-y-auto visible-scrollbar">
          <ul className="space-y-3 sm:space-y-4">
            {internetTimeline.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-left">
                {item.done !== false ? (
                  <div className="mt-0.5 shrink-0 w-3.5 h-3.5 bg-emerald-500 rounded-none flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="mt-0.5 shrink-0 w-3.5 h-3.5 border border-slate-600 rounded-none bg-transparent" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                    <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Supergrid */}
        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-none flex flex-col justify-start h-full min-h-0 overflow-y-auto visible-scrollbar">
          <ul className="space-y-3 sm:space-y-4">
            {supergridTimeline.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-left">
                {item.done !== false ? (
                  <div className="mt-0.5 shrink-0 w-3.5 h-3.5 bg-emerald-500 rounded-none flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="mt-0.5 shrink-0 w-3.5 h-3.5 border border-slate-600 rounded-none bg-transparent" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                    <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: TBD */}
        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-none flex items-center justify-center h-full min-h-0 overflow-y-auto visible-scrollbar">
          <span className="text-slate-500 font-mono text-sm tracking-widest font-semibold">TBD</span>
        </div>
      </div>
    </div>
  );
}