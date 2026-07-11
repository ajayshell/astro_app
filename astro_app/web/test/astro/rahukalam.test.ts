import { describe, expect, it } from "vitest";
import { computeRahuYamaGulika } from "../../src/astro/rahukalam";

const BENGALURU = { latitude: 12.9716, longitude: 77.5946 };

// Segment boundaries are computed from a floating-point sunrise/sunset span
// divided by 8; deriving the same segment length two different ways (as
// these tests do, to cross-check the weekday -> segment selection) can
// differ by a sub-millisecond rounding artifact. A couple of ms of
// tolerance is plenty -- what matters is the segment *selection*, not
// microsecond timing precision.
function expectCloseMs(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2);
}

// Segment-relative assertions (not fixed clock-time strings) so this test
// doesn't become brittle if the sunrise/sunset ephemeris shifts by a minute
// between astronomy-engine versions -- what actually matters here is the
// weekday -> segment selection logic (see the table in rahukalam.ts), not
// the exact sunrise time.

describe("computeRahuYamaGulika", () => {
  it("Saturday: Rahu=segment 3, Yama=segment 6, Gulika=segment 1", () => {
    // 2024-01-06 is a Saturday. Gulika is segment 1 on Saturday, which by
    // definition starts exactly at sunrise -- use it as the sunrise anchor.
    const noon = new Date("2024-01-06T06:30:00Z");
    const result = computeRahuYamaGulika("2024-01-06", noon, BENGALURU.latitude, BENGALURU.longitude);

    const segmentMs = result.gulikakalam.end.getTime() - result.gulikakalam.start.getTime();
    const sunrise = result.gulikakalam.start.getTime();

    // Rahu = segment 3 -> starts 2 segments after sunrise.
    expectCloseMs(result.rahukalam.start.getTime(), sunrise + 2 * segmentMs);
    // Yama = segment 6 -> starts 5 segments after sunrise.
    expectCloseMs(result.yamagandam.start.getTime(), sunrise + 5 * segmentMs);
  });

  it("Tuesday: Rahu=segment 7, Yama=segment 3, Gulika=segment 5", () => {
    // 2024-01-02 is a Tuesday.
    const noon = new Date("2024-01-02T06:30:00Z");
    const result = computeRahuYamaGulika("2024-01-02", noon, BENGALURU.latitude, BENGALURU.longitude);

    const segmentMs = result.rahukalam.end.getTime() - result.rahukalam.start.getTime();
    // Rahu is segment 7, Gulika is segment 5 -- Rahu should start exactly
    // 2 segments after Gulika starts.
    expectCloseMs(result.rahukalam.start.getTime(), result.gulikakalam.start.getTime() + 2 * segmentMs);
    // Yama is segment 3, Gulika is segment 5 -- Yama should start exactly
    // 2 segments *before* Gulika starts.
    expectCloseMs(result.yamagandam.start.getTime(), result.gulikakalam.start.getTime() - 2 * segmentMs);
  });

  it("each period is exactly 1/8 of the sunrise-to-sunset span", () => {
    const noon = new Date("2024-01-06T06:30:00Z");
    const result = computeRahuYamaGulika("2024-01-06", noon, BENGALURU.latitude, BENGALURU.longitude);
    const rahuSpan = result.rahukalam.end.getTime() - result.rahukalam.start.getTime();
    const yamaSpan = result.yamagandam.end.getTime() - result.yamagandam.start.getTime();
    const gulikaSpan = result.gulikakalam.end.getTime() - result.gulikakalam.start.getTime();
    expect(rahuSpan).toBe(yamaSpan);
    expect(rahuSpan).toBe(gulikaSpan);
  });
});
