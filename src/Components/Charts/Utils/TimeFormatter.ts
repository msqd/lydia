/**
 * Utility class for formatting time labels based on time range
 */
export class TimeFormatter {
  /**
   * Format tick labels based on time range
   */
  static formatTick(tick: string, timeRange?: string): string {
    const date = new Date(tick);

    switch (timeRange) {
      case "1h":
        // If time range is 1 hour, return time in minutes
        return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      case "24h":
        // If time range is 24 hours, return time in hours
        return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      case "7d":
        // If time range is 7 days, return short weekday, month, and day
        return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      case "1m":
        // If time range is 1 month, return short month and day
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      case "1y":
        // If time range is 1 year, return month and full year
        return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
      default:
        // By default return full date
        return date.toLocaleDateString();
    }
  }
}
