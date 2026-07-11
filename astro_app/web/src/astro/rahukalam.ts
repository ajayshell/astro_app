import { computeSunTimes } from "./sunTimes";
import { weekdayIndexForDate } from "./util";

/**
 * Rahukalam, Yamagandam, and Gulikakalam: three "inauspicious period"
 * windows during the daytime, each 1/8th of the sunrise-to-sunset span,
 * with which 1/8th slice depending on the weekday.
 *
 * Rule used (the standard rule found consistently across Panchangam
 * references and virtually all Vedic astrology software -- unlike the
 * Jamakol ring order and Aarudom rules elsewhere in this codebase, which
 * were genuinely ambiguous or astrologer-specific, this one appears to be
 * uniform practice): divide sunrise-to-sunset into 8 equal segments,
 * numbered 1-8 from sunrise. Each weekday maps to one segment per period:
 *
 *           Sun  Mon  Tue  Wed  Thu  Fri  Sat
 *   Rahu     8    2    7    5    6    4    3
 *   Yama     5    4    3    2    1    7    6
 *   Gulika   7    6    5    4    3    2    1
 *
 * NOT YET CONFIRMED with the astrologer for this app specifically -- flag
 * before relying on it, same as every other astrological rule in this
 * codebase gets flagged until confirmed (see PROJECT_BRIEF.md). Also
 * unconfirmed: whether a nighttime Gulikakalam variant (sunset to next
 * sunrise, split the same way) is wanted alongside the daytime one -- only
 * the daytime version is implemented here.
 */

const RAHU_SEGMENT = [8, 2, 7, 5, 6, 4, 3]; // index 0 = Sunday .. 6 = Saturday
const YAMA_SEGMENT = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEGMENT = [7, 6, 5, 4, 3, 2, 1];

export interface KalamPeriod {
  start: Date;
  end: Date;
}

export interface RahuYamaGulikaResult {
  rahukalam: KalamPeriod;
  yamagandam: KalamPeriod;
  gulikakalam: KalamPeriod;
  zoneName: string;
}

function segmentWindow(sunrise: Date, sunset: Date, segment1Indexed: number): KalamPeriod {
  const segmentMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const start = new Date(sunrise.getTime() + segmentMs * (segment1Indexed - 1));
  const end = new Date(sunrise.getTime() + segmentMs * segment1Indexed);
  return { start, end };
}

export function computeRahuYamaGulika(dateStr: string, referenceInstant: Date, latitude: number, longitude: number): RahuYamaGulikaResult {
  const { sunrise, sunset, zoneName } = computeSunTimes(referenceInstant, latitude, longitude);
  const weekday = weekdayIndexForDate(dateStr);
  if (weekday === null) throw new Error("Invalid date for Rahukalam/Yamagandam/Gulikakalam calculation.");

  return {
    rahukalam: segmentWindow(sunrise, sunset, RAHU_SEGMENT[weekday]),
    yamagandam: segmentWindow(sunrise, sunset, YAMA_SEGMENT[weekday]),
    gulikakalam: segmentWindow(sunrise, sunset, GULIKA_SEGMENT[weekday]),
    zoneName,
  };
}
