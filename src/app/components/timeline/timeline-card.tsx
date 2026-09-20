'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TimelineCardProps {
  title: string;
  description?: string; // fallback
  shortSummary?: string;
  longSummary?: string;
  year?: number;
  range?: [number, number];
  image?: string;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  title,
  description,
  shortSummary,
  longSummary,
  year,
  range,
  image,
}) => {
  const displayedYear = range
    ? `${range[0]} – ${range[1]}`
    : year
    ? year.toString()
    : '';

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto flex flex-col items-center gap-6 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.4)]"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Decorative faint glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Year or Range */}
      {displayedYear && (
        <div className="relative z-10 text-xs tracking-widest text-blue-300/90 uppercase font-medium">
          {displayedYear}
        </div>
      )}

      {/* Title */}
      <h2 className="relative z-10 text-2xl md:text-3xl font-semibold text-white text-center leading-snug">
        {title}
      </h2>

      {/* Short Summary */}
      {shortSummary && (
        <p className="relative z-10 text-lg text-white/90 italic text-center leading-snug max-w-2xl">
          {shortSummary}
        </p>
      )}

      {/* Image (optional) */}
      {image && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}

      {/* Divider */}
      {(longSummary || description) && (
        <div className="border-t border-white/10 w-full max-w-xl my-2" />
      )}

      {/* Long Description */}
      {(longSummary || description) && (
        <div className="relative z-10 text-base text-gray-300 text-center leading-relaxed space-y-3 max-w-2xl">
          {(longSummary || description)
            .split('•')
            .filter(Boolean)
            .map((line, i) => (
              <p key={i}>{line.trim()}</p>
            ))}
        </div>
      )}
    </motion.div>
  );
};

export default TimelineCard;
