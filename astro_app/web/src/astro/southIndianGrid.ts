/**
 * Fixed South Indian layout: signs occupy fixed cells in a 4x4 grid, going
 * clockwise from Pisces (top-left) through Aries (top, 2nd cell). The middle
 * 2x2 block is unused, aside from a birth-details caption. Shared by the
 * South Indian chart component and the Jamakol page's inner grid, which uses
 * the same 4x4 shape (shifted to sit inside a larger surrounding grid).
 */
export const SOUTH_INDIAN_GRID_POSITIONS: { rasi: number; row: number; col: number }[] = [
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
