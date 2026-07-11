import { describe, expect, it } from "vitest";
import { resolveTimezone } from "../../src/astro/timezone";

// La Jolla, CA -- America/Los_Angeles.
const LA_JOLLA = { latitude: 32.8328, longitude: -117.2713 };

describe("resolveTimezone", () => {
  it("resolves the IANA zone from coordinates", () => {
    const { zoneName } = resolveTimezone(LA_JOLLA.latitude, LA_JOLLA.longitude, "2024-01-15", "12:00");
    expect(zoneName).toBe("America/Los_Angeles");
  });

  it("resolves winter (PST, UTC-8) vs summer (PDT, UTC-7) correctly", () => {
    const winter = resolveTimezone(LA_JOLLA.latitude, LA_JOLLA.longitude, "2024-01-15", "12:00");
    const summer = resolveTimezone(LA_JOLLA.latitude, LA_JOLLA.longitude, "2024-07-15", "12:00");
    expect(winter.offsetHours).toBe(-8);
    expect(summer.offsetHours).toBe(-7);
  });

  it("resolves the correct HISTORICAL DST rule, not just today's rule", () => {
    // The US Energy Policy Act of 2005 (effective 2007) extended DST.
    // 2006-10-29, under the OLD rule, DST had already ended for the year.
    const oldRule = resolveTimezone(LA_JOLLA.latitude, LA_JOLLA.longitude, "2006-10-29", "12:00");
    // The same calendar date a year later, under the NEW rule, DST was
    // still in effect (it didn't end until Nov 4, 2007).
    const newRule = resolveTimezone(LA_JOLLA.latitude, LA_JOLLA.longitude, "2007-10-29", "12:00");

    expect(oldRule.offsetHours).toBe(-8); // PST -- DST already over
    expect(newRule.offsetHours).toBe(-7); // PDT -- DST still in effect
  });

  it("India never observes DST -- offset is always +5.5", () => {
    const winter = resolveTimezone(12.9716, 77.5946, "2024-01-15", "12:00");
    const summer = resolveTimezone(12.9716, 77.5946, "2024-07-15", "12:00");
    expect(winter.offsetHours).toBe(5.5);
    expect(summer.offsetHours).toBe(5.5);
  });
});
