import { describe, expect, it } from "vitest";
import { computeUdayam } from "../../src/astro/udayam";

describe("computeUdayam", () => {
  // Clean synthetic case, easy to verify by hand: 12-hour daytime, reference
  // instant a quarter of the way in.
  const sunrise = new Date("2024-01-01T06:00:00Z");
  const sunset = new Date("2024-01-01T18:00:00Z"); // 720 minutes of daytime
  const reference = new Date("2024-01-01T09:00:00Z"); // 180 minutes after sunrise
  const sunLongitude = 100; // within Cancer (90-120)

  it("computes S, D, and degrees-forward correctly", () => {
    const calc = computeUdayam(reference, sunrise, sunset, sunLongitude);
    expect(calc.S).toBe(180); // minutes from sunrise
    expect(calc.daytimeMinutes).toBe(720);
    expect(calc.D).toBe(2); // minutes per degree
    expect(calc.degreesForward).toBe(90); // S / D
  });

  it("starts from the Sun's own longitude, not Aries 0 degrees", () => {
    const calc = computeUdayam(reference, sunrise, sunset, sunLongitude);
    // 100 + 90 = 190 degrees -> Libra (180-210), not "one sign forward from Cancer".
    expect(calc.destinationLongitude).toBe(190);
    expect(calc.rasiIndex).toBe(6); // Libra
  });

  it("S is an absolute value, symmetric before/after sunrise", () => {
    const before = computeUdayam(new Date("2024-01-01T03:00:00Z"), sunrise, sunset, sunLongitude);
    const after = computeUdayam(new Date("2024-01-01T09:00:00Z"), sunrise, sunset, sunLongitude);
    expect(before.S).toBe(after.S);
  });
});
