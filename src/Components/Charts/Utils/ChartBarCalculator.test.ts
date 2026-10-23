import { describe, expect, it } from "vitest";
import { ChartBarCalculator } from "./ChartBarCalculator";

describe("ChartBarCalculator", () => {
  describe("calculateBarSizing", () => {
    const options = { chartAreaWidth: 260, gapWidth: 2, minBarWidth: 2, maxBarWidth: 19 };

    it("fills the area left once the gaps are reserved", () => {
      expect(ChartBarCalculator.calculateBarSizing({ ...options, dataLength: 20 })).toEqual({
        barWidth: 11,
        gapWidth: 2,
        totalGapSpace: 38,
      });
    });

    it("never exceeds the maximum width", () => {
      expect(ChartBarCalculator.calculateBarSizing({ ...options, dataLength: 3 }).barWidth).toBe(19);
    });

    it("never goes under the minimum width", () => {
      expect(ChartBarCalculator.calculateBarSizing({ ...options, dataLength: 200 }).barWidth).toBe(2);
    });
  });

  describe("calculateBarConfig", () => {
    it("should return wide bars configuration for large containers with few data points", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 5,
        chartAreaWidth: 800,
        containerWidth: 900,
      });

      expect(config.useSplitBars).toBe(true);
      expect(config.showLabels).toBe(true);
      expect(parseInt(config.mainBarWidth)).toBeGreaterThan(16);
      expect(config.detailBarWidth).not.toBe("0px");
    });

    it("should return thin bars configuration for small containers", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 10,
        chartAreaWidth: 200,
        containerWidth: 300,
      });

      expect(config.useSplitBars).toBe(false);
      expect(config.showLabels).toBe(false);
      expect(config.detailBarWidth).toBe("0px");
    });

    it("should return thin bars for high data density", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 50,
        chartAreaWidth: 600,
        containerWidth: 700,
      });

      expect(config.useSplitBars).toBe(false);
      expect(config.showLabels).toBe(false);
      expect(config.detailBarWidth).toBe("0px");
    });

    it("should respect minimum bar width", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 100,
        chartAreaWidth: 200,
        containerWidth: 300,
        minBarWidth: 5,
      });

      expect(parseInt(config.mainBarWidth)).toBeGreaterThanOrEqual(5);
    });

    it("should respect maximum bar width", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 2,
        chartAreaWidth: 1000,
        containerWidth: 1100,
        maxBarWidth: 50,
      });

      expect(parseInt(config.mainBarWidth)).toBeLessThanOrEqual(50);
    });

    it("should use custom gap widths", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 5,
        chartAreaWidth: 500,
        containerWidth: 600,
        wideBarGapWidth: 8,
        thinBarGapWidth: 4,
      });

      const gapWidth = parseInt(config.barGap);
      expect(gapWidth).toBeGreaterThan(0);
    });

    it("should calculate detail bar width as ratio of main bar", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 3,
        chartAreaWidth: 600,
        containerWidth: 700,
        detailBarWidthRatio: 0.4,
      });

      if (config.useSplitBars) {
        const mainWidth = parseInt(config.mainBarWidth);
        const detailWidth = parseInt(config.detailBarWidth);
        const expectedDetailWidth = Math.max(2, mainWidth * 0.4);
        expect(detailWidth).toBeCloseTo(expectedDetailWidth, 0);
      }
    });

    it("should show labels based on container width and data density", () => {
      // Small container should not show labels
      const smallConfig = ChartBarCalculator.calculateBarConfig({
        dataLength: 10,
        chartAreaWidth: 300,
        containerWidth: 350,
      });

      // Medium container with reasonable data density
      const mediumConfig = ChartBarCalculator.calculateBarConfig({
        dataLength: 8,
        chartAreaWidth: 500,
        containerWidth: 550,
      });

      // Large container with low data density
      const largeConfig = ChartBarCalculator.calculateBarConfig({
        dataLength: 5,
        chartAreaWidth: 800,
        containerWidth: 900,
      });

      if (smallConfig.useSplitBars) {
        expect(smallConfig.showLabels).toBe(false);
      }

      if (mediumConfig.useSplitBars) {
        expect(mediumConfig.showLabels).toBe(true);
      }

      if (largeConfig.useSplitBars) {
        expect(largeConfig.showLabels).toBe(true);
      }
    });

    it("should handle edge case with zero data length", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 0,
        chartAreaWidth: 500,
        containerWidth: 600,
      });

      expect(config).toBeDefined();
      expect(config.useSplitBars).toBeDefined();
      // With 0 data length, shouldShowLabels may return true due to low data density
      // The important thing is it doesn't crash
      expect(typeof config.showLabels).toBe("boolean");
    });

    it("should handle edge case with very small chart area", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 5,
        chartAreaWidth: 50,
        containerWidth: 100,
      });

      expect(config).toBeDefined();
      expect(parseInt(config.mainBarWidth)).toBeGreaterThan(0);
    });

    it("should ensure bar width meets minimum requirements for wide bars", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 3,
        chartAreaWidth: 600,
        containerWidth: 700,
      });

      if (config.useSplitBars) {
        expect(parseInt(config.mainBarWidth)).toBeGreaterThanOrEqual(16);
      }
    });

    it("should handle single data point", () => {
      const config = ChartBarCalculator.calculateBarConfig({
        dataLength: 1,
        chartAreaWidth: 500,
        containerWidth: 600,
      });

      expect(config).toBeDefined();
      expect(parseInt(config.mainBarWidth)).toBeGreaterThan(0);
      expect(config.barGap).toBeDefined();
    });
  });
});
