// app/page.tsx
'use client';

import NasaSolarEmbed from "./components/solar-system-nasa-embed";
import PopulationCard from "./components/population-card-v1";
import SolarSystemEmbed from "./components/solar-system-scope-embed";
import EnergyAlternative from "./components/trash/fuel-gauge-broad-mockup";
import HumanNeedsTrajectoryCard from "./components/trash/life-support-varied-mockup";
import EnergyTrajectoryCard from "./components/archived/fuel-gauge-sharp-kanit";
import EnergyCard from "./components/archived/EnergyCardv1";


export default function Page() {
  return (
    <main className="flex flex-col gap-4 p-8 font-sans">
      <h1 className="text-2xl font-bold">Testing Page</h1>

      {/* Insert your divs here */}
      <div className="p-4 bg-gray-100 border border-gray-300">
        <SolarSystemEmbed/>
        <NasaSolarEmbed/>
<EnergyCard/>
      </div>

      <div className="p-4 bg-indigo-100 border border-indigo-300">
        Example Div 2
      </div>

      <div className="p-4 bg-red-100 border border-red-300">
        Example Div 3
      </div>
    </main>
  );
}
