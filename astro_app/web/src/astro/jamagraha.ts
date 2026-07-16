import { normalizeDegrees, weekdayIndexForDate } from "./util";
import type { JamakolGraha } from "./jamakol";

/**
 * Jamagraha (rules/soorya_veedhi.txt, "Rule for placement of Jamagraha") --
 * a rotation of the outer 8-box ring's fixed graha sequence (RING_ORDER,
 * jamakol.ts), anchored at whichever ring box sits just outside InnerHomeDSq
 * (the D1 square the calculation lands on). CONFIRMED (2026-07-15) that the
 * marker is ring-only: for the 4 signs whose outward step doesn't land on a
 * real ring box (see OUTWARD_STEP below), the deity+D is NOT written
 * anywhere else -- neither on the inner D1 square nor on that non-ring
 * border cell -- the ring's cycle simply starts at the next real ring box,
 * continuing anticlockwise.
 *
 * Rule, as given and confirmed against a worked example ("time is 7.12pm,
 * Day = Saturday" -> A=1, B=72, C=36, D=324):
 *   weekday = the birth date's own weekday (unshifted -- "Day = Saturday" in
 *     the example is just the plain calendar weekday, not date-adjusted).
 *   deity = that weekday's ruling graha (Sunday..Saturday -> Sun..Saturn).
 *   hour12 = birth hour in 12-hour-clock form (1-12).
 *   A = hour12 - 6 (hour only -- minutes/seconds are NOT part of this
 *       subtraction; they're reintroduced in B below). No special-casing
 *       for A going non-positive: it flows through B/C/D and
 *       normalizeDegrees(D) handles the wraparound arithmetically.
 *   B = A * 60 + minute + second / 60 (seconds folded in as a fractional
 *       minute -- confirmed 2026-07-15 against a hand-checked example,
 *       "11:39:38" -> B = 5*60 + 39 + 38/60 = 339.6333..., which the app
 *       had been getting wrong by silently dropping seconds: B = 339 exactly).
 *   C = B / 2
 *   D = 360 - C, normalized to [0, 360)
 *
 * InnerHomeDSq: counting forward from Aries (inclusive) in 30-degree steps
 *   -- same convention as computeAarudom, and matching the rule's own D=65
 *   worked example exactly (30 in Aries, 30 in Taurus, remaining 5 into
 *   Gemini -> rasiIndex 2) -- D lands on a Raasi square, purely as a waypoint
 *   for locating the ring anchor below (nothing is written on this square
 *   itself). `rasiIndex`/`degree` are exposed only for the debug panel.
 *   NOTE: the rule's OWN D=324 example claims this lands on "Cap"
 *   (Capricorn), but applying its own D=65 method to D=324 gives Aquarius
 *   (floor(324/30)=10, matching the already-confirmed Krishnagiri/Libra
 *   example's identical method) -- treated as the same kind of copy-paste
 *   slip as that example's "remainder of 8" (should be 24). Aquarius is
 *   used here; conveniently this doesn't change the ring anchor below
 *   (both Capricorn and Aquarius resolve to ring box 1).
 *
 * Ring anchor (OUTWARD_STEP): stepping from InnerHomeDSq to the border cell
 *   directly outside it (away from the grid center) lands on one of the 8
 *   real ring boxes for 8 of the 12 signs, and on a genuinely blank cell for
 *   the other 4 (Taurus, Leo, Scorpio, Aquarius -- each sits mid-edge of the
 *   inner 4x4 block with no ring box directly outside it; only the 4 inner
 *   corners and the 4 signs adjacent to a ring edge-box have one). Derived
 *   directly from JamakolPage.tsx's grid layout (INNER_GRID_POSITIONS vs
 *   RING_POSITIONS), not guessed. For the 4 blank-cell signs, `ringAnchorIndex`
 *   already points at the next REAL ring box continuing anticlockwise -- no
 *   separate marker is needed for the blank cell itself.
 *
 * RING_ORDER's fixed cyclic sequence (Sun, Mars, Jupiter, Mercury, Venus,
 *   Saturn, Moon, Maandi/Snake) fills the ring continuing anticlockwise
 *   (increasing RING_POSITIONS/RING_ORDER array index) from the deity's own
 *   slot in that list, e.g. for a Saturday: Saturn -> Moon -> Snake -> Sun
 *   -> Mars -> ... `ringStart` is the rotation offset computeJamakol needs:
 *   graha at physical ring box p is RING_ORDER[(p + ringStart) % 8].
 *
 * Ring degrees ("Rule for filling the remaining Jamagraha in the outer
 *   chart"): each box's displayed degree also anchors at D for the deity's
 *   own box, decreasing by 45 anticlockwise per box, following the SAME
 *   sequence as the rotation above -- "From Saturn degree of 324, subtract
 *   45 ... put the next Jamagraha [Moon] ... continue till you reach the
 *   end of the series." `ringDegrees[p]` is index-aligned to physical box
 *   p, same as the graha lookup.
 */

const WEEKDAY_LORDS: JamakolGraha[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

// ringAnchorIndex per D1 sign (0-7, the ring box that starts the blue-series
// cycle) -- index-aligned with RASI_NAMES (0 = Aries .. 11 = Pisces). See
// file header for the derivation (INNER_GRID_POSITIONS vs RING_POSITIONS
// adjacency). For the 4 signs with no real ring box directly outside them
// (Taurus, Leo, Scorpio, Aquarius), this already points at the next real
// ring box continuing anticlockwise.
const OUTWARD_STEP: number[] = [
  7, // 0 Aries -> ring box 7 (top edge) directly
  7, // 1 Taurus -> blank; next real box is 7
  6, // 2 Gemini -> ring box 6 (top-right corner) directly
  5, // 3 Cancer -> ring box 5 (right edge) directly
  5, // 4 Leo -> blank; next real box is 5
  4, // 5 Virgo -> ring box 4 (bottom-right corner) directly
  3, // 6 Libra -> ring box 3 (bottom edge) directly
  3, // 7 Scorpio -> blank; next real box is 3
  2, // 8 Sagittarius -> ring box 2 (bottom-left corner) directly
  1, // 9 Capricorn -> ring box 1 (left edge) directly
  1, // 10 Aquarius -> blank; next real box is 1
  0, // 11 Pisces -> ring box 0 (top-left corner) directly
];

function normalizeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export interface JamagrahaCalc {
  weekdayIndex: number; // of the birth date, unshifted (0 = Sunday .. 6 = Saturday)
  deity: JamakolGraha; // that weekday's ruling graha
  hour: number; // 24-hour birth hour, as parsed from `time`
  minute: number;
  second: number;
  hour12: number; // birth hour in 12-hour-clock form (1-12)
  a: number; // hour12 - 6
  b: number; // a*60 + minute + second/60
  c: number; // b / 2
  degree360: number; // D, 0-360 (= normalizeDegrees(360 - c))
  rasiIndex: number; // 0-11, the D1 square marked (InnerHomeDSq)
  degree: number; // 0-29.999..., degrees into rasiIndex's sign (unused for display -- see file header)
  ringStart: number; // rotation offset for computeJamakol -- graha at ring box p is RING_ORDER[(p + ringStart) % 8]
  ringDegrees: number[]; // index-aligned to physical ring box p -- the degree to display there
}

/** `date`/`time` are the birth date/time as local wall-clock strings ("YYYY-MM-DD", "HH:mm[:ss]"). `ringOrder` is jamakol.ts's RING_ORDER. */
export function computeJamagraha(date: string, time: string, ringOrder: JamakolGraha[]): JamagrahaCalc {
  const weekdayIndex = weekdayIndexForDate(date)!;
  const deity = WEEKDAY_LORDS[weekdayIndex];

  const [hour, minute, second] = time.split(":").map(Number);
  const hour12 = ((hour + 11) % 12) + 1;
  const a = hour12 - 6;
  const b = a * 60 + minute + (second || 0) / 60;
  const c = b / 2;
  const degree360 = normalizeDegrees(360 - c);

  const squaresTraversed = Math.floor(degree360 / 30);
  const rasiIndex = squaresTraversed % 12;
  const degree = degree360 % 30;

  const ringAnchorIndex = OUTWARD_STEP[rasiIndex];
  const canonicalIndex = ringOrder.indexOf(deity);
  const ringStart = normalizeMod(canonicalIndex - ringAnchorIndex, 8);

  const ringDegrees: number[] = [];
  for (let p = 0; p < 8; p++) {
    const stepsFromDeity = normalizeMod(p - ringAnchorIndex, 8);
    ringDegrees.push(normalizeDegrees(degree360 - 45 * stepsFromDeity));
  }

  return {
    weekdayIndex,
    deity,
    hour,
    minute,
    second: second || 0,
    hour12,
    a,
    b,
    c,
    degree360,
    rasiIndex,
    degree,
    ringStart,
    ringDegrees,
  };
}
