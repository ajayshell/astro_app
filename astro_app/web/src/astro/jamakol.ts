import * as Astronomy from "astronomy-engine";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import type { PlanetName } from "./constants";

/**
 * Jamakol (ஜாமக்கோளம்): the traditional division of a day (sunrise to next
 * sunrise) into 8 "jamams" -- 4 across daytime, 4 across the night -- each
 * ruled by a graha, used to judge whether the current moment is favorable.
 *
 * IMPLEMENTATION IS A BEST-EFFORT GUESS, NOT A CONFIRMED RULE. It borrows the
 * mechanics of the (Western) planetary-hours system, which several Tamil
 * references describe Jamakol as being structurally equivalent to:
 *   - jamam 1 (right after sunrise) is ruled by that weekday's lord
 *     (Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn for Sun..Sat)
 *   - subsequent jamams (day and night together, continuously) cycle through
 *     the Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.
 * This has NOT been confirmed against the astrologer's actual system. If
 * Jamakol instead uses a fixed (non-rotating) lord-per-jamam-number table, or
 * treats day/night as separate 4-cycles, this needs to be rewritten -- flag
 * it before relying on this for real timing decisions.
 */

const WEEKDAY_LORDS: PlanetName[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const CHALDEAN_ORDER: PlanetName[] = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

export interface JamakolPeriod {
  index: number; // 1-8
  isDay: boolean;
  lord: PlanetName;
  start: Date;
  end: Date;
}

export interface JamakolResult {
  weekdayLord: PlanetName;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  periods: JamakolPeriod[];
  currentIndex: number | null; // index into `periods` containing the reference instant, if any
  zoneName: string; // IANA zone of the location -- all times above must be displayed in this zone, not the viewer's local one
}

function splitIntoFour(start: Date, end: Date): [Date, Date][] {
  const spanMs = end.getTime() - start.getTime();
  const quarters: [Date, Date][] = [];
  for (let i = 0; i < 4; i++) {
    const segStart = new Date(start.getTime() + (spanMs * i) / 4);
    const segEnd = new Date(start.getTime() + (spanMs * (i + 1)) / 4);
    quarters.push([segStart, segEnd]);
  }
  return quarters;
}

export function computeJamakol(referenceInstant: Date, latitude: number, longitude: number): JamakolResult {
  const observer = new Astronomy.Observer(latitude, longitude, 0);

  const sunriseTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, referenceInstant, -2);
  if (!sunriseTime) throw new Error("Could not find sunrise for this location/date (polar location?).");
  const sunsetTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, sunriseTime, 2);
  if (!sunsetTime) throw new Error("Could not find sunset for this location/date (polar location?).");
  const nextSunriseTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, sunsetTime, 2);
  if (!nextSunriseTime) throw new Error("Could not find next sunrise for this location/date (polar location?).");

  const sunrise = sunriseTime.date;
  const sunset = sunsetTime.date;
  const nextSunrise = nextSunriseTime.date;

  const zoneName = tzlookup(latitude, longitude);
  const localWeekday = DateTime.fromJSDate(sunrise).setZone(zoneName).weekday; // 1=Mon..7=Sun
  const dayIndex = localWeekday % 7; // 0=Sun..6=Sat, matching WEEKDAY_LORDS
  const weekdayLord = WEEKDAY_LORDS[dayIndex];
  const chaldeanStart = CHALDEAN_ORDER.indexOf(weekdayLord);

  const periods: JamakolPeriod[] = [];
  const daySegments = splitIntoFour(sunrise, sunset);
  const nightSegments = splitIntoFour(sunset, nextSunrise);

  daySegments.forEach(([start, end], i) => {
    periods.push({
      index: i + 1,
      isDay: true,
      lord: CHALDEAN_ORDER[(chaldeanStart + i) % 7],
      start,
      end,
    });
  });
  nightSegments.forEach(([start, end], i) => {
    periods.push({
      index: i + 5,
      isDay: false,
      lord: CHALDEAN_ORDER[(chaldeanStart + 4 + i) % 7],
      start,
      end,
    });
  });

  const currentIndex = periods.findIndex(
    (p) => referenceInstant.getTime() >= p.start.getTime() && referenceInstant.getTime() < p.end.getTime(),
  );

  return {
    weekdayLord,
    sunrise,
    sunset,
    nextSunrise,
    periods,
    currentIndex: currentIndex === -1 ? null : currentIndex,
    zoneName,
  };
}
