// app/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import WorldGameProgress from './components/world-game-progress';
import FuelSystemPortal from './areas/earth-systems/portal';
import LifeSupportPortal from './areas/standard-of-life/portal';
import CrewHarmonyPortal from './areas/culture/portal';
import NavigationPortal from './areas/science/portal';
import PopulationPortal from './areas/population/population-portal';
import PortalCard from './components/portal-design';
import EarthSim from './components/earth-sim';
// import { EarthSim } from './components/earth-sim-cesium';
import IcosahedronGlobe from './components/icosahedron-globe';
import TimelineDesign from './components/timeline/timeline-design';
import DesignScienceProgress from './components/design-science-progress';
import DymaxionBase from './components/dymaxion-base';

export default function HomePage() {
  const router = useRouter();
  const [showHUD, setShowHUD] = useState(true);

  const portals = [
    LifeSupportPortal,
    CrewHarmonyPortal,
    FuelSystemPortal,
    NavigationPortal,
  ];

  return (
    <main className="bg-black relative">
      {/* ============ SECTION 1: TITLE SCREEN ============ */}
      <section className="relative h-screen flex flex-col items-center justify-center bg-black px-6 overflow-hidden">
        {/* Subtle atmospheric grain / radial vignette */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(20,20,30,0.4) 0%, rgba(0,0,0,0.95) 70%)',
          }}
        />

        {/* Very faint orbital line decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.04] z-0" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Work in Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-700/20 bg-amber-900/10 backdrop-blur-sm mb-12"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400/80" />
            </span>
            <span className="text-[11px] sm:text-xs font-light tracking-[0.15em] uppercase text-amber-200/70">
              Work in progress
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[-0.02em] text-white"
          >
            Geoscope
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-10 mb-8"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1, ease: 'easeOut' }}
            className="text-sm sm:text-base font-light text-white/50 tracking-wide leading-relaxed max-w-lg mx-auto"
          >
            A design science project, inspired by Buckminster Fuller's Geoscope
          </motion.p>

          {/* Secondary detail line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 1.4 }}
            className="text-xs font-light text-white/20 mt-6 tracking-[0.1em] uppercase"
          >
            Early prototype · evolving continuously
          </motion.p>
        </div>

        {/* Scroll prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10 left-0 right-0 text-center z-10"
        >
          <p className="text-[10px] sm:text-[11px] font-light text-white/15 tracking-[0.2em] uppercase">
            Scroll to explore
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-4 h-4 mx-auto mt-2 opacity-20"
          >
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 3v8M4 8l4 4 4-4"
                stroke="white"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ============ SECTION 2: STORY OF HUMANITY (TIMELINE) ============ */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-gray-950">
        <TimelineDesign />
      </section>

      {/* ============ SECTION 3: DYMAXION MAP ============ */}
      <section className="bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-16 lg:pt-20">
        <div className="px-6 lg:px-12 pb-8 lg:pb-10">
          <h2 className="text-3xl lg:text-4xl text-white mb-2">Dymaxion Map</h2>
          <p className="text-gray-400 text-sm lg:text-base max-w-lg">
            A global systems visualization inspired by Buckminster Fuller's projection —
            revealing planetary patterns without distorting the relationships between lands and peoples.
          </p>
        </div>
        <DymaxionBase />
      </section>

      {/* ============ SECTION 4: ICOSAHEDRON GLOBE (NEW) ============ */}
      <section className="bg-gradient-to-b from-black via-gray-950 to-black py-24 lg:py-32">
        <div className="px-6 lg:px-12 text-center">
          <h2 className="text-3xl lg:text-4xl text-white mb-2">Icosahedron Globe</h2>
          <p className="text-gray-400 text-sm lg:text-base max-w-lg mx-auto mb-12">
            An interactive geodesic projection — click to toggle display mode, drag to rotate.
          </p>

          <div className="inline-block rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6),0_0_120px_rgba(30,30,60,0.15)]">
            <IcosahedronGlobe width={680} height={500} />
          </div>

          <p className="text-[11px] sm:text-xs font-light text-white/20 tracking-[0.1em] uppercase mt-6">
            Click to toggle · Drag to rotate
          </p>
        </div>
      </section>

      {/* ============ SECTION 1: WORLD GAME PROGRESS ============ */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-black">
        <WorldGameProgress />
      </section>

      {/* ============ PORTAL SCREEN ============ */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <EarthSim />
        </div>

        <div className="relative z-10 p-6 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full justify-items-center items-center pointer-events-none">
          {portals.map((portal, index) => {
            let offscreenX = 0;
            if (typeof window !== 'undefined') {
              if (index === 0 || index === 2) offscreenX = -window.innerWidth;
              if (index === 1 || index === 3) offscreenX = window.innerWidth;
            } else {
              if (index === 0 || index === 2) offscreenX = -2000;
              if (index === 1 || index === 3) offscreenX = 2000;
            }

            let alignmentClasses = '';
            if (index === 0) alignmentClasses = 'self-start justify-self-start';
            if (index === 1) alignmentClasses = 'self-start justify-self-end';
            if (index === 2) alignmentClasses = 'self-end justify-self-start';
            if (index === 3) alignmentClasses = 'self-end justify-self-end';

            return (
              <motion.div
                key={portal.title}
                className={`portal-card-wrapper flex ${alignmentClasses} pointer-events-auto will-change-transform`}
                animate={{ x: showHUD ? 0 : offscreenX }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <PortalCard
                  title={portal.title}
                  subtitle={portal.subtitle}
                  icon={portal.icon}
                  description={portal.description}
                  mainMetric={portal.mainMetric}
                  secondaryMetric={portal.secondaryMetric}
                  metricCard={portal.metricCard}
                  href={portal.href}
                  metadataKey={portal.metadataKey}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Population Portal */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto will-change-transform"
          animate={{ y: showHUD ? 0 : window.innerHeight }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <PopulationPortal />
        </motion.div>
      </section>

      {/* ============ TOP BAR ============ */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-4 px-4 py-2 bg-white/5 backdrop-blur border border-white/20 rounded-2xl">
        <button
          className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10"
          onClick={() => setShowHUD(!showHUD)}
        >
          HUD
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10">
          Changelog
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10">
          Discord
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white tracking-wide uppercase transition-colors rounded-lg hover:bg-white/10">
          GitHub
        </button>
      </div>
    </main>
  );
}
