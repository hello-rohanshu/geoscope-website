// components/SolarSystemEmbed.tsx
import React from "react";

interface SolarSystemEmbedProps {
  width?: number | string;
  height?: number | string;
  borderColor?: string;
}

const SolarSystemEmbed: React.FC<SolarSystemEmbedProps> = ({
  width = 500,
  height = 400,
  borderColor = "#0f5c6e",
}) => {
  return (
    <iframe
      src="https://www.solarsystemscope.com/iframe"
      width={width}
      height={height}
      style={{
        minWidth: typeof width === "number" ? `${width}px` : width,
        minHeight: typeof height === "number" ? `${height}px` : height,
        border: `2px solid ${borderColor}`,
      }}
      allowFullScreen
      loading="lazy"
      title="Solar System Scope"
    ></iframe>
  );
};

export default SolarSystemEmbed;
