"use client";

import { useState } from "react";
import DymaxionMap from "./dymaxion-map";
import OverlayPopulation from "./dymaxion-overlays/overlay-population";

export default function DymaxionBase() {
  const [showPopulation, setShowPopulation] = useState(true);
  const [sourceFile, setSourceFile] = useState<string | null>(null);

  return (
    <div className="w-full p-4 sm:p-8 lg:p-12 flex flex-col lg:flex-row gap-6 lg:gap-8">

      {/* Left Column: Map + Timeline */}
      <div className="flex flex-col gap-6 flex-[2]">

        {/* Map Container */}
        <div className="w-full aspect-[2/1] rounded-2xl shadow-xl overflow-hidden border border-gray-700 bg-gray-900">
          <DymaxionMap>
            {showPopulation && <OverlayPopulation onSourceFile={setSourceFile} />}
          </DymaxionMap>
        </div>

        {/* Timeline Placeholder */}
        <div className="w-full h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400 font-mono text-sm px-4">
          Timeline will appear here
        </div>
      </div>

      {/* Right Column: Controls + Cards */}
      <div className="flex flex-col gap-6 flex-[1] min-w-0 lg:min-w-[280px]">

        {/* Overlay Toggles */}
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 space-y-4 flex-1">

          <div className="text-gray-300 font-semibold tracking-wide">
            Overlays
          </div>

          <label className="flex items-center gap-3 text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPopulation}
              onChange={() => setShowPopulation(v => !v)}
              className="accent-red-500"
            />
            <span>Population</span>
          </label>

        </div>

        {/* Overlay Cards / Data Views */}
        {/* <div className="flex-1 bg-gray-800 rounded-lg border border-gray-600 p-4 overflow-y-auto text-gray-300 space-y-4">

          {showPopulation ? (
            <div className="rounded-lg bg-gray-900 border border-gray-700 p-4">
              <div className="text-sm text-gray-400">Population</div>
              <div className="text-xs text-red-400 font-mono break-all mt-1">
                {sourceFile ?? "Loading..."}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic text-sm">
              No data overlays active
            </div>
          )}

        </div> */}
      </div>
    </div>
  );
}