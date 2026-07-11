import { describe, expect, it } from "vitest";
import { computeChart } from "../../src/astro/charts";
import type { BirthInput } from "../../src/astro/types";

// 1979-06-29 08:21 IST, Bengaluru -- the chart the astrologer used to catch
// a real Ascendant bug (a 180-degree flip: Lagna was being placed on the
// 7th-house cusp instead). This is the single most important regression
// test in this suite: if it ever fails, the Ascendant fix has regressed and
// every whole-sign house in the app would be wrong again.
const KNOWN_CHART: BirthInput = {
  name: "test",
  date: "1979-06-29",
  time: "08:21",
  latitude: 12.9716,
  longitude: 77.5946,
  timezoneOffsetHours: 5.5,
};

const TAURUS = 1,
  GEMINI = 2,
  CANCER = 3,
  LEO = 4;

describe("computeChart", () => {
  it("places the Ascendant in Cancer, not Capricorn (the 180-degree bug)", () => {
    const chart = computeChart(KNOWN_CHART);
    expect(chart.ascendantRasi).toBe(CANCER);
  });

  it("matches known planet signs for the reference chart", () => {
    const chart = computeChart(KNOWN_CHART);
    const rasiOf = (planet: string) => chart.planets.find((p) => p.planet === planet)?.rasi;

    expect(rasiOf("Sun")).toBe(GEMINI);
    expect(rasiOf("Moon")).toBe(LEO);
    expect(rasiOf("Mars")).toBe(TAURUS);
    expect(rasiOf("Mercury")).toBe(CANCER);
    expect(rasiOf("Jupiter")).toBe(CANCER);
    expect(rasiOf("Venus")).toBe(TAURUS);
    expect(rasiOf("Saturn")).toBe(LEO);
  });

  it("matches known planet degrees within a fraction of a degree", () => {
    const chart = computeChart(KNOWN_CHART);
    const degreeOf = (planet: string) => {
      const p = chart.planets.find((p) => p.planet === planet)!;
      return p.siderealLongitude % 30;
    };

    expect(degreeOf("Sun")).toBeCloseTo(13.22, 0);
    expect(degreeOf("Moon")).toBeCloseTo(4.77, 0);
    expect(degreeOf("Jupiter")).toBeCloseTo(16.82, 0);
  });

  it("Rahu and Ketu are always exactly 180 degrees apart", () => {
    const chart = computeChart(KNOWN_CHART);
    const rahu = chart.planets.find((p) => p.planet === "Rahu")!;
    const ketu = chart.planets.find((p) => p.planet === "Ketu")!;
    const diff = Math.abs(rahu.siderealLongitude - ketu.siderealLongitude);
    expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 1);
  });

  it("is deterministic -- same input always gives the same chart", () => {
    const a = computeChart(KNOWN_CHART);
    const b = computeChart(KNOWN_CHART);
    expect(a.ascendantSiderealLongitude).toBe(b.ascendantSiderealLongitude);
    expect(a.planets).toEqual(b.planets);
  });
});
