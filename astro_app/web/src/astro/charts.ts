import { PLANET_ORDER } from "./constants";
import { getAllTropicalLongitudes, julianDayUT } from "./ephemeris";
import { lahiriAyanamsa } from "./ayanamsa";
import { tropicalAscendant } from "./ascendant";
import { normalizeDegrees } from "./util";
import { IMPLEMENTED_VARGAS, computeVarga } from "./varga";
import type { BirthInput, ChartResult, PlanetPosition } from "./types";

const NAKSHATRA_SPAN = 360 / 27;

/** Resolves the birth-local wall-clock time + fixed UTC offset into a true UTC instant. */
export function birthInputToUtcDate(input: BirthInput): Date {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);
  const localAsUtcMillis = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(localAsUtcMillis - input.timezoneOffsetHours * 60 * 60 * 1000);
}

export function computeChart(input: BirthInput): ChartResult {
  const birthUtc = birthInputToUtcDate(input);
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
