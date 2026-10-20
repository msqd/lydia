import { describe, expect, it } from "vitest";
import type { OverviewTransaction } from "../../../Models";
import { ChartTooltipFormatter } from "./ChartTooltipFormatter";

describe("ChartTooltipFormatter", () => {
  describe("formatSplitBarsTooltip", () => {
    it("should format tooltip for split bars with all data", () => {
      const params = [
        { name: "Jan 1", value: 100 },
        { name: "Jan 1", value: 10 },
        { name: "Jan 1", value: 30 },
      ];

      const result = ChartTooltipFormatter.formatSplitBarsTooltip(params);

      expect(result).toContain("<strong>Jan 1</strong>");
      expect(result).toContain("Transactions: 100");
      expect(result).toContain("Cached: 30");
      expect(result).toContain("30"); // percentage value
      expect(result).toContain("Errors: 10");
      expect(result).toContain("10"); // percentage value
    });

    it("should handle zero transactions", () => {
      const params = [
        { name: "Jan 1", value: 0 },
        { name: "Jan 1", value: 0 },
        { name: "Jan 1", value: 0 },
      ];

      const result = ChartTooltipFormatter.formatSplitBarsTooltip(params);

      expect(result).toContain("<strong>Jan 1</strong>");
      expect(result).toContain("No transactions");
    });

    it("should handle missing cached/error series", () => {
      const params = [{ name: "Jan 1", value: 100 }];

      const result = ChartTooltipFormatter.formatSplitBarsTooltip(params);

      expect(result).toContain("<strong>Jan 1</strong>");
      expect(result).toContain("Transactions: 100");
      expect(result).toContain("Cached: 0");
      expect(result).toContain("Errors: 0");
    });

    it("should calculate percentages correctly", () => {
      const params = [
        { name: "Test", value: 200 },
        { name: "Test", value: 50 }, // 25% errors
        { name: "Test", value: 60 }, // 30% cached
      ];

      const result = ChartTooltipFormatter.formatSplitBarsTooltip(params);

      expect(result).toContain("Errors: 50");
      expect(result).toContain("25"); // percentage value
      expect(result).toContain("Cached: 60");
      expect(result).toContain("30"); // percentage value
    });
  });

  describe("formatUnifiedBarsTooltip", () => {
    const sampleData: OverviewTransaction[] = [
      { datetime: "2024-01-01T00:00:00Z", count: 100, errors: 5, cached: 25 },
      { datetime: "2024-01-01T01:00:00Z", count: 200, errors: 20, cached: 50 },
      { datetime: "2024-01-01T02:00:00Z", count: 0, errors: 0, cached: 0 },
    ];

    it("should format tooltip for unified bars", () => {
      const params = [{ name: "Jan 1", value: 100, dataIndex: 0 }];

      const result = ChartTooltipFormatter.formatUnifiedBarsTooltip(params, sampleData);

      expect(result).toContain("<strong>Jan 1</strong>");
      expect(result).toContain("Transactions: 100");
      expect(result).toContain("Cached: 25");
      expect(result).toContain("25"); // percentage value
      expect(result).toContain("Errors: 5");
      expect(result).toContain("5"); // percentage value
    });

    it("should handle zero transactions in unified format", () => {
      const params = [{ name: "Jan 3", value: 0, dataIndex: 2 }];

      const result = ChartTooltipFormatter.formatUnifiedBarsTooltip(params, sampleData);

      expect(result).toContain("<strong>Jan 3</strong>");
      expect(result).toContain("Transactions: 0");
    });

    it("should handle missing dataIndex", () => {
      const params = [{ name: "Unknown", value: 100 }];

      const result = ChartTooltipFormatter.formatUnifiedBarsTooltip(params, sampleData);

      expect(result).toContain("<strong>Unknown</strong>");
      expect(result).toContain("No data available");
    });

    it("should handle invalid dataIndex", () => {
      const params = [{ name: "Invalid", value: 100, dataIndex: 999 }];

      const result = ChartTooltipFormatter.formatUnifiedBarsTooltip(params, sampleData);

      expect(result).toContain("<strong>Invalid</strong>");
      expect(result).toContain("No data available");
    });

    it("should calculate percentages correctly for unified bars", () => {
      const params = [{ name: "Jan 2", value: 200, dataIndex: 1 }];

      const result = ChartTooltipFormatter.formatUnifiedBarsTooltip(params, sampleData);

      expect(result).toContain("Errors: 20");
      expect(result).toContain("10"); // percentage value
      expect(result).toContain("Cached: 50");
      expect(result).toContain("25"); // percentage value
    });
  });

  describe("formatTooltipFromData", () => {
    it("should format tooltip from direct data object", () => {
      const data = {
        name: "Test Period",
        count: 150,
        errors: 15,
        cached: 45,
      };

      const result = ChartTooltipFormatter.formatTooltipFromData(data);

      expect(result).toContain("<strong>Test Period</strong>");
      expect(result).toContain("Transactions: 150");
      expect(result).toContain("Cached: 45");
      expect(result).toContain("30"); // percentage value
      expect(result).toContain("Errors: 15");
      expect(result).toContain("10"); // percentage value
    });

    it("should handle zero count in direct data", () => {
      const data = {
        name: "Empty Period",
        count: 0,
        errors: 0,
        cached: 0,
      };

      const result = ChartTooltipFormatter.formatTooltipFromData(data);

      expect(result).toContain("<strong>Empty Period</strong>");
      expect(result).toContain("No transactions");
    });

    it("should handle edge case with errors/cached but no total count", () => {
      const data = {
        name: "Edge Case",
        count: 0,
        errors: 5,
        cached: 10,
      };

      const result = ChartTooltipFormatter.formatTooltipFromData(data);

      expect(result).toContain("No transactions");
    });

    it("should format percentages with proper precision", () => {
      const data = {
        name: "Precision Test",
        count: 300,
        errors: 1, // 0.333...%
        cached: 100, // 33.333...%
      };

      const result = ChartTooltipFormatter.formatTooltipFromData(data);

      expect(result).toContain("Errors: 1");
      expect(result).toContain("0.3"); // decimal percentage value (en-US format)
      expect(result).toContain("Cached: 100");
      expect(result).toContain("33.3"); // decimal percentage value (en-US format)
    });
  });

  describe("percentage calculations", () => {
    it("should handle division by zero gracefully", () => {
      const params = [
        { name: "Zero", value: 0 },
        { name: "Zero", value: 5 },
        { name: "Zero", value: 10 },
      ];

      const result = ChartTooltipFormatter.formatSplitBarsTooltip(params);

      expect(result).toContain("No transactions");
    });

    it("should format very small percentages correctly", () => {
      const data = {
        name: "Small Percentage",
        count: 10000,
        errors: 1,
        cached: 1,
      };

      const result = ChartTooltipFormatter.formatTooltipFromData(data);

      expect(result).toContain("Errors: 1");
      expect(result).toContain("0.0"); // very small percentage (en-US format)
      expect(result).toContain("Cached: 1");
    });

    it("should format 100% correctly", () => {
      const data = {
        name: "Full Cache",
        count: 100,
        errors: 0,
        cached: 100,
      };

      const result = ChartTooltipFormatter.formatTooltipFromData(data);

      expect(result).toContain("Cached: 100");
      expect(result).toContain("100.0"); // 100% formatted (en-US format)
      expect(result).toContain("Errors: 0");
      expect(result).toContain("0.0"); // 0% formatted (en-US format)
    });
  });
});
