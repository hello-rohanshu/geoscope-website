// app/page.tsx
'use client';

import React from 'react';
import TimelineDesign from './components/timeline/timeline-design';
import TimelineCard from './components/timeline/timeline-card';

export default function HomePage() {
  return (
    <main className="bg-black min-h-screen text-white">
      {/* TIMELINE (main event) */}
      <section className="min-h-screen">
        <TimelineDesign />
      </section>

      {/* TIMELINE CARD (unused component preview) */}
      <section className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-semibold text-white/80">Timeline Card Preview</h2>
        <TimelineCard
          title="Dry Land Specialists"
          year={-3500}
          shortSummary="Humans thought of themselves as pedestrians and had no clue about the water separated lands."
          longSummary="Looking at the total historical pattern of man around the Earth and observing that three quarters of the Earth is water, it seems obvious why men, unaware that they would some day contrive to fly and penetrate the ocean in submarines, thought of themselves exclusively as pedestrians as dry land specialists."
          image="https://hicoop.b-cdn.net/wp-content/uploads/2019/09/cropped-Le_Moustier-1.jpg"
        />
        <TimelineCard
          title="Utopia or Oblivion?"
          year={2024}
          shortSummary="It is either for all or none."
          longSummary="This brings us to the realization of the enormous educational task that must be accomplished urgently — to convert humanity’s spin-dive toward oblivion into an intellectually mastered pullout into safe and level flight."
          image="https://saltandlighttv.org/blog/wp-content/uploads/2021/10/utopia-dystopia-blog.jpg"
        />
      </section>
    </main>
  );
}