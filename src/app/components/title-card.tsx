import React from "react";

export default function GeoscopeTitleCard() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center text-center text-[var(--color-header-text)] select-none p-4">
      <div className="w-fit space-y-3">
        <h1 className="text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none">
          Geoscope
        </h1>
        <p className="w-full text-center text-sm sm:text-xl md:text-2xl lg:text-3xl text-[var(--color-header-muted)]">
          Dedicated to R. Buckminster Fuller
        </p>
      </div>

      {/* Flat WIP Badge with subtle pulsing emoji */}
      <div className="mt-10 sm:mt-16 inline-flex items-center gap-3 sm:gap-5 px-6 py-3.5 sm:px-10 sm:py-5 bg-[var(--color-surface)] text-[var(--color-text-summary)] font-[var(--font-mono)] uppercase tracking-widest text-sm sm:text-xl md:text-2xl">
        <span className="text-2xl sm:text-4xl md:text-5xl animate-pulse">🏗️</span>
        <span>Work in Progress</span>
      </div>
    </div>
  );
}