import { describe, expect, it } from "vitest";
import { degreeParts, formatDegree } from "../../src/astro/format";

describe("degreeParts", () => {
  it("splits a within-sign longitude into whole degrees and minutes", () => {
    // 43.5 degrees -> 13.5 degrees into the sign (Taurus) -> 13 deg 30 min.
    expect(degreeParts(43.5)).toEqual({ deg: 13, minText: "30" });
  });

  it("wraps a full-circle longitude down to its within-sign value", () => {
    // 380 degrees is 20 degrees into the 13th sign, i.e. wraps to 20 into Aries.
    expect(degreeParts(380)).toEqual({ deg: 20, minText: "00" });
  });

  it("wraps exactly 30 degrees (a full sign) down to 0 -- the Kavippu boundary case", () => {
    expect(degreeParts(30)).toEqual({ deg: 0, minText: "00" });
  });

  it("pads single-digit minutes with a leading zero", () => {
    // 0.1 degrees = 6 minutes.
    expect(degreeParts(0.1).minText).toBe("06");
  });
});

describe("formatDegree", () => {
  it("formats as deg°min'", () => {
    expect(formatDegree(43.5)).toBe("13°30'");
  });

  it("formats zero as 0°00'", () => {
    expect(formatDegree(0)).toBe("0°00'");
  });
});
