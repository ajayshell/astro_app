import { describe, expect, it } from "vitest";
import { computeSooryaVeedhi } from "../../src/astro/sooryaVeedhi";

const ARIES = 0,
  GEMINI = 2,
  LEO = 4;

describe("computeSooryaVeedhi", () => {
  it("matches the worked example from PROJECT_BRIEF.md (1979-06-29 08:21 Bengaluru)", () => {
    // Surya in Gemini (Mithuna) -> group 1 -> target Mesha. Aarudom = Leo.
    // SVC = count clockwise inclusive Leo -> Mesha = 9. Udayam = Leo.
    // Kavippu = Leo + 9 - 1 = Mesha (Aries).
    const result = computeSooryaVeedhi(GEMINI, LEO, 6, LEO);
    expect(result.targetRasi).toBe(ARIES);
    expect(result.svc).toBe(9);
    expect(result.kavippuRasi).toBe(ARIES);
    expect(result.kavippuDegree).toBe(24); // 30 - 6
  });

  it("Kavippu degree formula is 30 minus Aarudom's degree", () => {
    const result = computeSooryaVeedhi(GEMINI, LEO, 10, LEO);
    expect(result.kavippuDegree).toBe(20);
  });

  it("boundary: Aarudom at exactly 0 degrees gives Kavippu degree 30 (unwrapped -- display layer wraps it)", () => {
    const result = computeSooryaVeedhi(GEMINI, LEO, 0, LEO);
    expect(result.kavippuDegree).toBe(30);
  });

  it("every rasi falls into exactly one of the three veedhi groups", () => {
    // Group membership is a partition -- verify no rasi is silently
    // unhandled by checking the target is always one of Mesha/Rishaba/Mithuna.
    for (let suryaRasi = 0; suryaRasi < 12; suryaRasi++) {
      const result = computeSooryaVeedhi(suryaRasi, 0, 0, 0);
      expect([0, 1, 2]).toContain(result.targetRasi);
    }
  });

  it("SVC counting is inclusive (starting sign counts as 1, range 1-12)", () => {
    // Aarudom == target sign itself -> count is 1, not 0.
    const result = computeSooryaVeedhi(GEMINI, ARIES, 0, ARIES);
    expect(result.svc).toBe(1);
  });
});
