'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';
import GeoscopeCanvas from '@/app/components/GeoscopeCanvas';
import HumanityTimeline from '@/app/components/timeline/humanity-timeline';
import GeoscopeTitleCard from '@/app/components/title-card';
import DomainPanels from '@/app/components/domain-panels';
import DesignScienceProgress from '@/app/components/design-science-progress';
import DymaxionBase from "@/app/components/dymaxion-group/dymaxion-base";
import Ephemeralization from '@/app/components/timeline/ephemeralization';

// Dynamic layout wrapper accepting a numerical viewport height multiplier cap
function Section({
  children,
  className = '',
  multiplier = 1,
}: {
  children: ReactNode;
  className?: string;
  multiplier?: number;
}) {
  return (
    <section
      style={{ height: `${multiplier * 100}svh` }}
      /* Restored py-14 here */
      className={`relative z-10 flex w-full items-center justify-center pl-6 pr-14 sm:pl-7 sm:pr-21 md:pl-10 md:pr-24 lg:px-24 py-14 overflow-hidden ${className}`}
    >
      <div className="w-full max-w-7xl h-full flex items-center justify-center z-20 min-h-0">
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      smoothWheel: true,
      // allowNestedScroll: true,
      prevent: (node) => {
        const style = window.getComputedStyle(node);
        const isScrollable =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight;
        return isScrollable;
      },
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative text-white overflow-x-hidden">

      <GeoscopeCanvas />

      {/* 100svh max limit */}
      <Section multiplier={1} className="relative z-20">
        <DomainPanels />
      </Section>

      {/* 160svh max limit */}
      <Section multiplier={1} className="z-10">
        <DymaxionBase />
      </Section>

      {/* 160svh max limit */}
      <Section multiplier={1} className="relative z-20">
        <HumanityTimeline />
      </Section>

      {/* Ephemeralization — Fuller quote + A/B/C progress graph */}
      <Section multiplier={1.6} className="relative z-20">
        <Ephemeralization />
      </Section>

      {/* 100svh max limit */}
      <Section multiplier={1} className="relative z-20">
        <DesignScienceProgress />
      </Section>

      {/* 100svh max limit */}
      <Section multiplier={1} className="relative z-20">
        <GeoscopeTitleCard />
      </Section>

    </main>
  );
}