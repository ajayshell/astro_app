/**
 * Aarudom marking for the Jamakol chart's inner D1 grid.
 *
 * Rule (updated, replaces the earlier sign-only count rule -- see
 * rules/soorya_veedhi.txt, "Rule for calculating the degrees for Aarudom"):
 *   Ad = minutes of the reference time * 6 (degrees)
 *   Starting from Mesham (Aries), subtract 30 degrees from Ad for each
 *   square traversed, including Mesham itself as the first square. The
 *   sign landed on (after as many full 30-degree subtractions as fit)
 *   is Aarudom's rasi; what's left over (Ad mod 30) is the degree written
 *   next to it.
 *
 * Equivalently: rasiIndex = floor(Ad / 30) mod 12, degree = Ad mod 30.
 *
 * This also cleanly resolves the minutes = 0 edge case the old rule left
 * ambiguous (Ad = 0 -> 0 squares traversed -> lands in Mesham/Aries at
 * 0 degrees, no special-casing needed).
 *
 * Matches the old rule's sign for every minute value except exact
 * multiples of 5 (0, 5, 10, ... 55), where the old "round up only on a
 * non-zero remainder" logic kept the boundary in the previous sign;
 * this degree-based rule advances to the next sign exactly at the
 * boundary (0 degrees in), the standard convention for continuous
 * degree-to-sign mapping. Flag if the old boundary behavior was
 * actually intended for those minute values.
 */
export interface AarudomCalc {
  rasiIndex: number;
  degree: number; // 0-29.999..., degrees into rasiIndex's sign
}

export function computeAarudom(minutes: number): AarudomCalc {
  const ad = minutes * 6;
  const squaresTraversed = Math.floor(ad / 30);
  return {
    rasiIndex: squaresTraversed % 12,
    degree: ad % 30,
  };
}
