'use client';

import React from 'react';
import { motion } from 'framer-motion';

const objectives = [
  {
    id: 'energy-grid',
    title: 'World Energy Grid',
    detail: 'Interlink global grids via the Bering Strait — delivering energy to anyone, anywhere.',
    percent: 22,
    pulse: true,
  },
  {
    id: 'cosmic-costing',
    title: 'Kilowatt-Hour Accounting',
    detail: 'Replace money with a universal time-energy metric — "cosmic costing".',
    percent: 3,
    pulse: false,
  },
  {
    id: 'sovereignty',
    title: 'Dissolve Sovereign Nations',
    detail: 'Remove the 150+ "blood clots" blocking the planetary system.',
    percent: 8,
    pulse: false,
  },
  {
    id: 'livingry',
    title: 'Weaponry → Livingry',
    detail: 'Shift industry from weaponry to life-support — ephemeralization in action.',
    percent: 16,
    pulse: true,
  },
  {
    id: 'fellowships',
    title: 'Handsome Life Fellowships',
    detail: 'Free every human from “earning a living” — become Universe problem-solvers.',
    percent: 0.2,
    pulse: false,
  },
  {
    id: 'habitat',
    title: 'Human Habitat Transformed',
    detail: 'Geodesic homes, floating tetrahedronal cities, Expanded Cinema Universities.',
    percent: 11,
    pulse: true,
  },
];

const totalPercent = Math.round(
  objectives.reduce((sum, g) => sum + g.percent, 0) / objectives.length
);

export default function WorldGameProgress() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-16 xl:px-24 text-zinc-50 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Title Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-white">
              Design Science Revolution
            </h2>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="self-start sm:self-auto px-3 py-1 text-[10px] uppercase tracking-wider font-medium text-amber-400/80 border border-amber-500/20 bg-amber-500/5 rounded-full backdrop-blur-sm"
          >
            Representative Data Only
          </motion.span>
        </motion.div>

        {/* Global Progress Bar */}
        <div className="mb-20 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              The Critical Path
            </p>
            <span className="text-xl font-light font-mono text-amber-400 tabular-nums">
              {totalPercent}% <span className="text-zinc-500 text-xs font-sans ml-1">illustrative</span>
            </span>
          </div>
          
          <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 rounded-full"
              initial={{ width: '0%' }}
              whileInView={{ width: `${totalPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-medium text-zinc-500">
            <span>Phase: Now</span>
            <span>Destination: Utopia</span>
          </div>
        </div>

        {/* Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {objectives.map((obj) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex gap-4 group"
            >
              {/* Status Indicator Status */}
              <div className="relative mt-1.5 flex-shrink-0">
                {obj.pulse && (
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400/40 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-300 ${
                    obj.pulse ? 'bg-amber-400' : 'bg-zinc-700 group-hover:bg-zinc-500'
                  }`}
                />
              </div>

              {/* Text & Local Metrics */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="text-base font-serif font-medium text-zinc-200 group-hover:text-white transition-colors duration-200 truncate">
                    {obj.title}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400 tabular-nums ml-2">
                    {obj.percent}%
                  </span>
                </div>
                
                <p className="text-sm text-zinc-400 font-light leading-relaxed mb-4">
                  {obj.detail}
                </p>
                
                {/* Visual Track */}
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500/80 to-amber-300/40 rounded-full"
                    initial={{ width: '0%' }}
                    whileInView={{ width: `${obj.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}