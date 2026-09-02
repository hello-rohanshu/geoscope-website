import React from "react";

export default function GeoscopeTitleCard() {
  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-start px-8 sm:px-16 md:px-24 lg:px-32 py-12 bg-[var(--color-bg)] text-[var(--color-text)] select-none">
      <div className="w-fit space-y-3">
        <h1 className="text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none">
          Geoscope
        </h1>
        <p className="w-full text-left text-sm sm:text-xl md:text-2xl lg:text-3xl text-[var(--color-text)] ml-[0.33em]">
          Inspired by R. Buckminster Fuller
        </p>
      </div>
    </section>
  );
}