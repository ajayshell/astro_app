/**
 * Soorya Veedhi marking for the Jamakol chart's inner D1 grid.
 *
 * Rule (as given in rules/soorya_veedhi.txt): the 12 rasis split into three
 * groups of four (excluding Mesha/Rishaba/Mithuna's own "home" role as
 * targets):
 *   Group 1 "mesha veedhi"   -- Rishaba, Mithuna, Kadaga, Simha   -> target Mesha
 *   Group 2 "rishaba raasi"  -- Kanni, Thula, Meena, Mesha        -> target Rishaba
 *   Group 3 "mithuna veedhi" -- Virchigam, Dhanush, Magara, Kumba -> target Mithuna
 * (This is a clean partition of all 12 signs, each appearing in exactly one
 * group.)
 *
 * - Find natal (D1) Surya's rasi, and which group it falls in.
 * - Count from Aarudom's rasi, clockwise (increasing zodiacal order), to the
 *   group's target rasi -- that count is the Soorya Veedhi Count (SVC).
 * - Count from Udayam's rasi, clockwise, SVC squares -- the sign landed on
 *   gets marked "Kavippu".
 *
 * Counting convention: inclusive -- the starting sign counts as 1, same as
 * the Aarudom rule (see aarudom.ts). Confirmed by the astrologer for both
 * counting steps here.
 */

const MESHA = 0;
const RISHABA = 1;
const MITHUNA = 2;

const GROUP_1_MESHA_VEEDHI = [1, 2, 3, 4]; // Rishaba, Mithuna, Kadaga, Simha
const GROUP_2_RISHABA_RAASI = [5, 6, 11, 0]; // Kanni, Thula, Meena, Mesha
const GROUP_3_MITHUNA_VEEDHI = [7, 8, 9, 10]; // Virchigam, Dhanush, Magara, Kumba

function targetRasiForSurya(suryaRasi: number): number {
  if (GROUP_1_MESHA_VEEDHI.includes(suryaRasi)) return MESHA;
  if (GROUP_2_RISHABA_RAASI.includes(suryaRasi)) return RISHABA;
  if (GROUP_3_MITHUNA_VEEDHI.includes(suryaRasi)) return MITHUNA;
  return MITHUNA; // unreachable -- the three groups partition all 12 rasis
}

// Inclusive clockwise count: `from` itself is count 1, the next sign
// clockwise is 2, ... up to `to`. Always resolves to a value 1-12.
function countClockwiseInclusive(from: number, to: number): number {
  return ((to - from + 12) % 12) + 1;
}

export interface SooryaVeedhiCalc {
  suryaRasi: number;
  targetRasi: number; // Mesha, Rishaba, or Mithuna, per Surya's group
  svc: number; // Soorya Veedhi Count
  kavippuRasi: number; // final marked square
}

export function computeSooryaVeedhi(suryaRasi: number, aarudomRasi: number, udayamRasi: number): SooryaVeedhiCalc {
  const targetRasi = targetRasiForSurya(suryaRasi);
  const svc = countClockwiseInclusive(aarudomRasi, targetRasi);
  const kavippuRasi = (udayamRasi + svc - 1) % 12;
  return { suryaRasi, targetRasi, svc, kavippuRasi };
}
