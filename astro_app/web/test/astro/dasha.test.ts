import { describe, expect, it } from "vitest";
import { computeVimshottariDasha, moonNakshatraIndex } from "../../src/astro/dasha";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

describe("moonNakshatraIndex", () => {
  it("returns 0 for the Moon at 0 degrees (start of Ashwini)", () => {
    expect(moonNakshatraIndex(0)).toBe(0);
  });

  it("wraps into 0-26", () => {
    expect(moonNakshatraIndex(359.9)).toBe(26);
  });
});

describe("computeVimshottariDasha", () => {
  const birth = new Date("1979-06-29T02:51:00Z");

  it("one full cycle (9 mahadashas) spans 120 years total", () => {
    // Moon at the very start of a nakshatra -- no partial-balance shortening
    // of the first Dasha, so the full cycle should sum to exactly 120 years.
    const periods = computeVimshottariDasha(0, birth, 1);
    const totalMs = periods[periods.length - 1].end.getTime() - periods[0].start.getTime();
    expect(totalMs / MS_PER_YEAR).toBeCloseTo(120, 5);
  });

  it("produces 9 mahadashas per cycle", () => {
    const periods = computeVimshottariDasha(0, birth, 1);
    expect(periods).toHaveLength(9);
  });

  it("each mahadasha has 9 bhuktis, each bhukti has 9 antharams", () => {
    const periods = computeVimshottariDasha(0, birth, 1);
    expect(periods[0].subPeriods).toHaveLength(9);
    expect(periods[0].subPeriods[0].subPeriods).toHaveLength(9);
  });

  it("periods are contiguous -- each one starts exactly where the last ended", () => {
    const periods = computeVimshottariDasha(0, birth, 1);
    for (let i = 1; i < periods.length; i++) {
      expect(periods[i].start.getTime()).toBe(periods[i - 1].end.getTime());
    }
  });

  it("a Moon partway through its birth nakshatra shortens the first Dasha proportionally", () => {
    const atStart = computeVimshottariDasha(0, birth, 1);
    const halfway = computeVimshottariDasha(360 / 27 / 2, birth, 1); // halfway through Ashwini
    const firstSpanAtStart = atStart[0].end.getTime() - atStart[0].start.getTime();
    const firstSpanHalfway = halfway[0].end.getTime() - halfway[0].start.getTime();
    expect(firstSpanHalfway).toBeCloseTo(firstSpanAtStart / 2, -6); // within ~a few seconds
  });
});
