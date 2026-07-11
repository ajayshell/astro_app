import { RASI_NAMES } from "./constants";
import type { PlanetName } from "./constants";
import type { BirthInput } from "./types";

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

export interface CenterInfo {
  date: string;
  time: string;
  place: string;
}

/** Human-readable DOB/time/place, for the caption shown in the South Indian chart's center block. */
export function formatBirthSummary(input: BirthInput): CenterInfo {
  const [year, month, day] = input.date.split("-");
  const date = `${day}-${month}-${year}`;

  const [hourStr, minuteStr] = input.time.split(":");
  const hour = Number(hourStr);
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = ((hour + 11) % 12) + 1;
  const time = `${hour12}:${minuteStr} ${period}`;

  return { date, time, place: input.placeName ?? "" };
}
