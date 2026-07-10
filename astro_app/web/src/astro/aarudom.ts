/**
 * Aarudom marking for the Jamakol chart's inner D1 grid.
 *
 * Rule (as given): take the minutes of the reference date/time, divide by 5.
 * If there's a non-zero remainder, add one to the quotient -- call this
 * count. Starting from Aries as count 1, count `count` signs clockwise
 * (increasing zodiacal order); the sign landed on gets marked Aarudom.
 *
 * Edge case not covered by the rule as stated: minutes = 0 gives quotient 0,
 * remainder 0, count 0, which has no "0th sign" -- treated here as a full
 * 12-sign wrap (count 12, landing back on Aries) rather than left undefined.
 */
export function computeAarudomRasi(minutes: number): number {
  const quotient = Math.floor(minutes / 5);
  const remainder = minutes % 5;
  let count = remainder !== 0 ? quotient + 1 : quotient;
  if (count === 0) count = 12;
  return (count - 1) % 12; // 0 = Aries
}
