import EnergyCardv1 from "./EnergyCardv1";
import EnergyCardv2 from "./EnergyCardv2";
import EnergyCardv2_1 from "./EnergyCardv2_1";
import EnergyCardv3 from "./EnergyCardv3";
import EnergyCardv1_1 from "./EnergyCardv1_1";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="space-y-16 py-16 px-6">
        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">EnergyCardv1</h2>
          <EnergyCardv1 />
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">EnergyCardv1_1</h2>
          <EnergyCardv1_1 />
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">EnergyCardv2</h2>
          <EnergyCardv2 />
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">EnergyCardv2_1</h2>
          <EnergyCardv2_1 />
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">EnergyCardv3</h2>
          <EnergyCardv3 />
        </section>
      </div>
    </main>
  );
}