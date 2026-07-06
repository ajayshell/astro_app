import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

/**
 * Resolves the IANA time zone for a coordinate and the correct UTC offset
 * (accounting for historical rule changes, not just today's DST) on a given
 * local date/time.
 */
export function resolveTimezone(
  latitude: number,
  longitude: number,
  isoDate: string,
  time: string,
): { offsetHours: number; zoneName: string } {
  const zoneName = tzlookup(latitude, longitude);
  const dt = DateTime.fromISO(`${isoDate}T${time}`, { zone: zoneName });
  return { offsetHours: dt.offset / 60, zoneName };
}
