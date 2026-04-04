import React from "react";

const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

const EnergyAlternative: React.FC = () => {
  // Dummy numbers
  const reservesPercent = 65;
  const usage = 30;
  const regen = 20;

  // Normalize speeds for animation duration (lower duration = faster pulse)
  const usageSpeed = clamp(5 - usage / 50, 0.5, 5);
  const net = regen - usage;
  const netSpeed = clamp(5 - Math.abs(net) / 50, 0.5, 5);

  return (
    <div className="w-20 h-48 relative bg-gray-800 rounded-md border border-gray-700 overflow-hidden select-none">
      {/* Battery Fill */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-yellow-400 transition-all duration-500"
        style={{ height: `${clamp(reservesPercent, 0, 100)}%` }}
      />

      {/* Usage Pulse - red, moves down */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,0,0,0.3) 25%, transparent 50%, rgba(255,0,0,0.3) 75%)",
          backgroundSize: "100% 200%",
          animation: `pulseDown ${usageSpeed}s linear infinite`,
        }}
      />

      {/* Net Pulse - green if net positive, red if negative */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            net >= 0
              ? "linear-gradient(0deg, rgba(0,255,0,0.3) 25%, transparent 50%, rgba(0,255,0,0.3) 75%)"
              : "linear-gradient(180deg, rgba(255,0,0,0.3) 25%, transparent 50%, rgba(255,0,0,0.3) 75%)",
          backgroundSize: "100% 200%",
          animation:
            net >= 0
              ? `pulseUp ${netSpeed}s linear infinite`
              : `pulseDown ${netSpeed}s linear infinite`,
        }}
      />

      {/* Labels */}
      <div className="absolute bottom-1 left-1 right-1 text-xs text-white text-center font-mono select-text">
        <div>Reserves: {reservesPercent.toFixed(0)}%</div>
        <div>Usage: {usage}</div>
        <div>Net: {net >= 0 ? "+" : ""}
          {net.toFixed(1)}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseDown {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }
        @keyframes pulseUp {
          0% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergyAlternative;
