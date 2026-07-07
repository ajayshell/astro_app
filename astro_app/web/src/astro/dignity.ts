import type { PlanetName } from "./constants";

export type Dignity = "exalted" | "debilitated" | null;

/**
 * Classical (Parashari) exaltation/debilitation signs for the 7 classical
 * grahas, checked at the sign level (not the exact "deep exaltation" degree).
 * Rahu/Ketu are left out -- their exaltation sign is not agreed across
 * traditions (some use Taurus/Scorpio, others Gemini/Sagittarius) -- flag for
 * the astrologer if a convention is wanted.
 */
const EXALTATION_RASI: Partial<Record<PlanetName, number>> = {
  Sun: 0, // Aries
  Moon: 1, // Taurus
  Mars: 9, // Capricorn
  Mercury: 5, // Virgo
  Jupiter: 3, // Cancer
  Venus: 11, // Pisces
  Saturn: 6, // Libra
};

const DEBILITATION_RASI: Partial<Record<PlanetName, number>> = {
  Sun: 6, // Libra
  Moon: 7, // Scorpio
  Mars: 3, // Cancer
  Mercury: 11, // Pisces
  Jupiter: 9, // Capricorn
  Venus: 5, // Virgo
  Saturn: 0, // Aries
};

/** Dignity of `planet` when placed in `rasi` (0 = Aries .. 11 = Pisces). */
export function getDignity(planet: PlanetName, rasi: number): Dignity {
  if (EXALTATION_RASI[planet] === rasi) return "exalted";
  if (DEBILITATION_RASI[planet] === rasi) return "debilitated";
  return null;
}
