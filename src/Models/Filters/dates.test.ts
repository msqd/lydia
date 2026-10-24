import { afterEach, describe, expect, it } from "vitest";
import { localToday, parseLocalDay } from "./dates";

const originalTimeZone = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTimeZone;
});

describe("parseLocalDay", () => {
  it.each(["America/New_York", "Pacific/Kiritimati", "UTC"])("reads a day as local midnight in %s", (zone) => {
    process.env.TZ = zone;

    const parsed = parseLocalDay("2025-05-05");

    expect([parsed?.getFullYear(), parsed?.getMonth(), parsed?.getDate(), parsed?.getHours()]).toEqual([2025, 4, 5, 0]);
  });

  it.each(["", "not a date", "2025-5-5", "2025-02-30", "2025-13-01", "2025-05-05T10:00:00"])(
    "answers undefined for %j",
    (value) => {
      expect(parseLocalDay(value)).toBeUndefined();
    },
  );
});

describe("localToday", () => {
  it("is the local calendar day, not the UTC one", () => {
    process.env.TZ = "America/New_York";
    // 02:00 UTC on the 6th is still the evening of the 5th in New York.
    expect(localToday(new Date("2025-05-06T02:00:00Z"))).toBe("2025-05-05");

    process.env.TZ = "Pacific/Kiritimati";
    // 22:00 UTC on the 5th is already the 6th in UTC+14.
    expect(localToday(new Date("2025-05-05T22:00:00Z"))).toBe("2025-05-06");
  });

  it("defaults to the current time", () => {
    expect(localToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
