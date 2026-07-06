import { normalizeDegrees } from "./util";
import { greenwichSiderealTimeDegrees, trueObliquity } from "./ephemeris";

const DEG = Math.PI / 180;

/**
 * Tropical ecliptic longitude of the Ascendant (Lagna), degrees 0-360.
 * Standard spherical-astronomy formula (Meeus, "Astronomical Algorithms", ch. 27),
 * resolved to the correct quadrant via atan2.
 */
export function tropicalAscendant(date: Date, latitude: number, longitudeEast: number): number {
  const gst = greenwichSiderealTimeDegrees(date);
  const ramc = normalizeDegrees(gst + longitudeEast); // local sidereal time, in degrees
  const eps = trueObliquity(date) * DEG;
  const phi = latitude * DEG;
  const theta = ramc * DEG;

  const y = -Math.cos(theta);
  const x = Math.sin(eps) * Math.tan(phi) + Math.cos(eps) * Math.sin(theta);
  const asc = Math.atan2(y, x) / DEG;
  return normalizeDegrees(asc);
}
