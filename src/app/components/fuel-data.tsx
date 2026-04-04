// src/data/fuel-data.tsx

//--------------------------------------------------
// TIME SERIES
//--------------------------------------------------
export interface EnergyData {
  year: number;
  fossil: number | null;
  renewable: number | null;
}

export const energyData: EnergyData[] = [
  { year: 1800, fossil: 20, renewable: 0 },
  { year: 1810, fossil: 21, renewable: 0 },
  { year: 1820, fossil: 23, renewable: 0 },
  { year: 1830, fossil: 24, renewable: 0 },
  { year: 1840, fossil: 26, renewable: 0 },
  { year: 1850, fossil: 28, renewable: 0 },
  { year: 1860, fossil: 29, renewable: 0 },
  { year: 1870, fossil: 31, renewable: 0 },
  { year: 1880, fossil: 34, renewable: 0 },
  { year: 1890, fossil: 38, renewable: 0 },
  { year: 1900, fossil: 44, renewable: 0 },
  { year: 1910, fossil: 56, renewable: 0 },
  { year: 1920, fossil: 64, renewable: 0 },
  { year: 1930, fossil: 71, renewable: 0 },
  { year: 1940, fossil: 80, renewable: 0 },
  { year: 1950, fossil: 100, renewable: 0 },
  { year: 1960, fossil: 144, renewable: 0 },
  { year: 1965, fossil: 179, renewable: 0 },
  { year: 1966, fossil: 187, renewable: 0 },
  { year: 1967, fossil: 193, renewable: 0 },
  { year: 1968, fossil: 203, renewable: 0 },
  { year: 1969, fossil: 215, renewable: 0 },
  { year: 1970, fossil: 227, renewable: 0 },
  { year: 1971, fossil: 235, renewable: 0 },
  { year: 1972, fossil: 246, renewable: 0 },
  { year: 1973, fossil: 259, renewable: 0 },
  { year: 1974, fossil: 259, renewable: 0 },
  { year: 1975, fossil: 261, renewable: 0 },
  { year: 1976, fossil: 274, renewable: 0 },
  { year: 1977, fossil: 283, renewable: 1 },
  { year: 1978, fossil: 292, renewable: 1 },
  { year: 1979, fossil: 300, renewable: 1 },
  { year: 1980, fossil: 298, renewable: 1 },
  { year: 1981, fossil: 296, renewable: 1 },
  { year: 1982, fossil: 295, renewable: 1 },
  { year: 1983, fossil: 299, renewable: 1 },
  { year: 1984, fossil: 311, renewable: 1 },
  { year: 1985, fossil: 319, renewable: 1 },
  { year: 1986, fossil: 326, renewable: 1 },
  { year: 1987, fossil: 337, renewable: 1 },
  { year: 1988, fossil: 349, renewable: 1 },
  { year: 1989, fossil: 355, renewable: 2 },
  { year: 1990, fossil: 360, renewable: 2 },
  { year: 1991, fossil: 362, renewable: 2 },
  { year: 1992, fossil: 365, renewable: 2 },
  { year: 1993, fossil: 366, renewable: 2 },
  { year: 1994, fossil: 371, renewable: 2 },
  { year: 1995, fossil: 378, renewable: 2 },
  { year: 1996, fossil: 389, renewable: 2 },
  { year: 1997, fossil: 392, renewable: 2 },
  { year: 1998, fossil: 394, renewable: 3 },
  { year: 1999, fossil: 401, renewable: 3 },
  { year: 2000, fossil: 411, renewable: 3 },
  { year: 2001, fossil: 416, renewable: 3 },
  { year: 2002, fossil: 423, renewable: 3 },
  { year: 2003, fossil: 437, renewable: 4 },
  { year: 2004, fossil: 456, renewable: 4 },
  { year: 2005, fossil: 469, renewable: 5 },
  { year: 2006, fossil: 479, renewable: 5 },
  { year: 2007, fossil: 493, renewable: 6 },
  { year: 2008, fossil: 495, renewable: 8 },
  { year: 2009, fossil: 486, renewable: 9 },
  { year: 2010, fossil: 506, renewable: 10 },
  { year: 2011, fossil: 516, renewable: 12 },
  { year: 2012, fossil: 520, renewable: 13 },
  { year: 2013, fossil: 526, renewable: 15 },
  { year: 2014, fossil: 529, renewable: 17 },
  { year: 2015, fossil: 531, renewable: 19 },
  { year: 2016, fossil: 534, renewable: 21 },
  { year: 2017, fossil: 543, renewable: 24 },
  { year: 2018, fossil: 554, renewable: 27 },
  { year: 2019, fossil: 557, renewable: 30 },
  { year: 2020, fossil: 532, renewable: 33 },
  { year: 2021, fossil: 557, renewable: 38 },
  { year: 2022, fossil: 562, renewable: 43 },
  { year: 2023, fossil: 569, renewable: 48 },
  { year: 2024, fossil: 577, renewable: 54 },
];

export const energyTicks = energyData.map(d => d.year);

//--------------------------------------------------
// STOCKS
//--------------------------------------------------
export const fossilReserves = {
  totalEJ: 40_000,
  remainingEJ: 10_000,
};

export const renewablePotential = {
  totalEJ: 173_000,
};

//--------------------------------------------------
// DERIVED
//--------------------------------------------------
export const latestActual = energyData.reduce((a, b) =>
  b.year > a.year ? b : a
);

export const annualFlows = {
  fossilUseEJ: latestActual.fossil ?? 0,
  renewableUseEJ: latestActual.renewable ?? 0,
  renewablePotentialEJ: renewablePotential.totalEJ,
};

export const fossilYearsLeft =
  fossilReserves.remainingEJ / annualFlows.fossilUseEJ;

export const fuelPieData = [
  { name: "Fossil", value: annualFlows.fossilUseEJ, color: "#f97416b5" },
  { name: "Renewable", value: annualFlows.renewableUseEJ, color: "#16a34abb" }
];

export const fuelPieTotal = fuelPieData.reduce((n, e) => n + e.value, 0);

//--------------------------------------------------
// METADATA
//--------------------------------------------------
export interface Source {
  name: string;
  url: string;
  text?: string;
}

export interface PortalMetadata {
  sources: Source[];
  explanation: string;
}

export const fuelMetadata: Record<string, PortalMetadata> = {
  fossilReserves: {
    sources: [
      {
        name: "BP Statistical Review of World Energy",
        url: "https://www.bp.com/en/global/corporate/energy-economics/statistical-review-of-world-energy.html",
        text: "Primary annual dataset for global reserves, production, and consumption.",
      },
      {
        name: "IEA World Energy Outlook",
        url: "https://www.iea.org/reports/world-energy-outlook-2023",
        text: "Scenario-based projections including fossil decline pathways.",
      },
    ],
    explanation:
      "Fossil reserves represent the known remaining recoverable oil, gas, and coal.",
  },

  renewablePotential: {
    sources: [
      {
        name: "IRENA Renewable Energy Data",
        url: "https://www.irena.org/Statistics",
        text: "Global renewable generation and capacity trends.",
      },
      {
        name: "Global Energy Assessment",
        url: "https://www.iiasa.ac.at/web/home/research/Flagship-Projects/Global-Energy-Assessment.html",
        text: "Long-term technical potential of solar, wind, hydro, and biomass.",
      },
    ],
    explanation:
      "Renewable potential is the technically feasible annual energy supply from solar, wind, hydro and biomass.",
  },

  energyData: {
    sources: [
      {
        name: "Our World in Data (OWID)",
        url: "https://ourworldindata.org/energy",
        text: "Historical fossil and renewable energy consumption dataset.",
      },
    ],
    explanation:
      "Historical fossil and renewable energy data used for charts and derived metrics.",
  },
};
