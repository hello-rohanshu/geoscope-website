// components/earth-info.tsx

const EARTH = {
  age: "4.54B yrs",
  rotation: "1,670 km/h",
  orbit: "107,000 km/h",
  galaxy: "828,000 km/h",
};

export default function EarthInfo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 text-left select-none pointer-events-none ${className}`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-mono tracking-widest opacity-60 text-[var(--color-text-muted)]">
          // TELEMETRY
        </span>
        <h2
          className="text-lg md:text-xl font-semibold tracking-wide"
          style={{
            color: "var(--color-header-text)",
            textShadow:
              "0 0 20px rgba(255,255,255,0.25), 0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          Spaceship Earth
        </h2>
      </div>

      <dl
        className="flex flex-col gap-2 text-xs md:text-sm font-mono"
        style={{
          color: "var(--color-text)",
          textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.8)",
        }}
      >
        <Row label="Age" value={EARTH.age} />
        <Row label="Rotation" value={EARTH.rotation} />
        <Row label="Orbit (Sol)" value={EARTH.orbit} />
        <Row label="Galactic" value={EARTH.galaxy} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1">
      <dt className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </dt>
      <dd className="font-medium tabular-nums text-white/90">{value}</dd>
    </div>
  );
}