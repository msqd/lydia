import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { OverviewTransaction } from "../../../Models";
import { restoreThemeTokens, stubThemeTokens } from "../../Utilities/Testing";
import type { BarConfiguration } from "../Utils/ChartBarCalculator";
import { chartColorTokens } from "../Utils/ChartColors";
import { createThinBarSeries } from "./ThinBarChart";

describe("ThinBarChart", () => {
  const themed = {
    transactions: "#101010",
    errors: "#202020",
    cached: "#303030",
    rest: "#404040",
    label: "#505050",
  };

  beforeEach(() => {
    stubThemeTokens(
      Object.fromEntries(
        Object.entries(chartColorTokens).map(([key, token]) => [token, themed[key as keyof typeof themed]]),
      ),
    );
  });

  afterEach(restoreThemeTokens);

  const sampleData: OverviewTransaction[] = [
    { datetime: "2024-01-01T00:00:00Z", count: 100, errors: 5, cached: 25 },
    { datetime: "2024-01-01T01:00:00Z", count: 200, errors: 20, cached: 50 },
    { datetime: "2024-01-01T02:00:00Z", count: 150, errors: 10, cached: 30 },
  ];

  const sampleBarConfig: BarConfiguration = {
    mainBarWidth: "20px",
    detailBarWidth: "0px",
    showLabels: false,
    useSplitBars: false,
    calculatedWidth: 20,
    barGap: "2px",
  };

  describe("createThinBarSeries", () => {
    it("should create three series for thin bar chart", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });

      expect(series).toHaveLength(3);
      expect(series[0].name).toBe("errors");
      expect(series[1].name).toBe("cached");
      expect(series[2].name).toBe("successful");
    });

    it("should use stacked configuration for all series", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });

      series.forEach((seriesItem) => {
        expect(seriesItem.stack).toBe("total");
        expect(seriesItem.type).toBe("bar");
      });
    });

    it("should use correct bar width from config", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });

      series.forEach((seriesItem) => {
        expect(seriesItem.barWidth).toBe(sampleBarConfig.mainBarWidth);
        // barGap is only set on the first series in the array, not all series
        if (seriesItem === series[0]) {
          expect(seriesItem.barGap).toBe(sampleBarConfig.barGap);
        }
      });
    });

    it("should never show labels in thin bar mode", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });

      series.forEach((seriesItem) => {
        expect(seriesItem.label.show).toBe(false);
      });
    });

    it("should map error data correctly", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });
      const errorSeries = series.find((s) => s.name === "errors");

      expect(errorSeries?.data).toEqual([5, 20, 10]);
      expect(errorSeries?.color).toBe(themed.errors);
    });

    it("should map cached data correctly", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });
      const cachedSeries = series.find((s) => s.name === "cached");

      expect(cachedSeries?.data).toEqual([25, 50, 30]);
      expect(cachedSeries?.color).toBe(themed.cached);
    });

    it("should calculate successful transactions correctly", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });
      const successfulSeries = series.find((s) => s.name === "successful");

      // successful = count - errors - cached
      const expectedData = [
        100 - 5 - 25, // 70
        200 - 20 - 50, // 130
        150 - 10 - 30, // 110
      ];

      expect(successfulSeries?.data).toEqual(expectedData);
      expect(successfulSeries?.color).toBe(themed.transactions);
    });

    it("should handle zero values correctly", () => {
      const zeroData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 0, errors: 0, cached: 0 },
        { datetime: "2024-01-01T01:00:00Z", count: 50, errors: 0, cached: 0 },
      ];

      const series = createThinBarSeries({ data: zeroData, barConfig: sampleBarConfig });

      expect(series[0].data).toEqual([0, 0]); // errors
      expect(series[1].data).toEqual([0, 0]); // cached
      expect(series[2].data).toEqual([0, 50]); // successful
    });

    it("should handle edge case where errors + cached > count", () => {
      const edgeData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 100, errors: 60, cached: 50 }, // 110 > 100
      ];

      const series = createThinBarSeries({ data: edgeData, barConfig: sampleBarConfig });
      const successfulSeries = series.find((s) => s.name === "successful");

      // Should use Math.max(0, ...) to prevent negative values
      expect(successfulSeries?.data).toEqual([0]); // Math.max(0, 100 - 60 - 50) = 0
    });

    it("should handle empty data array", () => {
      const series = createThinBarSeries({ data: [], barConfig: sampleBarConfig });

      expect(series).toHaveLength(3);
      series.forEach((seriesItem) => {
        expect(seriesItem.data).toEqual([]);
      });
    });

    it("should maintain correct stacking order", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });

      // Order should be: errors (bottom), cached (middle), successful (top)
      expect(series[0].name).toBe("errors");
      expect(series[1].name).toBe("cached");
      expect(series[2].name).toBe("successful");

      // All should have the same stack name for proper stacking
      series.forEach((seriesItem) => {
        expect(seriesItem.stack).toBe("total");
      });
    });

    it("should paint with the colours it is given instead of resolving the theme", () => {
      const colors = { transactions: "#aaa", errors: "#bbb", cached: "#ccc", rest: "#ddd", label: "#eee" };

      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig, colors });

      expect(series.map((s) => s.color)).toEqual(["#bbb", "#ccc", "#aaa"]);
    });

    it("should use correct colors for visual distinction", () => {
      const series = createThinBarSeries({ data: sampleData, barConfig: sampleBarConfig });

      const errorSeries = series.find((s) => s.name === "errors");
      const cachedSeries = series.find((s) => s.name === "cached");
      const successfulSeries = series.find((s) => s.name === "successful");

      expect(errorSeries?.color).toBe(themed.errors);
      expect(cachedSeries?.color).toBe(themed.cached);
      expect(successfulSeries?.color).toBe(themed.transactions);
    });

    it("should handle large numbers correctly", () => {
      const largeData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 1000000, errors: 50000, cached: 300000 },
      ];

      const series = createThinBarSeries({ data: largeData, barConfig: sampleBarConfig });

      expect(series[0].data).toEqual([50000]); // errors
      expect(series[1].data).toEqual([300000]); // cached
      expect(series[2].data).toEqual([650000]); // successful (1000000 - 50000 - 300000)
    });

    it("should preserve data order", () => {
      const orderedData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 10, errors: 1, cached: 2 },
        { datetime: "2024-01-01T01:00:00Z", count: 20, errors: 3, cached: 4 },
        { datetime: "2024-01-01T02:00:00Z", count: 30, errors: 5, cached: 6 },
      ];

      const series = createThinBarSeries({ data: orderedData, barConfig: sampleBarConfig });

      expect(series[0].data).toEqual([1, 3, 5]); // errors in order
      expect(series[1].data).toEqual([2, 4, 6]); // cached in order
      expect(series[2].data).toEqual([7, 13, 19]); // successful in order
    });
  });
});
