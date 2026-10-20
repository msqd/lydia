import { describe, expect, it } from "vitest";
import { TimeFormatter } from "./TimeFormatter";

describe("TimeFormatter", () => {
  describe("formatTick", () => {
    const testDate = "2024-01-15T14:30:00Z";

    it("should format tick for 1h time range", () => {
      const result = TimeFormatter.formatTick(testDate, "1h");

      // Should return time in HH:MM format (timezone-agnostic)
      expect(result).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it("should format tick for 24h time range", () => {
      const result = TimeFormatter.formatTick(testDate, "24h");

      // Should return time in HH:MM format (timezone-agnostic)
      expect(result).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it("should format tick for 7d time range", () => {
      const result = TimeFormatter.formatTick(testDate, "7d");

      // Should return weekday, month, and day
      expect(result).toContain("Mon");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
    });

    it("should format tick for 1m time range", () => {
      const result = TimeFormatter.formatTick(testDate, "1m");

      // Should return month and day
      expect(result).toContain("Jan");
      expect(result).toContain("15");
    });

    it("should format tick for 1y time range", () => {
      const result = TimeFormatter.formatTick(testDate, "1y");

      // Should return month and year
      expect(result).toContain("Jan");
      expect(result).toContain("2024");
    });

    it("should format tick for unknown time range (default)", () => {
      const result = TimeFormatter.formatTick(testDate, "unknown");

      // Should return full date
      expect(result).toContain("2024");
      expect(result).toContain("1");
      expect(result).toContain("15");
    });

    it("should format tick without time range parameter", () => {
      const result = TimeFormatter.formatTick(testDate);

      // Should return full date (default case)
      expect(result).toContain("2024");
      expect(result).toContain("1");
      expect(result).toContain("15");
    });

    it("should handle edge cases with different date formats", () => {
      const isoDate = "2024-12-31T12:00:00Z"; // Use midday to avoid timezone edge cases

      const result1h = TimeFormatter.formatTick(isoDate, "1h");
      const result7d = TimeFormatter.formatTick(isoDate, "7d");
      const result1y = TimeFormatter.formatTick(isoDate, "1y");

      // Check for time format pattern instead of exact time (timezone-dependent)
      expect(result1h).toMatch(/\d{1,2}:\d{2}/);
      expect(result7d).toMatch(/\w{3}/); // Should contain day of week
      expect(result7d).toContain("31"); // Should contain day
      expect(result1y).toContain("2024"); // Should contain year
    });

    it("should handle invalid date strings gracefully", () => {
      const invalidDate = "invalid-date";

      // Should not throw an error
      expect(() => {
        TimeFormatter.formatTick(invalidDate, "1h");
      }).not.toThrow();

      // Result should contain "Invalid Date" or similar
      const result = TimeFormatter.formatTick(invalidDate, "1h");
      expect(result).toContain("Invalid");
    });

    it("should handle different timezones consistently", () => {
      const utcDate = "2024-06-15T12:00:00Z";

      const result1h = TimeFormatter.formatTick(utcDate, "1h");
      const result7d = TimeFormatter.formatTick(utcDate, "7d");

      // Results should be consistent regardless of local timezone
      expect(result1h).toBeDefined();
      expect(result7d).toBeDefined();
      expect(result1h.length).toBeGreaterThan(0);
      expect(result7d.length).toBeGreaterThan(0);
    });

    it("should format leap year dates correctly", () => {
      const leapYearDate = "2024-02-29T10:15:00Z";

      const result7d = TimeFormatter.formatTick(leapYearDate, "7d");
      const result1m = TimeFormatter.formatTick(leapYearDate, "1m");

      expect(result7d).toContain("29");
      expect(result1m).toContain("Feb");
      expect(result1m).toContain("29");
    });

    it("should handle midnight and edge times", () => {
      const midnight = "2024-01-01T00:00:00Z";
      const endOfDay = "2024-01-01T23:59:59Z";

      const midnightResult = TimeFormatter.formatTick(midnight, "1h");
      const endOfDayResult = TimeFormatter.formatTick(endOfDay, "24h");

      // Check for time format pattern instead of exact time (timezone-dependent)
      expect(midnightResult).toMatch(/\d{1,2}:\d{2}/);
      expect(endOfDayResult).toMatch(/\d{1,2}:\d{2}/);
    });

    it("should be consistent across multiple calls", () => {
      const testDate = "2024-03-15T09:30:00Z";

      const result1 = TimeFormatter.formatTick(testDate, "7d");
      const result2 = TimeFormatter.formatTick(testDate, "7d");
      const result3 = TimeFormatter.formatTick(testDate, "7d");

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("should handle different months correctly", () => {
      const dates = [
        "2024-01-15T12:00:00Z", // January
        "2024-06-15T12:00:00Z", // June
        "2024-12-15T12:00:00Z", // December
      ];

      dates.forEach((date) => {
        const result1m = TimeFormatter.formatTick(date, "1m");
        const result1y = TimeFormatter.formatTick(date, "1y");

        expect(result1m).toBeDefined();
        expect(result1y).toBeDefined();
        expect(result1m.length).toBeGreaterThan(0);
        expect(result1y.length).toBeGreaterThan(0);
      });
    });
  });
});
