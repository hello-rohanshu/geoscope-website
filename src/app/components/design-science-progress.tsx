'use client';

import React from 'react';
import { motion } from 'framer-motion';

const checkpoints = [
  { id: 'cp1', label: 'pilot education', completed: true },
  { id: 'cp2', label: 'world energy grid', completed: false },
  { id: 'cp3', label: 'level flight', completed: false },
];

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

const completedCount = checkpoints.filter((c) => c.completed).length;
const checkpointPercent = Math.round((completedCount / checkpoints.length) * 100);

const totalPercent = Math.round(
  objectives.reduce((sum, g) => sum + g.percent, 0) / objectives.length
);

export default function DesignScienceProgress() {
  return (
    <section className="min-h-screen bg-zinc-950 py-20 px-6 lg:px-16 xl:px-24 text-zinc-50 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-8"
        >
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400/90 block mb-2">
              Global Initiative
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-white">
              Design Science Revolution
            </h1>
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="self-start sm:self-auto px-4 py-2 text-xs uppercase tracking-wider font-semibold text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-full backdrop-blur-sm shadow-lg shadow-amber-500/5"
          >
            ⚠ Representative Data Only
          </motion.span>
        </motion.div>

        {/* Checkpoints & Progress Dashboard */}
        <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md space-y-8">
          
          {/* Top Line Info */}
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              The Critical Path
            </p>
            <div className="text-right">
              <span className="text-2xl font-light font-mono text-amber-400 tabular-nums">
                {totalPercent}%
              </span>
              <span className="text-zinc-400 text-xs font-sans ml-2 font-medium">
                (illustrative avg)
              </span>
            </div>
          </div>

          {/* Global Gradient Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-2.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-200 rounded-full"
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

          {/* Checkpoints Timeline */}
          <div className="pt-6 border-t border-zinc-800/50">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-6">
              <span className="uppercase tracking-wider font-mono">Macro Checkpoints</span>
              <span className="font-mono text-emerald-400">{checkpointPercent}% complete</span>
            </div>

            <div className="grid grid-cols-3 gap-4 relative">
              {checkpoints.map((cp) => (
                <div key={cp.id} className="flex flex-col items-center text-center group">
                  <div
                    className={`relative flex items-center justify-center w-6 h-6 rounded-full border transition-colors duration-300 ${
                      cp.completed
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                    }`}
                  >
                    {cp.completed && (
                      <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                    )}
                    <span
                      className={`relative w-2 h-2 rounded-full ${
                        cp.completed ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}
                    />
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-wider font-medium text-zinc-300 group-hover:text-white transition-colors">
                    {cp.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {objectives.map((obj) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex gap-4 group p-5 rounded-xl hover:bg-zinc-900/30 transition-colors border border-transparent hover:border-zinc-800/40"
            >
              {/* Centered Status Pulse Indicator */}
              <div className="relative flex items-center justify-center h-3 w-3 mt-1.5 flex-shrink-0">
                {obj.pulse && (
                  <span className="absolute inset-0 rounded-full bg-amber-400/50 animate-ping" />
                )}
                <span
                  className={`relative h-2 w-2 rounded-full transition-colors duration-300 ${
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
                
                {/* Visual Metric Track */}
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