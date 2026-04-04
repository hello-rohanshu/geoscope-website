// components/NasaSolarEmbed.tsx
import React from "react";

interface NasaSolarEmbedProps {
  width?: number | string;
  height?: number | string;
}

const NasaSolarEmbed: React.FC<NasaSolarEmbedProps> = ({
  width = "100%",
  height = "600px",
}) => {
  return (
    <iframe
      src="https://eyes.nasa.gov/apps/solar-system/#/earth?featured=false&detailPanel=false&logo=false&search=false&shareButton=false&menu=false&collapseSettingsOptions=true&hideExternalLinks=true"
      width={width}
      height={height}
      style={{ border: "0", minWidth: "300px", minHeight: "300px" }}
      allowFullScreen
      loading="lazy"
      title="NASA Eyes on Earth"
    ></iframe>
  );
};

export default NasaSolarEmbed;
