import {
  VIMSHOTTARI_ORDER,
  VIMSHOTTARI_YEARS,
  VIMSHOTTARI_TOTAL_YEARS,
} from "./constants";
import type { PlanetName } from "./constants";

const NAKSHATRA_SPAN = 360 / 27;
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

// 0 = Dasha (Mahadasha), 1 = Bhukti (Antardasha), 2 = Antharam (Pratyantardasha).
const MAX_DEPTH = 2;

export interface DashaPeriod {
  lord: PlanetName;
  start: Date;
  end: Date;
  subPeriods: DashaPeriod[];
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

export function moonNakshatraIndex(moonSiderealLongitude: number): number {
  return Math.floor(moonSiderealLongitude / NAKSHATRA_SPAN) % 27;
}

/**
 * Builds the 9-lord cycle of sub-periods within [start, end], each lasting a
 * proportional share of the parent span (same rule at every level: Bhukti
 * within a Dasha, Antharam within a Bhukti). Recurses down to `MAX_DEPTH`.
 */
function buildSubPeriods(lord: PlanetName, start: Date, end: Date, depth: number): DashaPeriod[] {
  const durationYears = (end.getTime() - start.getTime()) / MS_PER_YEAR;
  const startIndex = VIMSHOTTARI_ORDER.indexOf(lord);
  const periods: DashaPeriod[] = [];
  let cursor = start;
  for (let i = 0; i < 9; i++) {
    const subLord = VIMSHOTTARI_ORDER[(startIndex + i) % 9];
    const subYears = durationYears * (VIMSHOTTARI_YEARS[subLord] / VIMSHOTTARI_TOTAL_YEARS);
    const subEnd = addYears(cursor, subYears);
    periods.push({
      lord: subLord,
      start: cursor,
      end: subEnd,
      subPeriods: depth < MAX_DEPTH ? buildSubPeriods(subLord, cursor, subEnd, depth + 1) : [],
    });
    cursor = subEnd;
  }
  return periods;
}

/**
 * Vimshottari Dasha sequence (with nested Bhukti and Antharam) starting at
 * birth. `cycles` controls how many full 120-year sweeps of the 9-lord cycle
 * to generate (1 is enough to cover a lifetime; the first Dasha is a partial
 * balance based on how far the Moon had already moved through its birth
 * nakshatra).
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
    subPeriods: buildSubPeriods(firstLord, cursor, firstEnd, 1),
  });
  cursor = firstEnd;

  const totalMahadashas = 9 * cycles;
  for (let i = 1; i < totalMahadashas; i++) {
    const lord = VIMSHOTTARI_ORDER[(startLordIndex + i) % 9];
    const years = VIMSHOTTARI_YEARS[lord];
    const end = addYears(cursor, years);
    periods.push({ lord, start: cursor, end, subPeriods: buildSubPeriods(lord, cursor, end, 1) });
    cursor = end;
  }

  return periods;
}
