import type { SummarySectionProps } from "./SummarySection";

/**
 * Sample summary data for stories, tests and the demo app. Presentation components take their
 * data as props; this fixture is the mock a consumer would otherwise fetch, kept out of the
 * component. Excluded from the build and the published exports.
 */

const hourlyPoints = (scale: number) =>
  Array.from({ length: 24 }, (_, i) => ({
    datetime: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
    value: Math.random() * scale,
  }));

export const sampleSummary: SummarySectionProps = {
  performance: {
    mean: 85,
    data: hourlyPoints(100),
  },
  transactions: {
    rate: 156,
    period: "h",
    data: hourlyPoints(200),
  },
  errors: {
    rate: 3,
    period: "h",
    data: hourlyPoints(10),
  },
};
