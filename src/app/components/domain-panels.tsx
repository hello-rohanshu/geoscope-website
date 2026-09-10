"use client";

import React from "react";

interface DomainPanel {
  mainTitle: string;
  secondaryHeading: string;
  href: string;
}

const domainPanelsData: DomainPanel[] = [
  { mainTitle: "Earth Systems", secondaryHeading: "Fuel system", href: "/earth-systems" },
  { mainTitle: "Culture", secondaryHeading: "Crew Harmony", href: "/culture" },
  { mainTitle: "Standard of life", secondaryHeading: "Life Support", href: "/standard-of-life" },
  { mainTitle: "Science", secondaryHeading: "Navigation", href: "/science" },
];

export const DomainPanels: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 pointer-events-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {domainPanelsData.map((card, idx) => (
          <a
            key={idx}
            href={card.href}
            className="group aspect-square w-full flex flex-col justify-between p-5 md:p-6 rounded-none outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] cursor-pointer select-none"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--color-shadow)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-surface-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-surface)";
            }}
          >
            {/* Header: Secondary Tag & Link Indicator */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-overline font-medium truncate">
                {card.secondaryHeading}
              </span>
              <span
                className="text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                ↗
              </span>
            </div>

            {/* Placeholder Area for Future Data */}
            <div
              className="my-auto w-full h-1/2 flex items-center justify-center opacity-40 transition-opacity group-hover:opacity-75"
              style={{ background: "var(--color-progress-track)" }}
            >
              <span
                className="text-xs uppercase tracking-widest font-mono"
                style={{ color: "var(--color-text-muted)" }}
              >
                [ Data Pending ]
              </span>
            </div>

            {/* Footer: Main Title */}
            <div>
              <h3
                className="text-lg md:text-xl font-semibold tracking-tight transition-colors duration-200 m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)",
                }}
              >
                {card.mainTitle}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DomainPanels;