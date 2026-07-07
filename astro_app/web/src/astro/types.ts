import type { PlanetName } from "./constants";

export interface BirthInput {
  name: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm", 24h, local time at the birth place
  latitude: number;
  longitude: number; // east positive
  timezoneOffsetHours: number; // e.g. 5.5 for IST, resolved from the place + date
  timezoneName?: string;
  placeName?: string;
}

export interface PlanetSlot {
  planet: PlanetName;
  isRetrograde: boolean;
  // Natal (D1) sidereal longitude. Divisional charts don't carry their own
  // fractional degree in this model (a varga only resolves to a sign), so
  // this is shown alongside varga/transit placements too, as a reference to
  // the underlying birth data rather than a position within that chart.
  siderealLongitude: number;
}

export interface PlanetPosition {
  planet: PlanetName;
  siderealLongitude: number;
  rasi: number;
  nakshatra: number;
  nakshatraPada: number;
  isRetrograde: boolean;
  vargas: Record<string, number>; // varga kind (e.g. "D9") -> rasi index
}

export interface ChartResult {
  birthUtc: Date;
  julianDayUT: number;
  ayanamsa: number;
  ascendantSiderealLongitude: number;
  ascendantRasi: number;
  planets: PlanetPosition[];
}
