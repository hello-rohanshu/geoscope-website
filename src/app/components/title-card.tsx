import React from "react";

export default function GeoscopeTitleCard() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-start text-left text-[var(--color-header-text)] select-none py-4 pr-4 pl-0 ml-0">
      <div className="w-full space-y-2 sm:space-y-3">
        {/* Title Container with Fluid Sizing & Shoulder Badge */}
        <div className="inline-flex items-start gap-2 sm:gap-4 max-w-full">
          <h1 className="text-[clamp(3.25rem,12vw,9.5rem)] tracking-tighter leading-none whitespace-nowrap">
            Geoscope
          </h1>
          
          {/* Accent Alpha Superscript Tag */}
          <span className="self-auto mt-1 sm:mt-3 text-[clamp(1rem,3.5vw,4.5rem)] font-[var(--font-mono)] text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-none uppercase tracking-widest leading-none shrink-0">
            Alpha
          </span>
        </div>

        <p className="text-xs sm:text-xl md:text-2xl lg:text-3xl text-[var(--color-header-muted)] ml-2">
          Dedicated to R. Buckminster Fuller
        </p>
      </div>


    </div>
  );
}