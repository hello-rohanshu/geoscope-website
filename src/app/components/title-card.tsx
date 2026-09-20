import React from "react";

export default function GeoscopeTitleCard() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-start text-left text-[var(--color-header-text)] select-none py-4 pr-4 pl-0 ml-0">
      <div className="w-full space-y-2 sm:space-y-3">
        <h1 className="text-5xl sm:text-8xl md:text-9xl tracking-tighter leading-none break-words">
          Geoscope
        </h1>
        <p className="text-xs sm:text-xl md:text-2xl lg:text-3xl text-[var(--color-header-muted)] ml-2">
          Dedicated to R. Buckminster Fuller
        </p>
      </div>

      {/* Responsive Left-Aligned WIP Badge */}
      <div className="mt-8 sm:mt-16 ml-2 inline-flex items-center gap-2 sm:gap-4 px-2 py-1 sm:px-4 sm:py-3 bg-[var(--color-surface)] text-yellow-400 font-[var(--font-mono)] uppercase tracking-widest text-xs sm:text-base md:text-lg">
        <span className="text-lg sm:text-2xl md:text-3xl">🏗️</span>
        <span className="">Work in Progress</span>
      </div>
    </div>
  );
}