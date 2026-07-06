import type { PlanetName } from "./constants";
import type { ChartResult } from "./types";

export const CHARA_KARAKA_NAMES = [
  "Atmakaraka",
  "Amatyakaraka",
  "Bhratrukaraka",
  "Matrukaraka",
  "Putrakaraka",
  "Gnatikaraka",
  "Darakaraka",
] as const;

const KARAKA_PLANETS: PlanetName[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export interface CharaKarakaRow {
  karaka: string;
  planet: PlanetName;
  degreeInSign: number;
}

/**
 * Jaimini Chara Karakas ("Charam"): the 7 classical grahas ranked by their
 * degree within sign, highest first -- Atmakaraka (self) down to Darakaraka
 * (spouse).
 *
 * NOTE: this is the common modern 7-karaka scheme (no nodes, no reversal for
 * retrograde planets). Some traditions use an 8-karaka scheme that adds Rahu
 * (measured as 30 - its degree, since it moves backward) or re-rank
 * retrograde planets by their reversed degree. Confirm which convention the
 * astrologer wants before relying on this for a real reading.
 */
export function computeCharaKarakas(chart: ChartResult): CharaKarakaRow[] {
  const candidates = chart.planets
    .filter((p) => KARAKA_PLANETS.includes(p.planet))
    .map((p) => ({ planet: p.planet, degreeInSign: p.siderealLongitude % 30 }))
    .sort((a, b) => b.degreeInSign - a.degreeInSign);

  return candidates.map((c, i) => ({
    karaka: CHARA_KARAKA_NAMES[i] ?? "-",
    planet: c.planet,
    degreeInSign: c.degreeInSign,
  }));
}
