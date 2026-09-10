"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { timelineData } from "./timeline-data";
import type { TimelineEvent } from "./timeline-data";

const CURRENT_YEAR = new Date().getFullYear();

// ─── UTILS ───────────────────────────────────────────────────────────────────

function parseToYearsAgo(val: string | number): number {
  if (typeof val === "number") return val;
  if (!val) return 0;

  if (val.startsWith("-") && !val.substring(1).includes("-")) {
    const year = parseInt(val, 10);
    return isNaN(year) ? 0 : CURRENT_YEAR + Math.abs(year);
  }

  if (val.includes("-") && val.split("-").length > 1) {
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      return Math.max(0, CURRENT_YEAR - date.getFullYear());
    }
  }

  const year = parseInt(val, 10);
  if (isNaN(year)) return 0;
  return year < 0 ? CURRENT_YEAR + Math.abs(year) : Math.max(0, CURRENT_YEAR - year);
}

function formatDate(event: TimelineEvent): string {
  const formatSingle = (val: string | number, mode: TimelineEvent["dateMode"]): string => {
    if (mode === "yearsAgo") {
      const v = typeof val === "string" ? parseInt(val, 10) : val;
      if (v === 0) return "Present Day";
      if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B years ago`;
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M years ago`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K years ago`;
      return `${v.toLocaleString()} years ago`;
    }

    if (typeof val === "string" && val.includes("-") && val.split("-").length > 1) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return `${date.getFullYear()} AD`;
      }
    }
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    return num < 0 ? `${Math.abs(num)} BC` : `${num} AD`;
  };

  const start = formatSingle(event.dateValue, event.dateMode);
  if (event.dateEndValue) {
    const end = formatSingle(event.dateEndValue, event.dateMode);
    return `${start} — ${end}`;
  }
  return start;
}

// ─── NAV BUTTON COMPONENT ───────────────────────────────────────────────────

function NavBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center text-base md:text-lg transition-colors duration-200 cursor-pointer outline-none select-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
      style={{
        color: hover ? "var(--color-header-text, #ffffff)" : "var(--color-header-muted, #a0aab8)",
        background: hover ? "var(--color-surface-elevated)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function HumanityTimeline() {
  const [idx, setIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [touchStartLoc, setTouchStartLoc] = useState<{ x: number; y: number } | null>(null);
  const [touchEndLoc, setTouchEndLoc] = useState<{ x: number; y: number } | null>(null);

  const prevImg = useRef("");
  const contentRef = useRef<HTMLDivElement>(null);
  const event = timelineData[idx];

  const prev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : timelineData.length - 1)), []);
  const next = useCallback(() => setIdx((i) => (i < timelineData.length - 1 ? i + 1 : 0)), []);

  useEffect(() => {
    if (prevImg.current !== event.image) {
      setImgLoaded(false);
      prevImg.current = event.image || "";
    }
  }, [event.image]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndLoc(null);
    setTouchStartLoc({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndLoc({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const handleTouchEnd = () => {
    if (!touchStartLoc || !touchEndLoc) return;
    const dx = touchStartLoc.x - touchEndLoc.x;
    const dy = touchStartLoc.y - touchEndLoc.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx > 0) next();
      else prev();
    }
  };

  const { maxYearsAgo } = useMemo(() => {
    const years = timelineData.map((e) => parseToYearsAgo(e.dateValue));
    return { maxYearsAgo: Math.max(...years) };
  }, []);

  const timelinePercentRaw = (ev: TimelineEvent): number => {
    const y = parseToYearsAgo(ev.dateValue);
    return ((maxYearsAgo - y) / maxYearsAgo) * 100;
  };

  const pctRaw = timelinePercentRaw(event);

  const getClosestIdxFromClick = (clientX: number, target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickPct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));

    let closestIdx = 0;
    let minDiff = Infinity;
    timelineData.forEach((ev, i) => {
      const evPct = timelinePercentRaw(ev);
      const diff = Math.abs(evPct - clickPct);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    return closestIdx;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setIdx(getClosestIdxFromClick(e.clientX, e.currentTarget));
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setHoverPct(x);
  };

  return (
    <>
      <div className="sr-only" aria-live="polite">
        Event {idx + 1} of {timelineData.length}: {event.title}, {formatDate(event)}
      </div>

      <div className="w-full flex flex-col items-center pointer-events-auto">
        {/* Header */}
        <div className="w-full mb-3 md:mb-4 flex items-end justify-between shrink-0">
          <div className="flex flex-col gap-0.5">
            <h1 className="title-section">Brief Story of Humanity</h1>
          </div>

          <div className="flex items-center gap-1">
            <NavBtn onClick={prev} label="Previous event (Left Arrow)">←</NavBtn>
            <NavBtn onClick={next} label="Next event (Right Arrow)">→</NavBtn>
          </div>
        </div>

        {/* Outer Card Wrapper */}
        <div
          className="w-full h-[520px] md:h-[450px] lg:h-[460px] flex flex-col relative z-10 overflow-hidden"
          style={{
            background: "var(--color-surface)",
            boxShadow: "var(--color-shadow)",
          }}
        >
          {/* Inner Split Content */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex flex-col lg:flex-row flex-1 w-full relative overflow-hidden min-h-0"
          >
            {/* LEFT: Image Panel */}
            <div
              className="relative w-full h-[180px] sm:h-[200px] lg:h-full lg:w-1/2 overflow-hidden shrink-0 select-none"
              style={{ background: "var(--color-surface-elevated)" }}
            >
              {!imgLoaded && (
                <div className="absolute inset-0 opacity-20 animate-pulse bg-[var(--color-text-muted)]" />
              )}
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  onLoad={() => setImgLoaded(true)}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-out"
                  style={{ opacity: imgLoaded ? 0.85 : 0 }}
                />
              )}

              {/* Counter Badge */}
              <div
                className="absolute bottom-3 left-3 z-10 px-2 py-0.5 pointer-events-none backdrop-blur-md"
                style={{
                  background: "var(--color-overlay)",
                  color: "var(--color-overlay-text)",
                }}
              >
                <span className="text-[11px] md:text-xs font-medium tracking-widest uppercase opacity-90">
                  {idx + 1} / {timelineData.length}
                </span>
              </div>
            </div>

            {/* RIGHT: Content Panel */}
            <div className="flex-1 w-full min-h-0 lg:h-full lg:w-1/2 flex flex-col relative overflow-hidden bg-[var(--color-surface)]">
              <div
                ref={contentRef}
                className="flex-1 min-h-0 overflow-y-auto px-5 py-4 md:px-7 md:py-6 scrollbar-matte"
              >
                <div key={`story-${idx}`} className="animate-content-delayed">
                  <h2 className="title-card mb-3" style={{ color: "var(--color-text)" }}>
                    {event.title}
                  </h2>

                  {event.summary && (
                    <div className="p-3 mb-3">
                      <p
                        className="text-sm md:text-sm leading-relaxed font-medium opacity-90 m-0"
                        style={{ color: "var(--color-text-summary)" }}
                      >
                        {event.summary}
                      </p>
                    </div>
                  )}

                  <p
                    className="text-sm md:text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {event.story}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE PROGRESS BAR */}
          <div
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={() => setHoverPct(null)}
            tabIndex={0}
            role="slider"
            aria-label="Timeline progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pctRaw)}
            className="w-full h-8 md:h-9 shrink-0 relative overflow-hidden z-20 flex items-center justify-center select-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
            style={{
              background: "var(--color-progress-track)",
            }}
            title="Click to jump to timeline point"
          >
            {/* Progress Fill */}
            <div
              className="absolute left-0 top-0 h-full ease-out transition-all duration-500 z-0 pointer-events-none"
              style={{
                width: `${pctRaw}%`,
                background: "var(--color-progress)",
              }}
            />

            {/* Hover Indicator Cue */}
            {hoverPct !== null && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[var(--color-text)] opacity-30 pointer-events-none transition-opacity duration-150"
                style={{ left: `${hoverPct}%` }}
              />
            )}

            <span
              key={`date-${idx}`}
              className="text-xs font-semibold tracking-wider z-10 relative uppercase opacity-95"
              style={{ color: "var(--color-text)" }}
            >
              {formatDate(event)} · {pctRaw.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}