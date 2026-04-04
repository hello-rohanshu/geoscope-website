// src/data/metadata-index.ts
import { fuelMetadata } from "./fuel-data";

export const metadataIndex = {
  ...fuelMetadata,
  fuel: {
    sources: [
      ...fuelMetadata.fossilReserves.sources,
      ...fuelMetadata.renewablePotential.sources,
      ...fuelMetadata.energyData.sources,
    ],
    explanation: "Combined overview of fossil, renewable, and historical energy data.",
  },
};

export type MetadataKey = keyof typeof metadataIndex;
