import { describe, expect, it } from "vitest";
import { computeJamagraha } from "../../src/astro/jamagraha";
import { RING_ORDER } from "../../src/astro/jamakol";

describe("computeJamagraha", () => {
  it("matches the rule's own worked example: 7:12pm on a Saturday", () => {
    // 2024-01-06 is a Saturday. hour12(19)=7, A=7-6=1, B=1*60+12=72, C=36, D=324.
    // 324 / 30 = 10 squares traversed, remainder 24 (the rule's own example
    // says "remainder of 8", which doesn't reconcile with D=324 -- 10*30=300,
    // 324-300=24, not 8; every other figure in the example matches exactly).
    const calc = computeJamagraha("2024-01-06", "19:12", RING_ORDER);
    expect(calc.weekdayIndex).toBe(6); // Saturday
    expect(calc.deity).toBe("Saturn");
    expect(calc.degree360).toBeCloseTo(324, 5);
    expect(calc.rasiIndex).toBe(10); // Aquarius
    expect(calc.degree).toBeCloseTo(24, 5);
    // Ring: 324 / 45 = 7.2 -> ring box 7 gets Saturn (canonical index 5),
    // so the whole sequence is rotated 6 steps forward.
    expect(calc.ringStart).toBe(6);
    expect(RING_ORDER[(7 + calc.ringStart) % 8]).toBe("Saturn");
  });

  it("uses the plain (unshifted) birth-date weekday, not a time-adjusted date", () => {
    // 2024-01-07 is a Sunday; a birth time before 6am still uses Sunday's lord (Sun).
    const calc = computeJamagraha("2024-01-07", "02:00", RING_ORDER);
    expect(calc.weekdayIndex).toBe(0);
    expect(calc.deity).toBe("Sun");
  });

  it("drops minutes from the hour - 6 step (A), only reintroducing them in B", () => {
    // hour12(9)=9, A=9-6=3, B=3*60+45=225, regardless of the 45 minutes
    // having no bearing on A itself.
    const calc = computeJamagraha("2024-01-08", "09:45", RING_ORDER);
    expect(calc.degree360).toBeCloseTo(360 - 225 / 2, 5);
  });

  it("normalizes cleanly when A goes non-positive (birth hour <= 6)", () => {
    // hour12(1)=1, A=1-6=-5, B=-5*60+0=-300, C=-150, D=360-(-150)=510 -> normalized 150.
    const calc = computeJamagraha("2024-01-08", "01:00", RING_ORDER);
    expect(calc.degree360).toBeCloseTo(150, 5);
  });

  it("ringStart rotates the rest of RING_ORDER's fixed cyclic order from the deity's box, not just that box", () => {
    const calc = computeJamagraha("2024-01-06", "19:12", RING_ORDER);
    const ringBoxIndex = Math.floor(calc.degree360 / 45) % 8;
    for (let p = 0; p < 8; p++) {
      const expectedCanonicalIndex = (RING_ORDER.indexOf(calc.deity) + (p - ringBoxIndex) + 8) % 8;
      expect(RING_ORDER[(p + calc.ringStart) % 8]).toBe(RING_ORDER[expectedCanonicalIndex]);
    }
  });
});
