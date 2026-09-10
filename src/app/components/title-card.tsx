import React from "react";

export default function GeoscopeTitleCard() {
  return (
    <div className="w-full flex flex-col justify-center items-start text-[var(--color-header-text)] select-none">
      <div className="w-fit space-y-3">
        <h1 className="text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none">
          Geoscope
        </h1>
        <p className="w-full text-left text-sm sm:text-xl md:text-2xl lg:text-3xl text-[var(--color-header-text)] ml-[0.33em]">
          Inspired by R. Buckminster Fuller
        </p>
      </div>
    </div>
  );
}