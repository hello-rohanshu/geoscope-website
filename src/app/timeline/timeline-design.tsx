"use client";

import React, { useState } from "react";
import { timelineData, TimelineEvent } from "./timeline-data";
import { ChevronLeft, ChevronRight } from "lucide-react";

const formatDateDisplay = (event: TimelineEvent): string => {
  if (event.dateMode === "yearsAgo") {
    const v = event.dateValue as number;
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} billion years ago`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} million years ago`;
    return `${v.toLocaleString()} years ago`;
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

const yearToNumber = (event: TimelineEvent): number => {
  if (event.dateMode === "yearsAgo") {
    const now = new Date().getFullYear();
    return now - (event.dateValue as number);
  } else return parseFloat(event.dateValue.toString());
};

export default function Timeline() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEvent = timelineData[currentIndex];

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : timelineData.length - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev < timelineData.length - 1 ? prev + 1 : 0));

  const years = timelineData.map((e) => yearToNumber(e));
  const min = Math.min(...years);
  const max = Math.max(...years);

  const positionPercent = (event: TimelineEvent) => {
    const pos = yearToNumber(event);
    const total = max - min;
    return ((pos - min) / total) * 100;
  };

  return (
    <div className="min-h-screen text-gray-200 flex flex-col">
      {/* --- Timeline Bar --- */}
      <div className="relative h-[15vh] sm:h-[20vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-3xl h-2 bg-gray-700 rounded-full">
          <div
            className="absolute h-4 w-4 bg-white rounded-full -top-1 transition-all duration-700"
            style={{
              left: `calc(${positionPercent(currentEvent)}% - 8px)`,
            }}
          ></div>
        </div>
      </div>

      {/* --- Intro (mobile: top, desktop: hidden because it's in the card area) --- */}
      <div className="px-6 pb-4 lg:hidden">
        <h1 className="text-3xl font-serif text-white mb-2">Story of Humanity</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          A journey through time, invention, and the unfolding awareness of our shared 
          destiny — inspired by Buckminster Fuller's <em>Operating Manual for Spaceship Earth</em>.
        </p>
      </div>

      {/* --- Navigation (mobile: top, desktop: right side) --- */}
      <div className="flex lg:hidden justify-center gap-6 pb-4">
        <button
          onClick={handlePrev}
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-md transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-md transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* --- Main Layout --- */}
      <div className="flex flex-col lg:flex-row flex-1 px-4 sm:px-10 pb-12 gap-4">
        {/* Left Column (desktop only) */}
        <div className="hidden lg:flex lg:w-1/4 lg:pr-8 flex-col justify-center">
          <h1 className="text-4xl font-serif text-white mb-4">Story of Humanity</h1>
          <p className="text-gray-400 leading-relaxed text-sm">
            A journey through time, invention, and the unfolding awareness of our shared 
            destiny — inspired by Buckminster Fuller's <em>Operating Manual for Spaceship Earth</em>.
          </p>
        </div>

        {/* Middle Column - Card */}
        <div className="w-full lg:w-3/5 flex flex-col justify-center">
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-lg p-4 sm:p-8 flex flex-col h-[60vh] sm:h-[70vh]">
            {currentEvent.image && (
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="rounded-xl mb-4 object-cover h-32 sm:h-48 w-full"
              />
            )}
            <h2 className="font-serif text-xl sm:text-2xl text-white mb-2">
              {currentEvent.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mb-3">
              {formatDateDisplay(currentEvent)}
              {currentEvent.dateEndValue && ` – ${formatDateDisplay({
                ...currentEvent,
                dateValue: currentEvent.dateEndValue,
              })}`}
            </p>

            {currentEvent.summary && (
              <>
                <p className="text-gray-300 leading-relaxed text-sm mb-3">
                  {currentEvent.summary}
                </p>
                <div className="w-full h-px bg-gray-700 mb-3"></div>
              </>
            )}

            <div className="overflow-y-auto flex-1 pr-1">
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                {currentEvent.story}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation (desktop only) */}
        <div className="hidden lg:flex lg:w-[10%] pl-6 flex-col items-center justify-center space-y-4">
          <button
            onClick={handleNext}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-md transition-all hover:scale-105"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={handlePrev}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-md transition-all hover:scale-105"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}