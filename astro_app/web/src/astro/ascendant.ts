import { normalizeDegrees } from "./util";
import { greenwichSiderealTimeDegrees, trueObliquity } from "./ephemeris";

const DEG = Math.PI / 180;

/**
 * Tropical ecliptic longitude of the Ascendant (Lagna), degrees 0-360.
 * Standard spherical-astronomy formula (Meeus, "Astronomical Algorithms", ch. 27).
 *
 * The raw atan2(y, x) solution below the underlying tan(Asc) identity resolves
 * to the correct quadrant's *line* but not reliably to the Ascendant over the
 * Descendant (the two are 180 degrees apart and both satisfy tan(Asc) = y/x).
 * This was caught against a real chart (1979-06-29 08:21 IST, Bengaluru):
 * the astrologer placed Lagna where this code was instead placing the 7th
 * house cusp -- a clean, input-independent 180 degree flip. The `+ 180` below
 * corrects it; verify against a couple more known charts if possible.
 */
export function tropicalAscendant(date: Date, latitude: number, longitudeEast: number): number {
  const gst = greenwichSiderealTimeDegrees(date);
  const ramc = normalizeDegrees(gst + longitudeEast); // local sidereal time, in degrees
  const eps = trueObliquity(date) * DEG;
  const phi = latitude * DEG;
  const theta = ramc * DEG;

  const y = -Math.cos(theta);
  const x = Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(theta);
  const asc = Math.atan2(y, x) / DEG + 180;
  return normalizeDegrees(asc);
}
