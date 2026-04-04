"use client";

import React from "react";
import { harmonyMetrics } from "../components/crew-harmony-data";
import { CrewHarmonyGraph } from "../components/crew-harmony-graph";
import { DropAnimation } from "../components/drop-animation";

export const CulturePortal: React.FC = () => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
      {(
        ["suicides", "violentDeaths", "displaced", "gdpImpact"] as (
          keyof typeof harmonyMetrics
        )[]
      ).map((metric) => {
        const Meta = harmonyMetrics[metric];

        return (
          <div key={metric} className="flex flex-col border-white m-1">
            {/* Top Half = Text */}
            <div className="grid grid-cols-4 items-center flex-2 mb-1 bg-neutral-900/50 rounded-t-xl">
              {/* Left (3/4) */}
              <div className="col-span-3 flex flex-col items-end justify-center text-center">
                {metric === "suicides" && (
                  <>
                    <div className="text-base font-black">
                      <span
                        style={{ color: Meta.color }}
                        className="text-xl font-black"
                      >
                        1
                      </span>{" "}
                      <span className="text-gray-400">Suicide</span>
                    </div>
                    <div className="text-xs/2 font-black">
                      <span className="text-gray-400">every </span>
                      <span style={{ color: Meta.color }}>40s</span>
                    </div>
                  </>
                )}

                {metric === "violentDeaths" && (
                  <>
                    <div className="text-base font-black">
                      <span
                        style={{ color: Meta.color }}
                        className="text-xl font-black"
                      >
                        1
                      </span>{" "}
                      <span className="text-gray-400">Murder</span>
                    </div>
                    <div className="text-xs/2 font-black">
                      <span className="text-gray-400">every </span>
                      <span style={{ color: Meta.color }}>60s</span>
                    </div>
                  </>
                )}

                {metric === "displaced" && (
                  <>
                    <div className="text-base font-black">
                      <span
                        style={{ color: Meta.color }}
                        className="text-xl font-black"
                      >
                        1
                      </span>{" "}
                      <span className="text-gray-400">displaced</span>{" "}
                    </div>
                    <div className="text-xs/2 font-black text-gray-400">
                      in every
                      <span style={{ color: Meta.color }}> 70 </span>
                    </div>
                  </>
                )}

                {metric === "gdpImpact" && (
                  <>
                    <div className="text-base font-black">
                      <span
                        style={{ color: Meta.color }}
                        className="text-xl font-black"
                      >
                        11%
                      </span>{" "}
                      <span className="text-gray-400">GDP</span>
                    </div>
                    <div className="text-xs/2 font-black">
                      <span className="text-gray-400">cost of </span>
                      <span style={{ color: Meta.color }}>violence</span>
                    </div>
                  </>
                )}
              </div>

              {/* Right (1/4) - Drop Animation only for suicides */}
              <div className="col-span-1 flex items-center justify-center h-full">
                {metric === "suicides" && (
                  <DropAnimation interval={40} color={Meta.color} />
                )}
                {metric === "violentDeaths" && (
                  <DropAnimation interval={60} color={Meta.color} />
                )}
              </div>
            </div>

            {/* Bottom Half = Graph */}
            <div className="flex-3 bg-neutral-900/50 rounded-b-xl h-[100%] w-[100%]">
              <CrewHarmonyGraph metric={metric} showAxes={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
