"use client";

import { useEffect } from "react";

interface OverlayTestProps {
  mapRef: React.RefObject<SVGSVGElement>;
}

export default function OverlayTest({ mapRef }: OverlayTestProps) {
  useEffect(() => {
    if (!mapRef.current) return;
    const svg = mapRef.current;

    // simple test: append a circle in the center of the map
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "480"); // center of 960 width
    circle.setAttribute("cy", "240"); // center of 480 height
    circle.setAttribute("r", "20");
    circle.setAttribute("fill", "rgba(255,100,100,0.6)");
    svg.appendChild(circle);

    // cleanup
    return () => {
      circle.remove();
    };
  }, [mapRef]);

  return null; // no DOM output needed
}
