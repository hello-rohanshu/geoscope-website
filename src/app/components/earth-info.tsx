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
      <h2 className="title-section">Spaceship Earth</h2>

      <dl className="flex flex-col gap-1 text-xs md:text-sm">
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
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}