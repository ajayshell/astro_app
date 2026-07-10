/**
 * Udayam marking for the Jamakol chart's inner D1 grid.
 *
 * Rule (as given):
 *   S = |reference time - sunrise|, in minutes (absolute value).
 *   D = (sunset - sunrise), in minutes, divided by 360 -- i.e. the minutes
 *       spanned by one degree if the whole daytime arc is mapped to 360deg.
 *   degrees forward = S / D (S minutes expressed as degrees using that rate).
 *   Starting from Aries (0 deg) and moving clockwise (increasing zodiac
 *   order) by that many degrees, 30 degrees per sign, mark whichever sign it
 *   lands in as Udayam.
 *
 * This read of the rule is the one interpretation that uses both S and D as
 * defined (S/D, converting elapsed minutes to degrees via the minutes-per-
 * degree rate D) -- flag if a different combination was intended.
 */
export interface UdayamCalc {
  referenceInstant: Date;
  sunrise: Date;
  sunset: Date;
  S: number; // minutes between reference time and sunrise (absolute value)
  daytimeMinutes: number; // sunset - sunrise, in minutes
  D: number; // daytimeMinutes / 360 (minutes per degree)
  degreesForward: number; // S / D
  rasiIndex: number; // 0 = Aries, floor(degreesForward / 30) mod 12
}

export function computeUdayam(referenceInstant: Date, sunrise: Date, sunset: Date): UdayamCalc {
  const S = Math.abs(referenceInstant.getTime() - sunrise.getTime()) / 60000;
  const daytimeMinutes = (sunset.getTime() - sunrise.getTime()) / 60000;
  const D = daytimeMinutes / 360;
  const degreesForward = D !== 0 ? S / D : 0;
  const rasiIndex = Math.floor(degreesForward / 30) % 12;

  const calc: UdayamCalc = { referenceInstant, sunrise, sunset, S, daytimeMinutes, D, degreesForward, rasiIndex };

  // Explicit log prints for testing/feedback, per request -- check the
  // browser console when trying different times.
  // eslint-disable-next-line no-console
  console.log("[Udayam] reference:", referenceInstant.toISOString(), "sunrise:", sunrise.toISOString(), "sunset:", sunset.toISOString());
  // eslint-disable-next-line no-console
  console.log(
    `[Udayam] S=${S.toFixed(2)} min, daytimeMinutes=${daytimeMinutes.toFixed(2)}, D=${D.toFixed(4)} min/deg, degreesForward=${degreesForward.toFixed(2)}, rasiIndex=${rasiIndex}`,
  );

  return calc;
}
