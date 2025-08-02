'use client'
import SpinningEarth from './components/SpinningEarth'
import PopulationCard from './components/PopulationCard'
import EnergyCard from './components/EnergyCard'
import HumanPhysicalNeedsCard from './components/HumanPhysicalNeedsCard'


export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="w-full">
        <SpinningEarth />
      </div>

      <div className="p-10 flex flex-col gap-6 items-start">
        <PopulationCard />
        <EnergyCard />
        <HumanPhysicalNeedsCard />
      </div>

      <style jsx>{`
        @keyframes shine-down {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes shine-up {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </main>
  )
}
