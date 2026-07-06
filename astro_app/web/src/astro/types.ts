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
