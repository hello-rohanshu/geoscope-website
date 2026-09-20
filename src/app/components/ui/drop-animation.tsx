"use client";

import React, { useEffect, useState } from "react";

type DropAnimationProps = {
  interval: number; // seconds per drop
  color: string;
};

export const DropAnimation: React.FC<DropAnimationProps> = ({
  interval,
  color,
}) => {
  const [phase, setPhase] = useState<"forming" | "falling">("forming");
  const [key, setKey] = useState(0);

  useEffect(() => {
    let formTimer: NodeJS.Timeout;
    let fallTimer: NodeJS.Timeout;

    const startCycle = () => {
      setPhase("forming");

      // After interval seconds → start falling
      formTimer = setTimeout(() => {
        setPhase("falling");

        // After fall ends (~1.5s) → reset
        fallTimer = setTimeout(() => {
          setKey((k) => k + 1);
          startCycle(); // loop again
        }, 1500);
      }, interval * 1000);
    };

    startCycle();

    return () => {
      clearTimeout(formTimer);
      clearTimeout(fallTimer);
    };
  }, [interval]);

  return (
    <div className="relative w-full h-full flex items-start justify-center overflow-hidden">
      <div
        key={key}
        className="absolute w-3 h-3 rounded-full"
        style={{
          backgroundColor: color,
          animation:
            phase === "forming"
              ? `drop-form ${interval}s linear forwards`
              : `drop-fall 1.5s linear forwards`,
        }}
      />
      <style jsx>{`
        @keyframes drop-form {
          0% {
            transform: translateY(-100%); /* hidden above ceiling */
          }
          100% {
            transform: translateY(-40%); /* half visible */
          }
        }

        @keyframes drop-fall {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(100vh); /* fall to bottom of container */
          }
        }
      `}</style>
    </div>
  );
};
