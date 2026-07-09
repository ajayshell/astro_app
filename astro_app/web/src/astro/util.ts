export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Resolves a "YYYY-MM-DD" + "HH:mm" wall-clock reading at a fixed UTC offset into a true UTC instant. */
export function localWallClockToUtc(date: string, time: string, timezoneOffsetHours: number): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const localAsUtcMillis = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(localAsUtcMillis - timezoneOffsetHours * 60 * 60 * 1000);
}
