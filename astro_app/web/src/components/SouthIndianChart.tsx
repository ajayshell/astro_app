import type { PlanetName } from "../astro/constants";
import { houseOfRasi } from "../astro/charts";
import { RasiCell } from "./RasiCell";

interface Props {
  ascendantRasi: number;
  placement: Record<number, { planet: PlanetName; isRetrograde: boolean }[]>;
}

// Fixed South Indian layout: signs occupy fixed cells in a 4x4 grid, going
// clockwise from Pisces (top-left) through Aries (top, 2nd cell). The middle
// 2x2 block is unused, aside from the traditional crossed diagonals.
const GRID_POSITIONS: { rasi: number; row: number; col: number }[] = [
  { rasi: 11, row: 1, col: 1 }, // Pisces
  { rasi: 0, row: 1, col: 2 }, // Aries
  { rasi: 1, row: 1, col: 3 }, // Taurus
  { rasi: 2, row: 1, col: 4 }, // Gemini
  { rasi: 10, row: 2, col: 1 }, // Aquarius
  { rasi: 3, row: 2, col: 4 }, // Cancer
  { rasi: 9, row: 3, col: 1 }, // Capricorn
  { rasi: 4, row: 3, col: 4 }, // Leo
  { rasi: 8, row: 4, col: 1 }, // Sagittarius
  { rasi: 7, row: 4, col: 2 }, // Scorpio
  { rasi: 6, row: 4, col: 3 }, // Libra
  { rasi: 5, row: 4, col: 4 }, // Virgo
];

export function SouthIndianChart({ ascendantRasi, placement }: Props) {
  return (
    <div className="south-indian-grid">
      {/* Traditional crossed diagonals through the unused center block. */}
      <svg className="south-indian-cross" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="25" y1="25" x2="75" y2="75" />
        <line x1="75" y1="25" x2="25" y2="75" />
      </svg>
      {GRID_POSITIONS.map(({ rasi, row, col }) => (
        <RasiCell
          key={rasi}
          rasiIndex={rasi}
          houseNumber={houseOfRasi(rasi, ascendantRasi)}
          isAscendant={rasi === ascendantRasi}
          planets={placement[rasi] ?? []}
          style={{ gridRow: row, gridColumn: col }}
        />
      ))}
    </div>
  );
}
