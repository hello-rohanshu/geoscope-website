// components/earth-info.tsx

const EARTH = {
  age: "4.54B",
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

      <div className="hidden md:flex md:flex-col gap-x-4 gap-y-1 text-xs md:text-sm text-foreground">
        <p>
          <span className="font-semibold tabular-nums">{EARTH.age}</span> years old
        </p>
        <p>
          Rotating at <span className="font-semibold tabular-nums">{EARTH.rotation}</span>
        </p>
        <p>
          Orbiting Sol at <span className="font-semibold tabular-nums">{EARTH.orbit}</span>
        </p>
        <p>
          Galactic speed at <span className="font-semibold tabular-nums">{EARTH.galaxy}</span>
        </p>
      </div>
    </div>
  );
}