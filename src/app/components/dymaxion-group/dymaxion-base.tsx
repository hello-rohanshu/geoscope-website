"use client";

import type { RefObject } from "react";
import type { GlobeControls } from "../scene/GlobeR3F";
import { GLOBE_STAGES } from "@/utils/icosahedron-geometry";
import { LAYERS, type LayerId } from "./use-dymaxion-state";

interface DymaxionBaseProps {
  stage: number;
  setStage: (stage: number) => void;
  activeLayerId: LayerId | null;
  setActiveLayerId: (id: LayerId | null) => void;
  loading: boolean;
  /** GlobeControls ref, owned by the page (via useDymaxionState) and
   *  forwarded into GeoscopeScene — the zoom/reset buttons below just
   *  read it directly, same as the original imperative-handle pattern. */
  globeRef: RefObject<GlobeControls | null>;
}

/**
 * Pure HTML overlay: the Unfold/Fold button, map zoom controls, and the
 * overlay radio panel. No canvas, no Three.js — the globe itself now
 * renders in GeoscopeScene, the fixed full-screen background canvas that
 * sits behind this component (port spec §3, "HTML UI Layer").
 */
export default function DymaxionBase({
  stage,
  setStage,
  activeLayerId,
  setActiveLayerId,
  loading,
  globeRef,
}: DymaxionBaseProps) {
  const atFlat = stage >= GLOBE_STAGES.DYMAXION;
  const isUnfolded = stage >= GLOBE_STAGES.WIRES_GONE;

  return (
    <div className="w-full flex flex-col items-center pointer-events-auto select-none">
      {/* Header Bar */}
      <div className="w-full mb-3 md:mb-4 flex items-center justify-between shrink-0">
        {/* 
            INTENTIONALITY: Equalized button geometry (`w-36 h-9`) matching design tokens.
            No borders; surface elevation distinguish state changes cleanly without jumps.
        */}
        <button
          type="button"
          onClick={() =>
            setStage(
              isUnfolded ? GLOBE_STAGES.SPHERE : GLOBE_STAGES.WIRES_GONE
            )
          }
          className="w-36 h-9 flex items-center justify-center text-xs md:text-sm font-medium transition-colors duration-200 cursor-pointer outline-none shrink-0"
          style={{
            background: isUnfolded
              ? "var(--color-surface-elevated)"
              : "var(--color-surface)",
            color: isUnfolded
              ? "var(--color-text)"
              : "var(--color-header-text)",
            boxShadow: "var(--color-shadow)",
          }}
        >
          {isUnfolded ? "Fold" : "Unfold"}
        </button>
      </div>

      {/* 
          INTENTIONALITY: Unframed Grid with Zero Borders.
          Panels use exact CSS system tokens (`var(--color-surface)`, `var(--color-surface-elevated)`) 
          and native shadows to float seamlessly over the site backdrop.
      */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Layout spacer & Timeline Track */}
        <div className="lg:col-span-2 w-full flex flex-col gap-3">
          {/* 
              The globe itself now lives in GeoscopeScene, the fixed
              full-screen background canvas — it is no longer embedded here.
              This div is kept only as a layout spacer so the controls and
              timeline track below don't reflow to fill the space the
              embedded canvas used to occupy. It renders nothing and
              intercepts no pointer events.
          */}
          <div
            className="w-full aspect-[2/1] max-h-[420px] pointer-events-none"
            aria-hidden="true"
          />

          {/* 
              INTENTIONALITY: Map controls fade in only once the fold has settled flat.
              Zoom and pan have no meaning on a sphere, so rendering them earlier
              would be dead chrome. `tabIndex` is mirrored to the same gate so
              keyboard users can't tab into invisible, unusable buttons — the same
              discipline the `pointer-events-none` class already enforces for mice.
          */}
          <div
            className={`w-full flex items-center gap-2 transition-opacity duration-300 ${
              atFlat ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!atFlat}
          >
            <button
              type="button"
              onClick={() => globeRef.current?.zoomIn()}
              aria-label="Zoom in"
              tabIndex={atFlat ? 0 : -1}
              className="w-9 h-9 flex items-center justify-center text-base font-medium cursor-pointer outline-none"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-header-text)",
                boxShadow: "var(--color-shadow)",
              }}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => globeRef.current?.zoomOut()}
              aria-label="Zoom out"
              tabIndex={atFlat ? 0 : -1}
              className="w-9 h-9 flex items-center justify-center text-base font-medium cursor-pointer outline-none"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-header-text)",
                boxShadow: "var(--color-shadow)",
              }}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => globeRef.current?.resetView()}
              tabIndex={atFlat ? 0 : -1}
              className="h-9 px-4 flex items-center justify-center text-xs md:text-sm font-medium cursor-pointer outline-none"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-header-text)",
                boxShadow: "var(--color-shadow)",
              }}
            >
              Reset view
            </button>
          </div>

          <div
            className={`w-full h-9 flex items-center justify-center text-xs font-semibold tracking-wider uppercase transition-opacity duration-300 ${
              atFlat ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{
              background: "var(--color-progress-track)",
              color: "var(--color-text-muted)",
            }}
          >
            Timeline Track
          </div>
        </div>

        {/* Floating Overlay Controls */}
        <div
          className={`lg:col-span-1 w-full transition-opacity duration-300 ${
            atFlat ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="p-5 flex flex-col gap-3"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--color-shadow)",
            }}
          >
            <h2
              className="title-card"
              style={{ color: "var(--color-header-text)" }}
            >
              Overlays
            </h2>

            <div className="flex flex-col gap-2">
              <label
                className="flex items-center gap-3 text-sm cursor-pointer select-none transition-colors duration-150"
                style={{ color: "var(--color-text)" }}
              >
                <input
                  type="radio"
                  name="layer"
                  checked={activeLayerId === null}
                  onChange={() => setActiveLayerId(null)}
                  className="accent-[var(--color-accent)] cursor-pointer"
                />
                <span>Off</span>
              </label>

              {LAYERS.map((l) => (
                <label
                  key={l.id}
                  className="flex items-center gap-3 text-sm cursor-pointer select-none transition-colors duration-150"
                  style={{ color: "var(--color-text)" }}
                >
                  <input
                    type="radio"
                    name="layer"
                    checked={activeLayerId === l.id}
                    onChange={() => setActiveLayerId(l.id)}
                    className="accent-[var(--color-accent)] cursor-pointer"
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>

            {loading && (
              <div
                className="text-xs pt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Loading raster data…
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
