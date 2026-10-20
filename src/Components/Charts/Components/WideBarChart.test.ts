import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { OverviewTransaction } from "../../../Models";
import { restoreThemeTokens, stubThemeTokens } from "../../Utilities/Testing";
import type { BarConfiguration } from "../Utils/ChartBarCalculator";
import { chartColorTokens } from "../Utils/ChartColors";
import { createWideBarSeries } from "./WideBarChart";

describe("WideBarChart", () => {
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
    mainBarWidth: "30px",
    detailBarWidth: "8px",
    showLabels: true,
    useSplitBars: true,
    calculatedWidth: 30,
    barGap: "4px",
  };

  const labelOption = {
    show: true,
    rotate: 90,
    formatter: "{c}",
    fontSize: 12,
    color: "#065f9f",
    rich: { name: {} },
  };

  describe("createWideBarSeries", () => {
    it("should create four series for wide bar chart", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      expect(series).toHaveLength(4);
      expect(series[0].name).toBe("transactions");
      expect(series[1].name).toBe("errors");
      expect(series[2].name).toBe("cached");
      expect(series[3].name).toBe("rest");
    });

    it("should use correct bar widths for main and detail bars", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const transactionsSeries = series[0];
      const detailSeries = series.slice(1);

      expect(transactionsSeries.barWidth).toBe("30px");
      expect(transactionsSeries.barGap).toBe("4px");

      detailSeries.forEach((seriesItem) => {
        expect(seriesItem.barWidth).toBe("8px");
        expect(seriesItem.barGap).toBe("0");
      });
    });

    it("should stack detail bars together", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const detailSeries = series.slice(1); // errors, cached, rest

      detailSeries.forEach((seriesItem) => {
        expect(seriesItem.stack).toBe("details");
      });

      // Main transactions bar should not have a stack
      expect(series[0].stack).toBeUndefined();
    });

    it("should show labels on main bar when configured", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const transactionsSeries = series[0];
      expect(transactionsSeries.label).toEqual(labelOption);
    });

    it("should not show labels when showLabels is false", () => {
      const configWithoutLabels = { ...sampleBarConfig, showLabels: false };

      const series = createWideBarSeries({
        data: sampleData,
        barConfig: configWithoutLabels,
        labelOption,
      });

      const transactionsSeries = series[0];
      expect(transactionsSeries.label).toEqual({ show: false });
    });

    it("should not show labels when labelOption is not provided", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
      });

      const transactionsSeries = series[0];
      expect(transactionsSeries.label).toEqual({ show: false });
    });

    it("should map transaction count data correctly", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const transactionsSeries = series.find((s) => s.name === "transactions");
      expect(transactionsSeries?.data).toEqual([100, 200, 150]);
      expect(transactionsSeries?.color).toBe(themed.transactions);
    });

    it("should map error data correctly", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const errorSeries = series.find((s) => s.name === "errors");
      expect(errorSeries?.data).toEqual([5, 20, 10]);
      expect(errorSeries?.color).toBe(themed.errors);
    });

    it("should map cached data correctly", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const cachedSeries = series.find((s) => s.name === "cached");
      expect(cachedSeries?.data).toEqual([25, 50, 30]);
      expect(cachedSeries?.color).toBe(themed.cached);
    });

    it("should calculate rest data correctly", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const restSeries = series.find((s) => s.name === "rest");

      // rest = count - errors - cached
      const expectedData = [
        100 - 5 - 25, // 70
        200 - 20 - 50, // 130
        150 - 10 - 30, // 110
      ];

      expect(restSeries?.data).toEqual(expectedData);
      expect(restSeries?.color).toBe(themed.rest);
    });

    it("should handle zero values correctly", () => {
      const zeroData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 0, errors: 0, cached: 0 },
        { datetime: "2024-01-01T01:00:00Z", count: 50, errors: 0, cached: 0 },
      ];

      const series = createWideBarSeries({
        data: zeroData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      expect(series[0].data).toEqual([0, 50]); // transactions
      expect(series[1].data).toEqual([0, 0]); // errors
      expect(series[2].data).toEqual([0, 0]); // cached
      expect(series[3].data).toEqual([0, 50]); // rest
    });

    it("should handle edge case where errors + cached > count", () => {
      const edgeData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 100, errors: 60, cached: 50 }, // 110 > 100
      ];

      const series = createWideBarSeries({
        data: edgeData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const restSeries = series.find((s) => s.name === "rest");
      // Should use Math.max(0, ...) to prevent negative values
      expect(restSeries?.data).toEqual([0]); // Math.max(0, 100 - 60 - 50) = 0
    });

    it("should handle empty data array", () => {
      const series = createWideBarSeries({
        data: [],
        barConfig: sampleBarConfig,
        labelOption,
      });

      expect(series).toHaveLength(4);
      series.forEach((seriesItem) => {
        expect(seriesItem.data).toEqual([]);
      });
    });

    it("should paint with the colours it is given instead of resolving the theme", () => {
      const colors = { transactions: "#aaa", errors: "#bbb", cached: "#ccc", rest: "#ddd", label: "#eee" };

      const series = createWideBarSeries({ data: sampleData, barConfig: sampleBarConfig, labelOption, colors });

      expect(series.map((s) => s.color)).toEqual(["#aaa", "#bbb", "#ccc", "#ddd"]);
    });

    it("should use correct colors for visual distinction", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      const transactionsSeries = series.find((s) => s.name === "transactions");
      const errorSeries = series.find((s) => s.name === "errors");
      const cachedSeries = series.find((s) => s.name === "cached");
      const restSeries = series.find((s) => s.name === "rest");

      expect(transactionsSeries?.color).toBe(themed.transactions);
      expect(errorSeries?.color).toBe(themed.errors);
      expect(cachedSeries?.color).toBe(themed.cached);
      expect(restSeries?.color).toBe(themed.rest);
    });

    it("should maintain correct series types", () => {
      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      series.forEach((seriesItem) => {
        expect(seriesItem.type).toBe("bar");
      });
    });

    it("should handle large numbers correctly", () => {
      const largeData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 1000000, errors: 50000, cached: 300000 },
      ];

      const series = createWideBarSeries({
        data: largeData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      expect(series[0].data).toEqual([1000000]); // transactions
      expect(series[1].data).toEqual([50000]); // errors
      expect(series[2].data).toEqual([300000]); // cached
      expect(series[3].data).toEqual([650000]); // rest (1000000 - 50000 - 300000)
    });

    it("should preserve data order", () => {
      const orderedData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 10, errors: 1, cached: 2 },
        { datetime: "2024-01-01T01:00:00Z", count: 20, errors: 3, cached: 4 },
        { datetime: "2024-01-01T02:00:00Z", count: 30, errors: 5, cached: 6 },
      ];

      const series = createWideBarSeries({
        data: orderedData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      expect(series[0].data).toEqual([10, 20, 30]); // transactions in order
      expect(series[1].data).toEqual([1, 3, 5]); // errors in order
      expect(series[2].data).toEqual([2, 4, 6]); // cached in order
      expect(series[3].data).toEqual([7, 13, 19]); // rest in order
    });

    it("should handle partial label configuration", () => {
      const partialLabelOption = {
        show: true,
        rotate: 0,
        formatter: "{c}",
        fontSize: 10,
        color: "#000000",
        rich: {},
      };

      const series = createWideBarSeries({
        data: sampleData,
        barConfig: sampleBarConfig,
        labelOption: partialLabelOption,
      });

      const transactionsSeries = series[0];
      expect(transactionsSeries.label).toEqual(partialLabelOption);
    });

    it("should work with single data point", () => {
      const singleData: OverviewTransaction[] = [
        { datetime: "2024-01-01T00:00:00Z", count: 100, errors: 10, cached: 30 },
      ];

      const series = createWideBarSeries({
        data: singleData,
        barConfig: sampleBarConfig,
        labelOption,
      });

      expect(series[0].data).toEqual([100]); // transactions
      expect(series[1].data).toEqual([10]); // errors
      expect(series[2].data).toEqual([30]); // cached
      expect(series[3].data).toEqual([60]); // rest (100 - 10 - 30)
    });
  });
});
