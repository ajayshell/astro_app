import * as Astronomy from "astronomy-engine";
import type { PlanetName } from "./constants";
import { normalizeDegrees } from "./util";

const BODY_MAP: Partial<Record<PlanetName, Astronomy.Body>> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mars: Astronomy.Body.Mars,
  Mercury: Astronomy.Body.Mercury,
  Jupiter: Astronomy.Body.Jupiter,
  Venus: Astronomy.Body.Venus,
  Saturn: Astronomy.Body.Saturn,
};

/**
 * Apparent geocentric tropical ecliptic longitude (degrees, 0-360) of date equinox.
 *
 * NOTE: astronomy-engine's `EclipticLongitude()` returns the HELIOCENTRIC longitude
 * (as seen from the Sun), which is not what astrology needs. For planets we instead
 * take the geocentric equatorial vector (`GeoVector`, aberration-corrected) and rotate
 * it to true ecliptic-of-date via `Ecliptic()`. The Sun and Moon have dedicated
 * geocentric functions.
 */
function tropicalLongitudeOf(planet: PlanetName, date: Date): number {
  if (planet === "Moon") {
    return normalizeDegrees(Astronomy.EclipticGeoMoon(date).lon);
  }
  if (planet === "Sun") {
    return normalizeDegrees(Astronomy.SunPosition(date).elon);
  }
  const body = BODY_MAP[planet];
  if (!body) throw new Error(`No ephemeris body mapped for ${planet}`);
  const geoVector = Astronomy.GeoVector(body, date, true);
  return normalizeDegrees(Astronomy.Ecliptic(geoVector).elon);
}

/**
 * Mean lunar ascending node (Rahu) longitude, tropical, degrees.
 * Standard Meeus "Astronomical Algorithms" mean-node series. Ketu is always
 * exactly 180 degrees opposite. Some traditions prefer the "true" (osculating)
 * node instead of the mean node for dasha/chart purposes -- flag this choice
 * with the astrologer; swapping to the true node is a contained change here.
 */
function meanLunarNodeLongitude(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525; // Julian centuries (TT) since J2000.0
  const omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;
  return normalizeDegrees(omega);
}

export interface RawPlanetLongitude {
  planet: PlanetName;
  tropicalLongitude: number;
  isRetrograde: boolean;
}

const RETROGRADE_CAPABLE: PlanetName[] = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

/** Tropical longitudes and retrograde flags for all nine grahas at a given instant. */
export function getAllTropicalLongitudes(date: Date): RawPlanetLongitude[] {
  const results: RawPlanetLongitude[] = [];

  const bodies: PlanetName[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  for (const planet of bodies) {
    const lon = tropicalLongitudeOf(planet, date);
    let isRetrograde = false;
    if (RETROGRADE_CAPABLE.includes(planet)) {
      const later = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const lonLater = tropicalLongitudeOf(planet, later);
      // Handle 360/0 wraparound before comparing.
      const delta = normalizeDegrees(lonLater - lon + 180) - 180;
      isRetrograde = delta < 0;
    }
    results.push({ planet, tropicalLongitude: lon, isRetrograde });
  }

  const rahu = meanLunarNodeLongitude(date);
  const ketu = normalizeDegrees(rahu + 180);
  // Nodes are always treated as retrograde in Vedic astrology (they move backward through the zodiac).
  results.push({ planet: "Rahu", tropicalLongitude: rahu, isRetrograde: true });
  results.push({ planet: "Ketu", tropicalLongitude: ketu, isRetrograde: true });

  return results;
}

/** Julian Day (UT) for a JS Date, via astronomy-engine's time model. */
export function julianDayUT(date: Date): number {
  return Astronomy.MakeTime(date).ut + 2451545.0;
}

/** True obliquity of the ecliptic (degrees) at a given date. */
export function trueObliquity(date: Date): number {
  return Astronomy.e_tilt(Astronomy.MakeTime(date)).tobl;
}

/** Greenwich Apparent Sidereal Time, in degrees (0-360). */
export function greenwichSiderealTimeDegrees(date: Date): number {
  return normalizeDegrees(Astronomy.SiderealTime(date) * 15);
}
