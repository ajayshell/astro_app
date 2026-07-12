import { normalizeDegrees, weekdayIndexForDate } from "./util";
import type { JamakolGraha } from "./jamakol";

/**
 * Jamagraha (rules/soorya_veedhi.txt, "Rule for placement of Jamagraha") --
 * two placements from one shared calculation:
 *   1. A marker on the Jamakol chart's inner D1 grid (sqE): the weekday's
 *      ruling deity + the full D value, written next to a Raasi square.
 *   2. A rotation of the outer 8-box ring's fixed graha sequence
 *      (RING_ORDER, jamakol.ts), so the ring isn't always hardcoded to
 *      start at Surya -- CONFIRMED by the user (2026-07-11) after the rule
 *      text was updated to say "outer BLUE boxes" (the ring cells' actual
 *      color in the UI), making clear this is a real, dynamic placement,
 *      not just narrative description of the already-static ring.
 *
 * Rule, as given and confirmed against a worked example ("time is 7.12pm,
 * Day = Saturday" -> A=1, B=72, C=36, D=324, 10 squares traversed):
 *   weekday = the birth date's own weekday (unshifted -- "Day = Saturday" in
 *     the example is just the plain calendar weekday, not date-adjusted).
 *   deity = that weekday's ruling graha (Sunday..Saturday -> Sun..Saturn).
 *   hour12 = birth hour in 12-hour-clock form (1-12).
 *   A = hour12 - 6 (hour only -- minutes are NOT part of this subtraction;
 *       they're reintroduced in B below). No special-casing for A going
 *       non-positive: it flows through B/C/D and normalizeDegrees(D) handles
 *       the wraparound arithmetically.
 *   B = A * 60 + (birth minute)
 *   C = B / 2
 *   D = 360 - C, normalized to [0, 360)
 *
 * D1 marker (sqE): counting forward from Aries (inclusive) in 30-degree
 *   steps -- same convention as computeAarudom -- D lands on a Raasi square.
 *   Write the weekday's deity + D ITSELF there (not the 0-30 within-sign
 *   remainder) -- confirmed by the worked example's own text, "Write the
 *   'god of day' and 324deg in that square" (D=324, not the 24-degree
 *   remainder). `degree360` (D) is what gets displayed; `rasiIndex`/`degree`
 *   (the remainder) only determine which D1 square.
 *
 * Ring rotation: the SAME D, but counted in 45-degree steps (360/8, one per
 *   ring box, vs the D1 grid's 30-degree/12-square steps) locates the ring
 *   box for the weekday's deity (CONFIRMED: "wherever sqE's box is" using
 *   this D-based calculation, not a fixed box). RING_ORDER's fixed cyclic
 *   sequence (Sun, Mars, Jupiter, Mercury, Venus, Saturn, Moon, Maandi/
 *   Snake) then fills the rest of the ring continuing anticlockwise (i.e.
 *   increasing RING_POSITIONS/RING_ORDER array index, matching jamakol.ts's
 *   own established anticlockwise convention) from that graha's own slot.
 *   `ringStart` is the rotation offset computeJamakol needs: graha at
 *   physical ring box p is RING_ORDER[(p + ringStart) % 8].
 *
 * The rule's own worked example has one residual arithmetic slip: partway
 * through it states "10 squares and remainder of 8 degrees" for D=324
 * (324 - 10*30 = 24, not 8) -- but since the D1 "write" step uses D (324)
 * directly rather than that remainder, this slip doesn't affect what's
 * rendered.
 */

const WEEKDAY_LORDS: JamakolGraha[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

function normalizeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export interface JamagrahaCalc {
  weekdayIndex: number; // of the birth date, unshifted (0 = Sunday .. 6 = Saturday)
  deity: JamakolGraha; // that weekday's ruling graha
  degree360: number; // D, 0-360
  rasiIndex: number; // 0-11, the D1 square marked (sqE)
  degree: number; // 0-29.999..., degrees into rasiIndex's sign (unused for display -- see file header)
  ringStart: number; // rotation offset for computeJamakol -- graha at ring box p is RING_ORDER[(p + ringStart) % 8]
}

/** `date`/`time` are the birth date/time as local wall-clock strings ("YYYY-MM-DD", "HH:mm[:ss]"). `ringOrder` is jamakol.ts's RING_ORDER. */
export function computeJamagraha(date: string, time: string, ringOrder: JamakolGraha[]): JamagrahaCalc {
  const weekdayIndex = weekdayIndexForDate(date)!;
  const deity = WEEKDAY_LORDS[weekdayIndex];

  const [hour, minute] = time.split(":").map(Number);
  const hour12 = ((hour + 11) % 12) + 1;
  const a = hour12 - 6;
  const b = a * 60 + minute;
  const c = b / 2;
  const degree360 = normalizeDegrees(360 - c);

  const squaresTraversed = Math.floor(degree360 / 30);
  const rasiIndex = squaresTraversed % 12;
  const degree = degree360 % 30;

  const ringBoxIndex = Math.floor(degree360 / 45) % 8;
  const canonicalIndex = ringOrder.indexOf(deity);
  const ringStart = normalizeMod(canonicalIndex - ringBoxIndex, 8);

  return { weekdayIndex, deity, degree360, rasiIndex, degree, ringStart };
}
