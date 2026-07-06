import { normalizeDegrees } from "./util";

const J2000_JD = 2451545.0;
// Lahiri (Chitrapaksha) ayanamsa at J2000.0, in degrees, and its approximate
// linear drift rate. Anchored to the commonly published reference values
// (~22.4639 deg on 1900-01-01, ~23.8531 deg on 2000-01-01).
//
// NOTE: this is a linear approximation, not the full precession + nutation
// model used by Swiss Ephemeris. It is accurate to within roughly an arcminute
// over the last two centuries, which is fine for a first pass, but the
// astrologer should cross-check a handful of known charts against this before
// it's relied on. Swapping this for a Swiss Ephemeris-backed value later is a
// contained change (only this file).
const LAHIRI_AT_J2000 = 23.8531;
const LAHIRI_RATE_PER_YEAR = 0.013972;

export function lahiriAyanamsa(julianDayUT: number): number {
  const years = (julianDayUT - J2000_JD) / 365.25;
  return normalizeDegrees(LAHIRI_AT_J2000 + years * LAHIRI_RATE_PER_YEAR);
}
