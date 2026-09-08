'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import GeoscopeCanvas from '@/app/components/GeoscopeCanvas';

function DummyBefore() {
  return (
    <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center p-8">
      <div className="pointer-events-auto max-w-xs rounded-lg border border-white/20 bg-black/60 p-5 backdrop-blur-md">
        <h2 className="text-base font-semibold">Dummy Component Before</h2>
        <p className="mt-2 text-xs text-white/70">
          First component (shape is scrolled below this screen).
        </p>
      </div>
    </div>
  );
}

function DummyAfter() {
  return (
    <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center p-8">
      <div className="pointer-events-auto max-w-xs rounded-lg border border-white/20 bg-black/60 p-5 backdrop-blur-md">
        <h2 className="text-base font-semibold">Dummy Component After</h2>
        <p className="mt-2 text-xs text-white/70">
          A card component placed after Screen 2.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <main className="relative min-h-[400vh] text-white">
      <GeoscopeCanvas />

      {/* Screen 0: First Component */}
      <DummyBefore />

      {/* Screen 1: Shape appears here */}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between p-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-wider">GEOSCOPE</h1>
          <div className="pointer-events-auto rounded-lg border border-white/20 bg-black/40 p-4 backdrop-blur-md">
            <p className="text-sm">Main Controls / Status</p>
          </div>
        </header>
        <div className="text-center text-xs text-white/50">Scroll down ↓</div>
      </div>

      {/* Screen 2 */}
      <div className="pointer-events-none relative z-10 flex min-h-screen items-center justify-center p-8">
        <div className="pointer-events-auto max-w-xs rounded-lg border border-white/20 bg-black/60 p-5 backdrop-blur-md">
          <h2 className="text-base font-semibold">Sensory Framework</h2>
          <p className="mt-2 text-xs text-white/70">
            A secondary card component anchored down the page.
          </p>
        </div>
      </div>

      {/* Screen 3 */}
      <DummyAfter />
    </main>
  );
}