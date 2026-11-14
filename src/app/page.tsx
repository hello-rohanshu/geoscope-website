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

// ─── Section heights ───────────────────────────────────────────────
// `multiplier` accepts either a single number (used at every
// breakpoint), or an object keyed by breakpoint. Omitted tiers fall
// back to the tier below, so `{ base: 1, md: 1.6 }` is enough.
//
// Any number works — 1.3, 1.7, 2.35, 0.8. No registry to maintain.
//
// How it works: the numeric heights are written to CSS variables on
// the element, and Tailwind's fixed `h-[var(--h-*)]` classes read
// those variables. The classes are literal strings in source, so
// Tailwind always generates them; the values are dynamic, so any
// number is accepted. This avoids the trap where a template-string
// class (`sm:h-[...]`) never gets generated at build time.
type Multiplier =
  | number
  | {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };

// Guards against typos ("1.3abc", NaN, negative, zero) that would
// otherwise produce invalid CSS and silently collapse the section.
function safeHeight(value: number, tier: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    console.error(
      `[Section] Invalid multiplier "${value}" at tier "${tier}". ` +
      `Expected a positive number. Falling back to 1.`
    );
    return 1;
  }
  return value;
}

// Expand any input into a full 5-tier set, each value validated.
function resolveHeights(multiplier: Multiplier) {
  if (typeof multiplier === 'number') {
    const v = safeHeight(multiplier, 'base');
    return { base: v, sm: v, md: v, lg: v, xl: v };
  }

  const base = safeHeight(multiplier.base, 'base');
  const sm = safeHeight(multiplier.sm ?? base, 'sm');
  const md = safeHeight(multiplier.md ?? sm, 'md');
  const lg = safeHeight(multiplier.lg ?? md, 'lg');
  const xl = safeHeight(multiplier.xl ?? lg, 'xl');
  return { base, sm, md, lg, xl };
}

// Layout wrapper. `className` is appended last, so a one-off override
// like `className="md:!h-[200svh]"` still wins if you ever need it.
function Section({
  children,
  className = '',
  multiplier = 1,
}: {
  children: ReactNode;
  className?: string;
  multiplier?: Multiplier;
}) {
  const h = resolveHeights(multiplier);

  return (
    <section
      style={{
        ['--h-base' as string]: `${h.base * 100}svh`,
        ['--h-sm' as string]: `${h.sm * 100}svh`,
        ['--h-md' as string]: `${h.md * 100}svh`,
        ['--h-lg' as string]: `${h.lg * 100}svh`,
        ['--h-xl' as string]: `${h.xl * 100}svh`,
      }}
      className={`relative z-10 flex w-full items-center justify-center pl-6 pr-14 sm:pl-7 sm:pr-21 md:pl-10 md:pr-24 lg:px-24 py-24 my-36 [&:first-of-type]:mt-0 [&:last-of-type]:mb-0 overflow-hidden h-[var(--h-base)] sm:h-[var(--h-sm)] md:h-[var(--h-md)] lg:h-[var(--h-lg)] xl:h-[var(--h-xl)] ${className}`}
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

      {/* 100svh everywhere */}
      <Section
        multiplier={{ base: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
        className="relative z-20"
      >
        <DomainPanels />
      </Section>

      <Section
        multiplier={{ base: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
        className="z-10"
      >
        <DymaxionBase />
      </Section>

      <Section
        multiplier={{ base: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
        className="relative z-20"
      >
        <HumanityTimeline />
      </Section>

      {/* Ephemeralization — Fuller quote + A/B/C progress graph */}
      <Section
        multiplier={{ base: 1 }}
        className="relative z-20"
      >
        <Ephemeralization />
      </Section>

      {/* 160svh on phones/sm, 130svh at md, 100svh at lg+ */}
      <Section
        multiplier={{ base: 1.6, sm: 1.6, md: 1, lg: 1, xl: 1 }}
        className="relative z-20"
      >
        <DesignScienceProgress />
      </Section>

      <Section
        multiplier={{ base: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
        className="relative z-20"
      >
        <GeoscopeTitleCard />
      </Section>

    </main>
  );
}