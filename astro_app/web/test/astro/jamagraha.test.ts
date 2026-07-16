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
    expect(calc.rasiIndex).toBe(10); // Aquarius (the rule's own example says "Cap" here, likely a leftover slip -- see jamagraha.ts header)
    expect(calc.degree).toBeCloseTo(24, 5);
    // Aquarius's outward step is blank (not a real ring box); the next real
    // box continuing anticlockwise is ring box 1, which is also where a
    // direct "Cap" reading would have landed -- both readings agree here.
    expect(calc.ringStart).toBe(4);
    expect(RING_ORDER[(1 + calc.ringStart) % 8]).toBe("Saturn");
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

  it("normalizes cleanly when A goes non-positive (birth hour <= 6) and lands on a sign with a direct ring box (Virgo)", () => {
    // hour12(1)=1, A=1-6=-5, B=-5*60+0=-300, C=-150, D=360-(-150)=510 -> normalized 150 -> Virgo.
    const calc = computeJamagraha("2024-01-08", "01:00", RING_ORDER);
    expect(calc.degree360).toBeCloseTo(150, 5);
    expect(calc.rasiIndex).toBe(5); // Virgo
  });

  it("lands on a sign whose outward step is blank (Leo) and anchors at the next real ring box", () => {
    // hour12(2)=2, A=2-6=-4, B=-240, C=-120, D=360-(-120)=480 -> normalized 120 -> Leo.
    const calc = computeJamagraha("2024-01-08", "02:00", RING_ORDER);
    expect(calc.rasiIndex).toBe(4); // Leo
    // Leo's outward step is blank; the next real ring box anticlockwise is box 5.
    expect(RING_ORDER[(5 + calc.ringStart) % 8]).toBe(calc.deity);
  });

  it("matches the confirmed real-world example: 11:14:16am Sunday in Krishnagiri (Libra, direct ring box)", () => {
    // hour12(11)=11, A=5, B=5*60+14+16/60=314.2667, C=157.1333, D=202.8667.
    const calc = computeJamagraha("2026-07-12", "11:14:16", RING_ORDER);
    expect(calc.weekdayIndex).toBe(0); // Sunday
    expect(calc.deity).toBe("Sun");
    expect(calc.degree360).toBeCloseTo(202.8667, 3);
    expect(calc.rasiIndex).toBe(6); // Libra
    expect(RING_ORDER[(3 + calc.ringStart) % 8]).toBe("Sun");
  });

  it("folds seconds into B as a fractional minute (2026-07-15 fix: seconds were being silently dropped)", () => {
    // Hand-checked by the user: hour12(11:39:38am)=11, A=5,
    // B = 5*60 + 39 + 38/60 = 339.6333, C = 169.8167, D = 190.1833
    // (190 degrees, 0.1833*60 = 11.0 minutes -- the app had been showing
    // 190deg 30' by computing B = 339 exactly, dropping the 38 seconds).
    const calc = computeJamagraha("2026-07-14", "11:39:38", RING_ORDER);
    expect(calc.degree360).toBeCloseTo(190.1833, 3);
  });

  it("ringStart rotates the rest of RING_ORDER's fixed cyclic order from the deity's anchor box, not just that box", () => {
    const calc = computeJamagraha("2024-01-06", "19:12", RING_ORDER);
    const anchorBoxIndex = 1;
    for (let p = 0; p < 8; p++) {
      const expectedCanonicalIndex = (RING_ORDER.indexOf(calc.deity) + (p - anchorBoxIndex) + 8) % 8;
      expect(RING_ORDER[(p + calc.ringStart) % 8]).toBe(RING_ORDER[expectedCanonicalIndex]);
    }
  });

  it("anchors a different weekday's deity at whichever ring box its own InnerHomeDSq resolves to (Tuesday -> Mars, Libra -> ring box 3)", () => {
    // 2024-01-09 is a Tuesday. hour12(12)=12, A=6, B=360, C=180, D=180 -> Libra (direct, ring box 3).
    const calc = computeJamagraha("2024-01-09", "12:00", RING_ORDER);
    expect(calc.deity).toBe("Mars");
    expect(calc.rasiIndex).toBe(6); // Libra
    expect(RING_ORDER[(3 + calc.ringStart) % 8]).toBe("Mars");
  });

  it("ringDegrees anchors at D for the deity's box and decreases by 45 anticlockwise per box, per the rule's worked values (Saturn 324, Moon 279, Snake 234, ...)", () => {
    const calc = computeJamagraha("2024-01-06", "19:12", RING_ORDER);
    expect(calc.ringDegrees[1]).toBeCloseTo(324, 5); // Saturn's box
    expect(calc.ringDegrees[2]).toBeCloseTo(279, 5); // Moon's box
    expect(calc.ringDegrees[3]).toBeCloseTo(234, 5); // Snake/Maandi's box
    expect(calc.ringDegrees[4]).toBeCloseTo(189, 5); // Sun's box
    expect(calc.ringDegrees[5]).toBeCloseTo(144, 5); // Mars's box
    expect(calc.ringDegrees[6]).toBeCloseTo(99, 5); // Jupiter's box
    expect(calc.ringDegrees[7]).toBeCloseTo(54, 5); // Mercury's box
    expect(calc.ringDegrees[0]).toBeCloseTo(9, 5); // Venus's box
  });
});
