import { describe, expect, it } from "vitest";
import { localWallClockToUtc, normalizeDegrees, weekdayIndexForDate } from "../../src/astro/util";

describe("normalizeDegrees", () => {
  it("wraps values above 360", () => {
    expect(normalizeDegrees(370)).toBe(10);
  });

  it("wraps negative values into 0-360", () => {
    expect(normalizeDegrees(-10)).toBe(350);
  });

  it("leaves in-range values unchanged", () => {
    expect(normalizeDegrees(180)).toBe(180);
  });
});

describe("localWallClockToUtc", () => {
  it("subtracts a positive offset (east of UTC)", () => {
    // 10:00 IST (+5:30) is 04:30 UTC.
    const utc = localWallClockToUtc("2024-01-01", "10:00", 5.5);
    expect(utc.toISOString()).toBe("2024-01-01T04:30:00.000Z");
  });

  it("adds a negative offset (west of UTC)", () => {
    // 10:00 PST (-8:00) is 18:00 UTC.
    const utc = localWallClockToUtc("2024-01-01", "10:00", -8);
    expect(utc.toISOString()).toBe("2024-01-01T18:00:00.000Z");
  });
});

describe("weekdayIndexForDate", () => {
  it("returns null for an empty string", () => {
    expect(weekdayIndexForDate("")).toBeNull();
  });

  it("matches the real calendar weekday (0=Sunday..6=Saturday)", () => {
    // 1979-06-29 is a Friday.
    expect(weekdayIndexForDate("1979-06-29")).toBe(5);
    // 2024-01-06 is a Saturday.
    expect(weekdayIndexForDate("2024-01-06")).toBe(6);
  });

  it("avoids the new Date(dateStr) UTC-parse trap", () => {
    // A "YYYY-MM-DD" string parses as UTC midnight per spec; calling
    // `new Date(dateStr).getDay()` on a machine set west of UTC would read
    // back the *previous* day locally. weekdayIndexForDate builds the date
    // from year/month/day parts instead, sidestepping that entirely -- this
    // should hold regardless of the test machine's own timezone.
    expect(weekdayIndexForDate("2024-01-01")).toBe(1); // Monday
  });
});
