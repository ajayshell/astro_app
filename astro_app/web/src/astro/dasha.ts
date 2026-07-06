import {
  VIMSHOTTARI_ORDER,
  VIMSHOTTARI_YEARS,
  VIMSHOTTARI_TOTAL_YEARS,
} from "./constants";
import type { PlanetName } from "./constants";

const NAKSHATRA_SPAN = 360 / 27;
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export interface DashaPeriod {
  lord: PlanetName;
  start: Date;
  end: Date;
  antardashas: DashaPeriod[];
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

export function moonNakshatraIndex(moonSiderealLongitude: number): number {
  return Math.floor(moonSiderealLongitude / NAKSHATRA_SPAN) % 27;
}

function buildAntardashas(lord: PlanetName, start: Date, end: Date): DashaPeriod[] {
  const mahaDurationYears = (end.getTime() - start.getTime()) / MS_PER_YEAR;
  const startIndex = VIMSHOTTARI_ORDER.indexOf(lord);
  const antardashas: DashaPeriod[] = [];
  let cursor = start;
  for (let i = 0; i < 9; i++) {
    const antarLord = VIMSHOTTARI_ORDER[(startIndex + i) % 9];
    const antarYears = mahaDurationYears * (VIMSHOTTARI_YEARS[antarLord] / VIMSHOTTARI_TOTAL_YEARS);
    const antarEnd = addYears(cursor, antarYears);
    antardashas.push({ lord: antarLord, start: cursor, end: antarEnd, antardashas: [] });
    cursor = antarEnd;
  }
  return antardashas;
}

/**
 * Vimshottari mahadasha sequence (with nested antardashas) starting at birth.
 * `cycles` controls how many full 120-year sweeps of the 9-lord cycle to generate
 * (1 is enough to cover a lifetime; the first mahadasha is a partial balance
 * based on how far the Moon had already moved through its birth nakshatra).
 */
export function computeVimshottariDasha(
  moonSiderealLongitude: number,
  birthDate: Date,
  cycles = 1,
): DashaPeriod[] {
  const nakIndex = moonNakshatraIndex(moonSiderealLongitude);
  const withinNakshatra = moonSiderealLongitude % NAKSHATRA_SPAN;
  const remainingFraction = 1 - withinNakshatra / NAKSHATRA_SPAN;
  const startLordIndex = nakIndex % 9;

  const periods: DashaPeriod[] = [];
  let cursor = birthDate;

  const firstLord = VIMSHOTTARI_ORDER[startLordIndex];
  const firstYears = VIMSHOTTARI_YEARS[firstLord] * remainingFraction;
  const firstEnd = addYears(cursor, firstYears);
  periods.push({
    lord: firstLord,
    start: cursor,
    end: firstEnd,
    antardashas: buildAntardashas(firstLord, cursor, firstEnd),
  });
  cursor = firstEnd;

  const totalMahadashas = 9 * cycles;
  for (let i = 1; i < totalMahadashas; i++) {
    const lord = VIMSHOTTARI_ORDER[(startLordIndex + i) % 9];
    const years = VIMSHOTTARI_YEARS[lord];
    const end = addYears(cursor, years);
    periods.push({ lord, start: cursor, end, antardashas: buildAntardashas(lord, cursor, end) });
    cursor = end;
  }

  return periods;
}
