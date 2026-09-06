"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ─── TYPES & DATA ────────────────────────────────────────────────────────────

type TimelineEvent = {
  title: string;
  summary: string;
  story: string;
  image: string;
  dateMode: "yearsAgo" | "calendar";
  dateValue: number | string;
};

const timelineData: TimelineEvent[] = [
  {
    title: "Universe begins",
    summary: "The origin of all non-simultaneously apprehended events.",
    story: "Fuller saw the universe as a scenario of events, not things. An aggregate of all consciously-experienced phenomena — the only whole system that is truly closed.\n\nBefore stars, before planets, before life: a process beginning. Energy neither created nor destroyed, only transformed. The game was already decided by the rules physics chose.",
    image: "/humans-universe.jpg",
    dateMode: "yearsAgo",
    dateValue: 13_800_000_000,
  },
  {
    title: "Earth forms",
    summary: "Spaceship Earth is provisioned for a multi-billion-year journey.",
    story: '"Spaceship Earth was so superbly designed and equipped" — Fuller.\n\nFour and a half billion years ago, gravity pulled dust and gas into a sphere. Everything aboard was provided at the outset: the metals, the carbon, the water, the energy budget from the sun. No resupply ship is coming. The inventory was fixed at launch.',
    image: "/humans-earth.jpg",
    dateMode: "yearsAgo",
    dateValue: 4_500_000_000,
  },
  {
    title: "Homo sapiens emerges",
    summary: "Life evolves the capacity to discover generalized universal principles.",
    story: 'What distinguished the human was not physical strength but the ability to discover and use the invisible, weightless, generalizable principles governing physical reality.\n\nFuller: "Humans are the only species endowed with mind." This is not a modest claim. It defines a profound evolutionary responsibility.',
    image: "/humans-sapiens.jpg",
    dateMode: "yearsAgo",
    dateValue: 300_000,
  },
  {
    title: "Industrialization",
    summary: "Humanity masters planetary energy, but centralizes its control.",
    story: 'Fuller\'s measure of wealth was not money but "the number of forward days you are ahead of the lethal emergency." Industry multiplied that metric for millions.\n\nBut it also entrenched old systems of power. Those who understood the power of the new tools used them to deepen control, rather than distribute capability.',
    image: "/humans-industrial.jpg",
    dateMode: "calendar",
    dateValue: "1800",
  },
  {
    title: "Utopia or Oblivion",
    summary: "The final evolutionary exam: design a system for 100% of humanity, or perish.",
    story: '"Whether it is to be Utopia or Oblivion will be a touch-and-go relay race right up to the final moment."\n\nFor the first time in human history, the technology exists to provide every human being on Earth with a higher standard of living than any king has ever enjoyed. The question is not whether it can be done, but whether we realize it in time.',
    image: "/humans-utopiaoroblivion-gemini-ok.jpg",
    dateMode: "yearsAgo",
    dateValue: 0,
  },
];

const UNIVERSE_AGE_YEARS = 13_800_000_000;
const CURRENT_YEAR = new Date().getFullYear();

// ─── UTILS ───────────────────────────────────────────────────────────────────

function toYearsAgo(event: TimelineEvent): number {
  if (event.dateMode === "yearsAgo") return event.dateValue as number;
  const val = event.dateValue.toString();
  const year = Math.abs(parseInt(val, 10));
  return val.startsWith("-") ? CURRENT_YEAR + year : Math.max(0, CURRENT_YEAR - year);
}

function cosmicPercentRaw(event: TimelineEvent): number {
  const elapsed = UNIVERSE_AGE_YEARS - toYearsAgo(event);
  return Math.min(100, Math.max(0, (elapsed / UNIVERSE_AGE_YEARS) * 100));
}

function cosmicPercent(event: TimelineEvent): string {
  const yearsAgo = toYearsAgo(event);
  const elapsed = UNIVERSE_AGE_YEARS - yearsAgo;
  const pct = (elapsed / UNIVERSE_AGE_YEARS) * 100;

  if (pct < 1e-9) return "0.000000000%";
  if (pct >= 100) return "100.000%";

  const str = pct.toFixed(12);
  const decPart = str.split(".")[1] || "";
  let leadingNines = 0;
  for (const c of decPart) {
    if (c === "9") leadingNines++;
    else break;
  }

  const places = Math.max(3, leadingNines + 2);
  return pct.toFixed(Math.min(places, 9)) + "%";
}

function formatDate(event: TimelineEvent): string {
  if (event.dateMode === "yearsAgo") {
    const v = event.dateValue as number;
    if (v === 0) return "Present Day";
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B years ago`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M years ago`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K years ago`;
    return `${v.toLocaleString()} years ago`;
  }
  const val = event.dateValue.toString();
  const year = Math.abs(parseInt(val, 10));
  return `${year}${val.startsWith("-") ? " BC" : " AD"}`;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function NavBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-xl transition-colors duration-200 cursor-pointer outline-none select-none z-20 relative"
      style={{
        color: hover ? "var(--color-text)" : "var(--color-text-muted)",
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

  // Swipe State
  const [touchStartLoc, setTouchStartLoc] = useState<{ x: number; y: number } | null>(null);
  const [touchEndLoc, setTouchEndLoc] = useState<{ x: number; y: number } | null>(null);

  const prevImg = useRef("");
  const event = timelineData[idx];

  const prev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : timelineData.length - 1)), []);
  const next = useCallback(() => setIdx((i) => (i < timelineData.length - 1 ? i + 1 : 0)), []);

  useEffect(() => {
    if (prevImg.current !== event.image) {
      setImgLoaded(false);
      prevImg.current = event.image;
    }
  }, [event.image]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Touch Handlers
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

    // Trigger only if horizontal swipe dominates vertical scroll
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx > 0) next();
      else prev();
    }
  };

  const pctRaw = cosmicPercentRaw(event);
  const pctLabel = cosmicPercent(event);

  return (
    <>
      {/* Lightweight local styles for fade transitions */}
      <style>{`
        @keyframes subtleSlideUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-content {
          animation: subtleSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-content-delayed {
          opacity: 0;
          animation: subtleSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
        }
      `}</style>

      <div className="w-full min-h-[100svh] flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 box-border pointer-events-none">
        
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="w-full max-w-[960px] mb-4 md:mb-6 flex flex-col gap-1 pointer-events-auto shrink-0">
          <h1
            className="text-2xl md:text-3xl tracking-tight m-0"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Story of Humanity
          </h1>
          <p
            className="text-[10px] md:text-xs tracking-widest m-0 uppercase opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            From the writings of Buckminster Fuller
          </p>
        </div>

        {/* ── Outer Card Wrapper ──────────────────────────────────────────── */}
        <div
          className="w-full max-w-[960px] flex flex-col shadow-2xl relative z-10 pointer-events-auto overflow-hidden"
          style={{
            background: "var(--color-surface)",
            height: "clamp(480px, 65svh, 560px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 100px rgba(0,0,0,0.5)",
          }}
        >
          {/* ── GLOBAL TIMELINE PROGRESS BAR (Spans 100% Width) ─────────── */}
          <div className="w-full h-1.5 md:h-2 bg-black/30 shrink-0 relative overflow-hidden z-20">
            {/* Event Markers (Ticks) */}
            {timelineData.map((ev, i) => (
              <div
                key={`marker-${i}`}
                className="absolute top-0 bottom-0 w-[1px] md:w-[2px] bg-white/40 z-10"
                style={{ left: `${cosmicPercentRaw(ev)}%` }}
              />
            ))}

            {/* Active Fill Bar */}
            <div
              className="absolute left-0 top-0 h-full ease-out transition-all duration-[800ms] z-0"
              style={{
                width: `${pctRaw}%`,
                background: "var(--color-progress)",
              }}
            />
          </div>

          {/* ── Inner Split Content ───────────────────────────────────────── */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex flex-col lg:flex-row flex-1 w-full relative overflow-hidden min-h-0"
          >
            {/* LEFT: Image Panel */}
            <div className="relative w-full h-[40%] lg:h-full lg:basis-[55%] overflow-hidden bg-black/80 shrink-0 select-none">
              <img
                src={event.image}
                alt={event.title}
                onLoad={() => setImgLoaded(true)}
                className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out"
                style={{ opacity: imgLoaded ? 0.85 : 0 }}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to top, var(--color-surface) 0%, transparent 75%)" }}
              />

              {/* Title Overlay with Fade Transition */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <h2
                  key={`title-${idx}`}
                  className="animate-content text-2xl md:text-3xl lg:text-4xl font-normal leading-tight tracking-tight m-0"
                  style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
                >
                  {event.title}
                </h2>
              </div>

              <div
                className="absolute top-4 left-5 md:top-6 md:left-8 text-[10px] tracking-widest font-mono"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {idx + 1} / {timelineData.length}
              </div>
            </div>

            {/* RIGHT: Content Panel */}
            <div className="flex-1 w-full h-[60%] lg:h-full flex flex-col relative overflow-hidden min-h-0 bg-[var(--color-surface)]">
              {/* Nav & Date/Percentage Row */}
              <div className="flex items-center justify-between pl-6 pr-4 py-3 md:pl-8 md:pr-6 md:py-4 shrink-0 border-b border-white/5 select-none">
                <div className="flex flex-col gap-1 md:gap-1.5 overflow-hidden pr-4">
                  <span
                    key={`pct-${idx}`}
                    className="animate-content text-xs md:text-sm font-mono tracking-wider leading-none truncate"
                    style={{ color: "var(--color-progress)" }}
                  >
                    {pctLabel}
                  </span>
                  <span
                    key={`date-${idx}`}
                    className="animate-content-delayed text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-mono leading-none truncate"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {formatDate(event)}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <NavBtn onClick={prev} label="Previous event">
                    ←
                  </NavBtn>
                  <NavBtn onClick={next} label="Next event">
                    →
                  </NavBtn>
                </div>
              </div>

              {/* Scrollable Text Area with Fade Transition */}
              <div
                key={`story-${idx}`}
                className="animate-content-delayed flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-8 scrollbar-matte"
              >
                <p
                  className="text-base md:text-lg lg:text-[1.25rem] mb-4 md:mb-5 leading-snug md:leading-[1.4]"
                  style={{
                    color: "var(--color-text-summary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {event.summary}
                </p>

                <p
                  className="text-[13px] md:text-[14px] leading-relaxed md:leading-loose whitespace-pre-line"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {event.story}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}