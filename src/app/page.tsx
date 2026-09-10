'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';
import GeoscopeCanvas from '@/app/components/GeoscopeCanvas';
import HumanityTimeline from '@/app/components/timeline/humanity-timeline';
import GeoscopeTitleCard from '@/app/components/title-card';
import DomainPanels from '@/app/components/domain-panels';
import DesignScienceProgress from '@/app/components/design-science-progress';

// Reusable full-screen layout wrapper providing site-wide boundary/padding
function Section({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`pointer-events-none relative z-10 flex min-h-[100svh] w-full items-center justify-center px-10 sm:px-12 md:px-16 lg:px-24 py-8 ${className}`}
    >
      <div className="w-full max-w-7xl flex items-center justify-center z-20">
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
      allowNestedScroll: true,
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

      {/* Screen 1 */}
      <Section className="relative z-20">
        <DomainPanels />
      </Section>

      <Section className="">
        <GeoscopeCanvas />
      </Section>

      {/* Screen 3 */}
      <Section className="relative z-20">
        <HumanityTimeline />
      </Section>

      {/* Screen 2 - Design Science Progress */}
      <Section className="relative z-20">
        <DesignScienceProgress />
      </Section>

      {/* Screen 5 - Above in z-axis */}
      <Section className="relative z-20">
        <GeoscopeTitleCard />
      </Section>
    </main>
  );
}