/**
 * Divisional (varga) chart placement rules.
 *
 * Implemented so far, using standard single-tradition Parashari rules that are
 * unambiguous: D1 (Rasi), D2 (Hora), D3 (Drekkana), D9 (Navamsa),
 * D10 (Dashamsa), D12 (Dwadashamsa).
 *
 * NOT yet implemented: D4, D6, D7, D16, D20, D24, D27, D30, D40, D45, D60.
 * Several of these have more than one traditional counting method (e.g. D3 has
 * a Parashari and a Somnath variant) -- these need the astrologer to confirm
 * which rule to encode before we guess. See PROJECT_BRIEF.md roadmap.
 *
 * All functions take a sidereal longitude (0-360) and return a 0-11 rasi index.
 */

export type VargaKind = "D1" | "D2" | "D3" | "D9" | "D10" | "D12";

export const IMPLEMENTED_VARGAS: VargaKind[] = ["D1", "D2", "D3", "D9", "D10", "D12"];

export const PENDING_VARGAS = [
  "D4", "D6", "D7", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
] as const;

function rasiOf(siderealLongitude: number): number {
  return Math.floor(siderealLongitude / 30) % 12;
}

function degreeInSign(siderealLongitude: number): number {
  return siderealLongitude % 30;
}

export function d1Rasi(siderealLongitude: number): number {
  return rasiOf(siderealLongitude);
}

/** D2 Hora: each half-sign maps to either Leo (Sun's hora, index 4) or Cancer (Moon's hora, index 3). */
export function d2Rasi(siderealLongitude: number): number {
  const rasi = rasiOf(siderealLongitude);
  const isOddSign = rasi % 2 === 0; // rasi 0 = Aries = 1st sign = odd
  const half = degreeInSign(siderealLongitude) < 15 ? 0 : 1;
  const sunHora = 4; // Leo
  const moonHora = 3; // Cancer
  if (isOddSign) return half === 0 ? sunHora : moonHora;
  return half === 0 ? moonHora : sunHora;
}

/** D3 Drekkana: thirds of a sign map to itself, the 5th, and the 9th sign from it. */
export function d3Rasi(siderealLongitude: number): number {
  const rasi = rasiOf(siderealLongitude);
  const part = Math.floor(degreeInSign(siderealLongitude) / 10); // 0,1,2
  return (rasi + part * 4) % 12;
}

/**
 * D9 Navamsa: ninths of a sign (3d20m each). Counting start depends on the
 * modality of the birth sign, which collapses to this closed form:
 * navamsaRasi = (rasi*9 + navamsaIndex) mod 12.
 */
export function d9Rasi(siderealLongitude: number): number {
  const rasi = rasiOf(siderealLongitude);
  const navamsaIndex = Math.floor(degreeInSign(siderealLongitude) / (30 / 9)); // 0-8
  return (rasi * 9 + navamsaIndex) % 12;
}

/** D10 Dashamsa: tenths of a sign (3 deg each). Odd signs start from themselves, even signs from the 9th sign from them. */
export function d10Rasi(siderealLongitude: number): number {
  const rasi = rasiOf(siderealLongitude);
  const part = Math.floor(degreeInSign(siderealLongitude) / 3); // 0-9
  const isOddSign = rasi % 2 === 0;
  const start = isOddSign ? rasi : (rasi + 8) % 12;
  return (start + part) % 12;
}

/** D12 Dwadashamsa: twelfths of a sign (2.5 deg each), always counted from the sign itself. */
export function d12Rasi(siderealLongitude: number): number {
  const rasi = rasiOf(siderealLongitude);
  const part = Math.floor(degreeInSign(siderealLongitude) / 2.5); // 0-11
  return (rasi + part) % 12;
}

export function computeVarga(kind: VargaKind, siderealLongitude: number): number {
  switch (kind) {
    case "D1": return d1Rasi(siderealLongitude);
    case "D2": return d2Rasi(siderealLongitude);
    case "D3": return d3Rasi(siderealLongitude);
    case "D9": return d9Rasi(siderealLongitude);
    case "D10": return d10Rasi(siderealLongitude);
    case "D12": return d12Rasi(siderealLongitude);
  }
}
