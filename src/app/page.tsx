'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';
import GeoscopeScene from '@/app/components/scene/GeoscopeScene';
import { useDymaxionState } from '@/app/components/dymaxion/use-dymaxion-state';
import HumanityTimeline from '@/app/components/timeline/humanity-timeline';
import GeoscopeTitleCard from '@/app/components/title-card';
import DomainPanels from '@/app/components/domain-panels';
import DesignScienceProgress from '@/app/components/design-science-progress';
import DymaxionBase from '@/app/components/dymaxion/dymaxion-base';

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
      className={`relative z-10 pointer-events-none flex min-h-[100svh] w-full items-center justify-center px-10 sm:px-12 md:px-16 lg:px-24 py-8 border-4 border-white ${className}`}
    >
      <div className="w-full max-w-7xl flex items-center justify-center z-20">
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const dymaxion = useDymaxionState();

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

      <GeoscopeScene
        ref={dymaxion.globeRef}
        stage={dymaxion.stage}
        onStageChange={dymaxion.setStage}
        overlaySamples={dymaxion.samples}
        showOverlay={dymaxion.activeLayerId !== null}
        overlayColor={dymaxion.activeLayer?.color}
        overlaySize={dymaxion.activeLayer?.size}
        overlayOpacity={dymaxion.activeLayer?.opacity}
        baseLayer={
          dymaxion.earthTexture
            ? { mode: 'texture', texture: dymaxion.earthTexture }
            : { mode: 'debug' }
        }
      />

      <Section className="z-10">
        <DymaxionBase
          stage={dymaxion.stage}
          setStage={dymaxion.setStage}
          activeLayerId={dymaxion.activeLayerId}
          setActiveLayerId={dymaxion.setActiveLayerId}
          loading={dymaxion.loading}
          globeRef={dymaxion.globeRef}
        />
      </Section>

      <Section className="relative z-20">
        <DomainPanels />
      </Section>

      <Section className="relative z-20">
        <HumanityTimeline />
      </Section>

      <Section className="relative z-20">
        <DesignScienceProgress />
      </Section>

      <Section className="relative z-20">
        <GeoscopeTitleCard />
      </Section>

    </main>
  );
}