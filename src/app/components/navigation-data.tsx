// app/components/navigation-data.tsx

export type Level = { label: string; percent: number };

export type Tool = {
  name: string;
  levels: Level[];
  color: string;
};

export type NavTimePoint = {
  year: number;
  synergetics: number;
  worldGame: number;
  geoscope: number;
};

/**
 * Long-term engagement data.
 * - Dummy values for now.
 * - Future: replace with Google Trends or other APIs.
 * - Stored yearly, but chart components can aggregate (e.g. decade labels).
 */
export const navTimeData: NavTimePoint[] = [
  { year: 2004, synergetics: 3, worldGame: 2, geoscope: 1 },
  { year: 2005, synergetics: 5, worldGame: 3, geoscope: 2 },
  { year: 2006, synergetics: 7, worldGame: 5, geoscope: 4 },
  { year: 2007, synergetics: 9, worldGame: 6, geoscope: 6 },
  { year: 2008, synergetics: 10, worldGame: 8, geoscope: 7 },
  { year: 2009, synergetics: 8, worldGame: 10, geoscope: 9 },
  { year: 2010, synergetics: 6, worldGame: 11, geoscope: 8 },
  { year: 2011, synergetics: 4, worldGame: 9, geoscope: 6 },
  { year: 2012, synergetics: 2, worldGame: 7, geoscope: 5 },
  { year: 2013, synergetics: 1, worldGame: 5, geoscope: 3 },
  { year: 2014, synergetics: 3, worldGame: 4, geoscope: 2 },
  { year: 2015, synergetics: 5, worldGame: 6, geoscope: 4 },
  { year: 2016, synergetics: 7, worldGame: 8, geoscope: 6 },
  { year: 2017, synergetics: 9, worldGame: 10, geoscope: 7 },
  { year: 2018, synergetics: 11, worldGame: 9, geoscope: 9 },
  { year: 2019, synergetics: 10, worldGame: 7, geoscope: 8 },
  { year: 2020, synergetics: 8, worldGame: 5, geoscope: 6 },
  { year: 2021, synergetics: 6, worldGame: 4, geoscope: 4 },
  { year: 2022, synergetics: 4, worldGame: 6, geoscope: 2 },
  { year: 2023, synergetics: 2, worldGame: 8, geoscope: 1 },
  { year: 2024, synergetics: 1, worldGame: 10, geoscope: 3 },
  { year: 2025, synergetics: 100, worldGame: 100, geoscope: 100 },
];



export const tools: Tool[] = [
  {
    name: "Synergetics",
    levels: [
      { label: "Book", percent: 100 },
      { label: "Digital", percent: 0 },
      { label: "Lectures", percent: 100 },
    ],
    color: "#53d119ff",
  },
  {
    name: "World Game",
    levels: [
      { label: "Data", percent: 30 },
      { label: "Geoscope", percent: 20 },
      { label: "Platform", percent: 0 },
    ],
    color: "#3b82f6",
  },
  {
    name: "Geoscope",
    levels: [
      { label: "Digital", percent: 30 },
      { label: "Virtual Reality", percent: 10 },
      { label: "Physical", percent: 10 },
    ],
    color: "#c55622ff",
  },
];

// Always pick the latest year’s data for the radar chart
const latestYear = navTimeData[navTimeData.length - 1];

export const radarData = [
  { tool: "Synergetics", engagement: latestYear.synergetics },
  { tool: "World Game", engagement: latestYear.worldGame },
  { tool: "Geoscope", engagement: latestYear.geoscope },
];
