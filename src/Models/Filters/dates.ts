const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A `YYYY-MM-DD` calendar day as local midnight. `new Date("YYYY-MM-DD")` reads UTC midnight instead,
 * which shifts the day for anyone west or far east of Greenwich. A string that is not a real day
 * answers undefined, so the caller treats it as no bound.
 */
export function parseLocalDay(day: string): Date | undefined {
  const match = DAY_PATTERN.exec(day);
  if (!match) {
    return undefined;
  }

  const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(year, month - 1, date);

  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === date
    ? parsed
    : undefined;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** The local calendar day of `now` as `YYYY-MM-DD`; `toISOString()` would give the UTC one. */
export function localToday(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
