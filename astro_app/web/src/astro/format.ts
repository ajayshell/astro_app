import { RASI_NAMES } from "./constants";
import type { PlanetName } from "./constants";
import type { BirthInput } from "./types";
import { weekdayIndexForDate } from "./util";

export const PLANET_ABBR: Record<PlanetName, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

export const RASI_ABBR = RASI_NAMES.map((n) => n.slice(0, 3));

export interface DegreeParts {
  deg: number;
  minText: string; // zero-padded, e.g. "05"
}

export function degreeParts(siderealLongitude: number): DegreeParts {
  const withinSign = siderealLongitude % 30;
  const deg = Math.floor(withinSign);
  const minFloat = (withinSign - deg) * 60;
  const min = Math.floor(minFloat);
  return { deg, minText: min.toString().padStart(2, "0") };
}

export function formatDegree(siderealLongitude: number): string {
  const { deg, minText } = degreeParts(siderealLongitude);
  return `${deg}°${minText}'`;
}

/** Same rendering as formatDegree, but for a value that's already a full 0-360 degree count (e.g. Jamagraha's D) rather than a within-sign remainder -- doesn't reduce mod 30. */
export function formatDegreeFull(degree: number): string {
  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);
  return `${deg}°${min.toString().padStart(2, "0")}'`;
}

/** "HH:mm" or "HH:mm:ss" (24-hour) -> "h:mm[:ss] AM/PM". */
export function to12HourTime(time: string): string {
  const [hourStr, minuteStr, secondStr] = time.split(":");
  const hour = Number(hourStr);
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = ((hour + 11) % 12) + 1;
  const secondsPart = secondStr !== undefined ? `:${secondStr}` : "";
  return `${hour12}:${minuteStr}${secondsPart} ${period}`;
}

export interface CenterInfo {
  date: string;
  time: string;
  place: string;
  // Weekday index (0 = Sunday .. 6 = Saturday) of the birth date, or null if
  // unavailable -- localizing this into a name requires the i18n hook, so
  // it's resolved by whichever component renders CenterInfo, not here.
  dayIndex: number | null;
}

/** Human-readable DOB/time/place, for the caption shown in the South Indian chart's center block. */
export function formatBirthSummary(input: BirthInput): CenterInfo {
  const [year, month, day] = input.date.split("-");
  const date = `${day}-${month}-${year}`;

  return {
    date,
    time: to12HourTime(input.time),
    place: input.placeName ?? "",
    dayIndex: weekdayIndexForDate(input.date),
  };
}
