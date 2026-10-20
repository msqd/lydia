import type { OverviewData } from "@msqd/lydia/Models";
import type { HistoryEndpoint } from "./HistorySection";

/**
 * Sample history data for stories, tests and the demo app. Presentation components take their
 * data as props; this fixture is the mock a consumer would otherwise fetch per time range, kept
 * out of the component. Excluded from the build and the published exports.
 */

// Generate time-aware data respecting the user's perspective of full days/hours.
const generateTimeRangeData = (timeRange: string) => {
  const now = new Date();
  const data: Array<{ datetime: string; count: number; errors: number; cached: number }> = [];

  const push = (time: Date, maxCount: number, minCount: number) => {
    const count = Math.floor(Math.random() * maxCount) + minCount;
    const errors = Math.floor(Math.random() * Math.floor(count * 0.15));
    const cached = Math.floor(Math.random() * Math.floor((count - errors) * 0.3));
    data.push({ datetime: time.toISOString(), count, errors, cached: Math.min(cached, count - errors) });
  };

  switch (timeRange) {
    case "1h": {
      const startTime = new Date(now);
      startTime.setMinutes(now.getMinutes() - 59, 0, 0);
      for (let i = 0; i < 60; i++) {
        const time = new Date(startTime);
        time.setMinutes(startTime.getMinutes() + i);
        push(time, 50, 1);
      }
      break;
    }
    case "7d": {
      const startTime = new Date(now);
      startTime.setDate(now.getDate() - 6);
      startTime.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const time = new Date(startTime);
        time.setDate(startTime.getDate() + i);
        push(time, 2000, 500);
      }
      break;
    }
    case "1m": {
      const startTime = new Date(now);
      startTime.setDate(now.getDate() - 29);
      startTime.setHours(0, 0, 0, 0);
      for (let i = 0; i < 30; i++) {
        const time = new Date(startTime);
        time.setDate(startTime.getDate() + i);
        push(time, 3000, 1000);
      }
      break;
    }
    default: {
      // 24h — last 24 hours, hour by hour.
      const startTime = new Date(now);
      startTime.setHours(now.getHours() - 23, 0, 0, 0);
      for (let i = 0; i < 24; i++) {
        const time = new Date(startTime);
        time.setHours(startTime.getHours() + i);
        push(time, 200, 10);
      }
    }
  }

  return data;
};

const overviewData = (timeRange: string): OverviewData => {
  const transactions = generateTimeRangeData(timeRange);
  const errors = transactions.reduce((sum, t) => sum + t.errors, 0);
  const count = transactions.reduce((sum, t) => sum + t.count, 0);

  return {
    meanDuration: 250,
    meanTpdex: 85,
    timeRange,
    count,
    errors: { count: errors, rate: count === 0 ? 0 : errors / count },
    transactions,
  };
};

const endpointNames = ["api-gateway", "auth-service", "user-service"];

/** Aggregated + per-endpoint history for a given time range. */
export const sampleHistoryData = (timeRange: string): { transactions: OverviewData; endpoints: HistoryEndpoint[] } => ({
  transactions: overviewData(timeRange),
  endpoints: endpointNames.map((name) => ({ name, data: overviewData(timeRange) })),
});
