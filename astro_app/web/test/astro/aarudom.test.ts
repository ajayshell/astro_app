import { describe, expect, it } from "vitest";
import { computeAarudom } from "../../src/astro/aarudom";

const ARIES = 0,
  TAURUS = 1,
  LEO = 4,
  VIRGO = 5,
  PISCES = 11;

describe("computeAarudom", () => {
  it("21 minutes -> Ad=126 -> Leo at 6 degrees", () => {
    expect(computeAarudom(21)).toEqual({ rasiIndex: LEO, degree: 6 });
  });

  it("resolves the :00-minutes edge case cleanly: Ad=0 -> Aries at 0 degrees", () => {
    expect(computeAarudom(0)).toEqual({ rasiIndex: ARIES, degree: 0 });
  });

  it("boundary at an exact multiple of 5 (25 min) advances to the next sign at 0 degrees", () => {
    // Ad = 150, exactly 5 x 30 -- lands at the start of Virgo, not the end of Leo.
    expect(computeAarudom(25)).toEqual({ rasiIndex: VIRGO, degree: 0 });
  });

  it("boundary at 5 minutes -> Taurus at 0 degrees", () => {
    expect(computeAarudom(5)).toEqual({ rasiIndex: TAURUS, degree: 0 });
  });

  it("59 minutes (max) -> Pisces at 24 degrees", () => {
    expect(computeAarudom(59)).toEqual({ rasiIndex: PISCES, degree: 24 });
  });
});
