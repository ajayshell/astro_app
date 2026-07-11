import { describe, expect, it } from "vitest";
import { getDignity } from "../../src/astro/dignity";

describe("getDignity", () => {
  it("Sun is exalted in Aries", () => {
    expect(getDignity("Sun", 0)).toBe("exalted");
  });

  it("Sun is debilitated in Libra", () => {
    expect(getDignity("Sun", 6)).toBe("debilitated");
  });

  it("Jupiter is exalted in Cancer (the reference chart's Jupiter)", () => {
    expect(getDignity("Jupiter", 3)).toBe("exalted");
  });

  it("returns null for a planet in a sign with no special dignity", () => {
    expect(getDignity("Sun", 2)).toBeNull(); // Gemini
  });

  it("Rahu/Ketu are never marked exalted or debilitated (no agreed convention)", () => {
    for (let rasi = 0; rasi < 12; rasi++) {
      expect(getDignity("Rahu", rasi)).toBeNull();
      expect(getDignity("Ketu", rasi)).toBeNull();
    }
  });
});
