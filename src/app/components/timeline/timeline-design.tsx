"use client";

import React, { useState } from "react";
import { timelineData, TimelineEvent } from "./timeline-data";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Helper: Formats the date cleanly for UI display
const formatDateDisplay = (event: TimelineEvent): string => {
  if (event.dateMode === "yearsAgo") {
    const v = event.dateValue as number;
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B YRS AGO`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M YRS AGO`;
    return `${v.toLocaleString()} YRS AGO`;
  }
  
  const val = event.dateValue.toString();
  const isNegative = val.startsWith("-");
  const clean = val.replace("-", "");
  const [year, month, day] = clean.split("-");
  
  let formatted = year ? `${parseInt(year, 10)}` : "";
  if (month) formatted += `-${month}`;
  if (day) formatted += `-${day}`;
  
  return isNegative ? `${formatted} BC` : `${formatted} AD`;
};

// Helper: Converts timeline dates to a uniform numeric scale for the progress track
const yearToNumber = (event: TimelineEvent): number => {
  if (event.dateMode === "yearsAgo") {
    const now = new Date().getFullYear();
    return now - (event.dateValue as number);
  }
  return parseFloat(event.dateValue.toString());
};

export default function Timeline() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEvent = timelineData[currentIndex];

  // Navigation Handlers
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : timelineData.length - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev < timelineData.length - 1 ? prev + 1 : 0));

  // Progress Bar Calculation
  const years = timelineData.map((e) => yearToNumber(e));
  const min = Math.min(...years);
  const max = Math.max(...years);

  const positionPercent = (event: TimelineEvent) => {
    const pos = yearToNumber(event);
    const total = max - min || 1; // fallback to 1 to prevent division by zero
    return ((pos - min) / total) * 100;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]">
      
      {/* --- Global Header --- */}
      <header className="px-6 lg:px-12 pt-12 pb-8 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-accent)] mb-2">
              Story of Humanity
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm max-w-xl leading-relaxed">
              A journey through time, invention, and the unfolding awareness of our shared 
              destiny — inspired by Buckminster Fuller's <em>Operating Manual for Spaceship Earth</em>.
            </p>
          </div>
          {/* Metadata / Status Indicator */}
          <div className="text-xs font-mono text-[var(--color-text-muted)] tracking-wider">
            RECORD {currentIndex + 1} OF {timelineData.length}
          </div>
        </div>
      </header>

      {/* --- Progress Track --- */}
      <div className="w-full px-6 lg:px-12 py-8 max-w-7xl mx-auto">
        <div className="relative w-full h-[1px] bg-[var(--color-border)]">
          {/* Track Indicator (Sharp Vertical Dash) */}
          <div
            className="absolute h-4 w-1 bg-[var(--color-accent)] -top-[7px] transition-all duration-700 ease-in-out"
            style={{
              left: `calc(${positionPercent(currentEvent)}% - 2px)`,
            }}
          />
        </div>
      </div>

      {/* --- Main Dashboard Panel --- */}
      <main className="flex-1 px-6 lg:px-12 pb-12 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row border border-[var(--color-border)] bg-[var(--color-surface)]">
          
          {/* Left Column: Image (If available) */}
          {currentEvent.image && (
            <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] relative group overflow-hidden bg-black">
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="w-full h-48 lg:h-full object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
            </div>
          )}

          {/* Right Column: Content & Navigation */}
          <div className={`w-full ${currentEvent.image ? 'lg:w-3/5' : 'lg:w-full'} flex flex-col h-[60vh] lg:h-[65vh]`}>
            
            {/* Panel Header w/ Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start p-6 lg:p-8 border-b border-[var(--color-border)] gap-6 shrink-0">
              <div>
                <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-widest mb-2">
                  {formatDateDisplay(currentEvent)}
                  {currentEvent.dateEndValue && ` – ${formatDateDisplay({
                    ...currentEvent,
                    dateValue: currentEvent.dateEndValue,
                  })}`}
                </p>
                <h2 className="font-serif text-2xl lg:text-3xl text-[var(--color-accent)]">
                  {currentEvent.title}
                </h2>
              </div>
              
              {/* Sharp, Minimal Navigation Buttons */}
              <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={handlePrev}
                  className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-colors"
                  aria-label="Previous Event"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-colors"
                  aria-label="Next Event"
                >
                  <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 lg:p-8 overflow-y-auto flex-1 scrollbar-custom">
              {currentEvent.summary && (
                <div className="mb-6 pb-6 border-b border-[var(--color-border)]">
                  <p className="text-[var(--color-text)] text-sm lg:text-base leading-relaxed">
                    {currentEvent.summary}
                  </p>
                </div>
              )}
              
              <p className="text-[var(--color-text-muted)] text-sm lg:text-base leading-loose whitespace-pre-line">
                {currentEvent.story}
              </p>
            </div>
          </div>
          
        </div>
      </main>
      
    </div>
  );
}