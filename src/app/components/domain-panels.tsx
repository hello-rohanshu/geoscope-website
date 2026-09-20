import React from 'react';

interface Domain {
  id: string;
  title: string;
}

const DOMAINS: Domain[] = [
  { id: '01', title: 'Fuel system' },
  { id: '02', title: 'Crew harmony' },
  { id: '03', title: 'Standard of life' },
  { id: '04', title: 'Navigation' },
];

export const DomainPanels: React.FC = () => {
  return (
    <div className="relative w-full min-h-[80vh] flex flex-col justify-center py-4 sm:py-8 m-0 p-0">
      {/* Left-aligned Header */}
      <div className="w-full mb-6 sm:mb-8">
        <h1 className="title-section text-[var(--color-header-text)]">
          Dashboard
        </h1>
      </div>

      {/* Panels Container - Full Horizontal Width */}
      <div className="relative w-full">
        {/* Subtle Blur Overlay */}
        <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-[var(--color-bg)]/20 flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--color-surface-elevated)] text-yellow-400 font-[var(--font-mono)] text-xs sm:text-sm uppercase tracking-wider px-5 py-2.5">
            🚧 work in progress
          </div>
        </div>

        {/* 2x2 Responsive Full-Width Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 md:gap-12 w-full">
          {DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="bg-[var(--color-surface)] p-6 sm:p-8 min-h-[140px] sm:min-h-[180px] md:min-h-[220px] flex flex-col justify-between"
            >
              <span className="font-[var(--font-mono)] text-[10px] sm:text-xs text-[var(--color-text-muted)]">
                {domain.id}
              </span>
              <h3 className="title-card text-base sm:text-lg lg:text-xl font-normal text-[var(--color-text)]">
                {domain.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DomainPanels;