// app/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import WorldGameProgress from './components/design-science-progress';
import FuelSystemPortal from './areas/earth-systems/portal';
import LifeSupportPortal from './areas/standard-of-life/portal';
import CrewHarmonyPortal from './areas/culture/portal';
import NavigationPortal from './areas/science/portal';
import PopulationPortal from './areas/population/population-portal';
import PortalCard from './components/portal-design/portal-design';
import EarthSim from './components/earth-sim';
import TimelineDesign from './components/timeline/timeline-design';
import DymaxionBase from './components/dymaxion-group/dymaxion-base';
import GeoscopeTitleCard from './components/title-card';

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

      {/* DYMAXION MAP */}
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

      {/* STORY OF HUMANITY (TIMELINE) */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-gray-950">
        <TimelineDesign />
      </section>

      {/* WORLD GAME PROGRESS */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-black">
        <WorldGameProgress />
      </section>

      {/* PORTAL SCREEN */}
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

      {/* TITLE SCREEN */}
      <section className="relative min-h-screen flex items-center justify-center">
        <GeoscopeTitleCard />
      </section>

      {/* TOP BAR */}
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