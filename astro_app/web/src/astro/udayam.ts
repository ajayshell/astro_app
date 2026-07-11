import { normalizeDegrees } from "./util";

/**
 * Udayam marking for the Jamakol chart's inner D1 grid.
 *
 * Rule (as given):
 *   S = |reference time - sunrise|, in minutes (absolute value).
 *   D = (sunset - sunrise), in minutes, divided by 360 -- i.e. the minutes
 *       spanned by one degree if the whole daytime arc is mapped to 360deg.
 *   degrees forward = S / D (S minutes expressed as degrees using that rate).
 *
 * Starting point (per follow-up correction): NOT Aries 0 degrees -- the
 * Sun's own current sidereal longitude. Add degreesForward to the Sun's
 * longitude (standard increasing-longitude direction, same convention as
 * every other sidereal position in this app) and mark whichever sign the
 * result lands in as Udayam. Example worked through directly against the
 * app's own output: Sun at 22d42' into Gemini (absolute ~82.7 deg) plus
 * ~56.34 deg forward lands at ~139 deg, i.e. past all of Cancer and into
 * Leo -- not simply "one sign forward".
 */
export interface UdayamCalc {
  referenceInstant: Date;
  sunrise: Date;
  sunset: Date;
  S: number; // minutes between reference time and sunrise (absolute value)
  daytimeMinutes: number; // sunset - sunrise, in minutes
  D: number; // daytimeMinutes / 360 (minutes per degree)
  degreesForward: number; // S / D
  sunLongitude: number; // Sun's sidereal longitude at referenceInstant -- the starting point
  destinationLongitude: number; // sunLongitude + degreesForward, normalized 0-360
  rasiIndex: number; // floor(destinationLongitude / 30) mod 12
}

export function computeUdayam(referenceInstant: Date, sunrise: Date, sunset: Date, sunLongitude: number): UdayamCalc {
  const S = Math.abs(referenceInstant.getTime() - sunrise.getTime()) / 60000;
  const daytimeMinutes = (sunset.getTime() - sunrise.getTime()) / 60000;
  const D = daytimeMinutes / 360;
  const degreesForward = D !== 0 ? S / D : 0;
  const destinationLongitude = normalizeDegrees(sunLongitude + degreesForward);
  const rasiIndex = Math.floor(destinationLongitude / 30) % 12;

  const calc: UdayamCalc = {
    referenceInstant,
    sunrise,
    sunset,
    S,
    daytimeMinutes,
    D,
    degreesForward,
    sunLongitude,
    destinationLongitude,
    rasiIndex,
  };

  // Explicit log prints for testing/feedback, per request -- check the
  // browser console when trying different times. Gated behind VITE_DEBUG so
  // production builds stay quiet (run `VITE_DEBUG=true npm run dev` locally
  // to turn this back on).
  if (import.meta.env.VITE_DEBUG === "true") {
    // eslint-disable-next-line no-console
    console.log("[Udayam] reference:", referenceInstant.toISOString(), "sunrise:", sunrise.toISOString(), "sunset:", sunset.toISOString());
    // eslint-disable-next-line no-console
    console.log(
      `[Udayam] S=${S.toFixed(2)} min, daytimeMinutes=${daytimeMinutes.toFixed(2)}, D=${D.toFixed(4)} min/deg, degreesForward=${degreesForward.toFixed(2)}, sunLongitude=${sunLongitude.toFixed(2)}, destinationLongitude=${destinationLongitude.toFixed(2)}, rasiIndex=${rasiIndex}`,
    );
  }

  return calc;
}
