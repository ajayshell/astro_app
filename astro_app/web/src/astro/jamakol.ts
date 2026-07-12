import type { PlanetName } from "./constants";
import { computeSunTimes } from "./sunTimes";

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
 * Two independent placements happen per box, not one:
 *   - WHICH JAMAM (chronological time period) sits in a box: always fixed --
 *     the jamam right after sunrise is box 0 (top-left), and so on around
 *     the ring in period order. This never rotates.
 *   - WHICH GRAHA'S NAME is shown in a box: rotates by `ringStart`, computed
 *     by `computeJamagraha` (astro/jamagraha.ts) per the "Rule for placement
 *     of Jamagraha" in rules/soorya_veedhi.txt -- a degree-based formula
 *     from the birth time, CONFIRMED by the user (2026-07-11) after the
 *     rule text was updated to explicitly say "outer BLUE boxes" (this
 *     ring's own color in the UI). Previously hardcoded to 0 (always Surya
 *     in the top-left box) because no linear "shift by weekday index" rule
 *     fit the reference data -- a reference Thursday chart showed Maandi,
 *     not Surya/Guru, in the top-left box, which a same-weekday-every-time
 *     shift can't produce but a birth-minute-dependent rotation can.
 *
 * NOT YET CONFIRMED -- flag before relying on this:
 *   - Maandi is placed as a label only; its own classical calculation (a
 *     time-of-day-dependent upagraha position) is not implemented.
 *   - The meaning of the "degree" shown per box (this build uses 0/45/90/.../
 *     315, one per jamam) has not been confirmed against source material.
 */

export const RING_ORDER: JamakolGraha[] = ["Sun", "Mars", "Jupiter", "Mercury", "Venus", "Saturn", "Moon", "Maandi"];

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

export function computeJamakol(referenceInstant: Date, latitude: number, longitude: number, ringStart = 0): JamakolResult {
  const { sunrise, sunset, nextSunrise, zoneName } = computeSunTimes(referenceInstant, latitude, longitude);

  const periods: JamakolPeriod[] = [];
  const daySegments = splitIntoFour(sunrise, sunset);
  const nightSegments = splitIntoFour(sunset, nextSunrise);

  daySegments.forEach(([start, end], i) => {
    const ringPosition = i; // chronological -- always fixed, doesn't rotate
    const graha = RING_ORDER[(ringPosition + ringStart) % 8];
    periods.push({ ringPosition, degree: ringPosition * 45, isDay: true, graha, start, end });
  });
  nightSegments.forEach(([start, end], i) => {
    const ringPosition = 4 + i;
    const graha = RING_ORDER[(ringPosition + ringStart) % 8];
    periods.push({ ringPosition, degree: ringPosition * 45, isDay: false, graha, start, end });
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
