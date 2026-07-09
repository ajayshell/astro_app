import { PLANET_ORDER } from "./constants";
import { getAllTropicalLongitudes, julianDayUT } from "./ephemeris";
import { lahiriAyanamsa } from "./ayanamsa";
import { tropicalAscendant } from "./ascendant";
import { localWallClockToUtc, normalizeDegrees } from "./util";
import { IMPLEMENTED_VARGAS, computeVarga } from "./varga";
import type { VargaKind } from "./varga";
import type { BirthInput, ChartResult, PlanetPosition, PlanetSlot } from "./types";

const NAKSHATRA_SPAN = 360 / 27;

export function computeChart(input: BirthInput): ChartResult {
  const birthUtc = localWallClockToUtc(input.date, input.time, input.timezoneOffsetHours);
  const jd = julianDayUT(birthUtc);
  const ayanamsa = lahiriAyanamsa(jd);

  const tropicalAsc = tropicalAscendant(birthUtc, input.latitude, input.longitude);
  const ascendantSiderealLongitude = normalizeDegrees(tropicalAsc - ayanamsa);
  const ascendantRasi = Math.floor(ascendantSiderealLongitude / 30) % 12;

  const rawLongitudes = getAllTropicalLongitudes(birthUtc);

  const planets: PlanetPosition[] = rawLongitudes.map(({ planet, tropicalLongitude, isRetrograde }) => {
    const siderealLongitude = normalizeDegrees(tropicalLongitude - ayanamsa);
    const rasi = Math.floor(siderealLongitude / 30) % 12;
    const nakshatra = Math.floor(siderealLongitude / NAKSHATRA_SPAN) % 27;
    const withinNakshatra = siderealLongitude % NAKSHATRA_SPAN;
    const nakshatraPada = Math.floor(withinNakshatra / (NAKSHATRA_SPAN / 4)) + 1;

    const vargas: Record<string, number> = {};
    for (const kind of IMPLEMENTED_VARGAS) {
      vargas[kind] = computeVarga(kind, siderealLongitude);
    }

    return { planet, siderealLongitude, rasi, nakshatra, nakshatraPada, isRetrograde, vargas };
  });

  planets.sort((a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet));

  return { birthUtc, julianDayUT: jd, ayanamsa, ascendantSiderealLongitude, ascendantRasi, planets };
}

/** Whole-sign house number (1-12) for a given rasi index, given the ascendant's rasi. */
export function houseOfRasi(rasi: number, ascendantRasi: number): number {
  return ((rasi - ascendantRasi + 12) % 12) + 1;
}

export type PlacementMap = Record<number, PlanetSlot[]>;

/** Groups a chart's planets by rasi (for D1) or by their varga placement, for chart rendering. */
export function buildPlacementMap(chart: ChartResult, vargaKind: VargaKind): PlacementMap {
  const map: PlacementMap = {};
  for (const p of chart.planets) {
    const rasi = vargaKind === "D1" ? p.rasi : p.vargas[vargaKind];
    map[rasi] = map[rasi] ?? [];
    map[rasi].push({ planet: p.planet, isRetrograde: p.isRetrograde, siderealLongitude: p.siderealLongitude });
  }
  return map;
}

/**
 * Transit ("Gochara") chart: current planetary sidereal positions, computed
 * for right now at the natal place. Location doesn't change planet
 * longitudes, only the (unused-here) ascendant -- transit planets are
 * conventionally read against the natal houses, not a fresh ascendant.
 */
export function computeTransitChart(referenceInput: BirthInput, now: Date = new Date()): ChartResult {
  const pad = (n: number) => String(n).padStart(2, "0");
  const nowInput: BirthInput = {
    name: referenceInput.name,
    date: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
    time: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`,
    latitude: referenceInput.latitude,
    longitude: referenceInput.longitude,
    timezoneOffsetHours: 0,
  };
  return computeChart(nowInput);
}
