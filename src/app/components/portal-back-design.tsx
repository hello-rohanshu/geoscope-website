// src/components/portal-back-design.tsx

"use client";

import React from "react";
import { metadataIndex } from "./metadata-index";

export interface PortalBackProps {
  metadataKey?: keyof typeof metadataIndex;
  title?: string; // kept for type compatibility
  onFlipBack?: () => void;
}

export default function PortalCardBack({ metadataKey, title, onFlipBack }: PortalBackProps) {
  const meta = metadataKey ? metadataIndex[metadataKey] : undefined;
  const sources = meta?.sources ?? [];

  return (
    <div className="flex flex-col h-full w-full bg-white/5 backdrop-blur border border-white/20 rounded-xl p-5 font-manrope text-white relative">
      
      {/* Back arrow matches front info button placement */}
      {onFlipBack && (
        <button
          className="absolute top-5 right-5 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 rounded-full transition-all duration-200"
          onClick={onFlipBack}
        >
          <span className="text-base leading-none pb-[0.5]">←</span>
        </button>
      )}

      {/* Sources */}
      <div className="flex flex-col flex-1 mt-2 overflow-hidden">
        <h3 className="text-2xl font-semibold mb-2">{`Sources`}</h3>
        <div className="flex-1 overflow-y-auto scrollbar-custom pr-2">
          {sources.length === 0 ? (
            <p className="text-white/50 italic text-xs">No sources provided.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sources.map((src, i) => (
                <li
                  key={i}
                  className="flex flex-col p-3 bg-white/5 rounded-md border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <p className="font-medium truncate">{src.name}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    className="text-white/70 underline hover:text-white transition-colors break-words text-[0.65rem]"
                  >
                    {src.url}
                  </a>
                  {src.text && (
                    <p className="text-white/50 mt-1 text-[0.65rem]">{src.text}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
