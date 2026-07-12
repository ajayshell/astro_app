export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Resolves a "YYYY-MM-DD" + "HH:mm" or "HH:mm:ss" wall-clock reading at a fixed UTC offset into a true UTC instant. */
export function localWallClockToUtc(date: string, time: string, timezoneOffsetHours: number): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  const localAsUtcMillis = Date.UTC(year, month - 1, day, hour, minute, second || 0);
  return new Date(localAsUtcMillis - timezoneOffsetHours * 60 * 60 * 1000);
}

// Weekday index (0 = Sunday .. 6 = Saturday) for a "YYYY-MM-DD" date string,
// or null if not yet filled in. Built from the parts directly (not
// `new Date(dateStr)`) so the calendar date isn't shifted by a day in
// timezones where that string would otherwise be parsed as UTC midnight.
export function weekdayIndexForDate(dateStr: string): number | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getDay();
}
