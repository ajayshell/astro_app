import { RASI_NAMES } from "./constants";
import type { PlanetName } from "./constants";

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

export function formatDegree(siderealLongitude: number): string {
  const withinSign = siderealLongitude % 30;
  const deg = Math.floor(withinSign);
  const minFloat = (withinSign - deg) * 60;
  const min = Math.floor(minFloat);
  return `${deg}°${min.toString().padStart(2, "0")}'`;
}
