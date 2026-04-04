// ---------------------- population-data.tsx ----------------------

export interface PopulationPoint {
  year: number
  population: number // total population that year
}

// Historical + near-present data (1950–2025)
export const populationData: PopulationPoint[] = [
  { year: 1950, population: 2530000000 },
  { year: 1960, population: 3030000000 },
  { year: 1970, population: 3700000000 },
  { year: 1980, population: 4450000000 },
  { year: 1990, population: 5300000000 },
  { year: 2000, population: 6100000000 },
  { year: 2010, population: 6900000000 },
  { year: 2020, population: 7600000000 },
  { year: 2025, population: 8100000000 },
]

// ---------------------- Live Counters ----------------------
// These rates are approximations based on global averages.
// (They can be replaced later with dynamic sources if desired.)

export const populationNow = 8_150_000_000 // as of 2025
export const birthsPerSecond = 4.3
export const deathsPerSecond = 2.0

// ---------------------- Derived Metrics ----------------------

export const netGrowthPerSecond = birthsPerSecond - deathsPerSecond

export const birthsPerMinute = birthsPerSecond * 60
export const deathsPerMinute = deathsPerSecond * 60
export const netGrowthPerMinute = netGrowthPerSecond * 60

export const birthsPerHour = birthsPerMinute * 60
export const deathsPerHour = deathsPerMinute * 60
export const netGrowthPerHour = netGrowthPerMinute * 60

export const birthsPerDay = birthsPerHour * 24
export const deathsPerDay = deathsPerHour * 24
export const netGrowthPerDay = netGrowthPerHour * 24

export const birthsPerYear = birthsPerDay * 365
export const deathsPerYear = deathsPerDay * 365
export const netGrowthPerYear = netGrowthPerDay * 365

// Helper function for toggling units
export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'year'

export function getRates(unit: TimeUnit) {
  switch (unit) {
    case 'minute':
      return { births: birthsPerMinute, deaths: deathsPerMinute, net: netGrowthPerMinute }
    case 'hour':
      return { births: birthsPerHour, deaths: deathsPerHour, net: netGrowthPerHour }
    case 'day':
      return { births: birthsPerDay, deaths: deathsPerDay, net: netGrowthPerDay }
    case 'year':
      return { births: birthsPerYear, deaths: deathsPerYear, net: netGrowthPerYear }
    default:
      return { births: birthsPerSecond, deaths: deathsPerSecond, net: netGrowthPerSecond }
  }
}
