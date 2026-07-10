import * as Astronomy from "astronomy-engine";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import type { PlanetName } from "./constants";

export type JamakolGraha = PlanetName | "Maandi";

/**
 * Jamakol (ஜாமக்கோளம்): the day (sunrise to next sunrise) divided into 8
 * "jamams" -- 4 across daytime, 4 across the night -- each ruled by a graha,
 * traditionally drawn as a ring of 8 boxes around a square, read
 * anti-clockwise starting from the top-left box.
 *
 * CONFIRMED (from a reference chart + explicit rule from the user):
 *   - anti-clockwise ring order: Surya (Sun), Chevva (Mars), Guru (Jupiter),
 *     Budhan (Mercury), Shukran (Venus), Shani (Saturn), Chandran (Moon),
 *     Maandi (an upagraha, not a real planet -- the 8th slot).
 *   - on a Sunday, Surya sits in the top-left box (= the jamam right after
 *     sunrise).
 *
 * NOT YET CONFIRMED -- flag before relying on this:
 *   - How the starting box rotates for the other six weekdays. A reference
 *     chart for a Thursday showed Maandi (not Surya) in the top-left box,
 *     which rules out the obvious "shift by weekday index" rule -- no linear
 *     rule fits both the Sunday and Thursday data points. Until the real rule
 *     is known, this always starts at Surya regardless of weekday.
 *   - Maandi is placed as a label only; its own classical calculation (a
 *     time-of-day-dependent upagraha position) is not implemented.
 *   - The meaning of the "degree" shown per box (this build uses 0/45/90/.../
 *     315, one per jamam) has not been confirmed against source material.
 */

const RING_ORDER: JamakolGraha[] = ["Sun", "Mars", "Jupiter", "Mercury", "Venus", "Saturn", "Moon", "Maandi"];

export interface JamakolPeriod {
  ringPosition: number; // 0-7, anti-clockwise from top-left
  degree: number; // 0, 45, 90 ... 315 (unconfirmed meaning, see file header)
  isDay: boolean;
  graha: JamakolGraha;
  start: Date;
  end: Date;
}

export interface JamakolResult {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  periods: JamakolPeriod[]; // index-aligned with ringPosition (periods[i].ringPosition === i)
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

  // TODO: rotate the ring's starting position by weekday once that rule is
  // confirmed (see file header) -- always starts at Surya for now.
  const ringStart = 0;

  const periods: JamakolPeriod[] = [];
  const daySegments = splitIntoFour(sunrise, sunset);
  const nightSegments = splitIntoFour(sunset, nextSunrise);

  daySegments.forEach(([start, end], i) => {
    const ringPosition = (ringStart + i) % 8;
    periods.push({ ringPosition, degree: ringPosition * 45, isDay: true, graha: RING_ORDER[ringPosition], start, end });
  });
  nightSegments.forEach(([start, end], i) => {
    const ringPosition = (ringStart + 4 + i) % 8;
    periods.push({ ringPosition, degree: ringPosition * 45, isDay: false, graha: RING_ORDER[ringPosition], start, end });
  });

  periods.sort((a, b) => a.ringPosition - b.ringPosition);

  const currentIndex = periods.findIndex(
    (p) => referenceInstant.getTime() >= p.start.getTime() && referenceInstant.getTime() < p.end.getTime(),
  );

  return {
    sunrise,
    sunset,
    nextSunrise,
    periods,
    currentIndex: currentIndex === -1 ? null : currentIndex,
    zoneName,
  };
}
