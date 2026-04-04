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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-gray-200 flex flex-col">
      {/* --- Timeline Bar --- */}
      <div className="relative h-[25vh] flex items-center justify-center">
        <div className="relative w-4/5 h-2 bg-gray-700 rounded-full">
          <div
            className="absolute h-4 w-4 bg-white rounded-full -top-1 transition-all duration-700"
            style={{
              left: `calc(${positionPercent(currentEvent)}% - 8px)`,
            }}
          ></div>
        </div>
      </div>

      {/* --- Main Layout --- */}
      <div className="flex flex-1 px-10 pb-12">
        {/* Left Column */}
        <div className="w-1/4 pr-8 flex flex-col justify-center">
          <h1 className="text-4xl font-serif text-white mb-4">Story of Humanity</h1>
          <p className="text-gray-400 leading-relaxed text-sm">
            This is the story of humanity as told through the visionary lens of Buckminster
            Fuller, drawn from his <em>Operating Manual for Spaceship Earth</em> — a journey
            through time, invention, and the unfolding awareness of our shared destiny.
          </p>
        </div>

        {/* Middle Column - Card */}
        <div className="w-3/5 flex flex-col justify-center">
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-lg p-8 flex flex-col h-[70vh]">
            {currentEvent.image && (
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="rounded-xl mb-4 object-cover h-48 w-full"
              />
            )}
            <h2 className="font-serif text-2xl text-white mb-2">{currentEvent.title}</h2>
            <p className="text-sm text-gray-400 mb-3">
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

            <div className="overflow-y-auto scrollbar-custom flex-1 pr-1">
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                {currentEvent.story}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Navigation */}
        <div className="w-[10%] pl-6 flex flex-col items-center justify-center space-y-4">
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
