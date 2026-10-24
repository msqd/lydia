import { tpdexScale } from "@msqd/lydia/Models/Tpdex";
import { act, render, screen, waitFor } from "@testing-library/react";
import ReactEChartsCore from "echarts-for-react/lib/core.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreThemeTokens, stubThemeTokens } from "../Utilities/Testing";
import SummaryPerformancesChart from "./SummaryPerformancesChart";

// ECharts renders to a canvas, which jsdom does not provide. This is an environment boundary
// rather than a design-system component, so it stays mocked. See Testing.mdx, What to mock.
vi.mock("echarts-for-react/lib/core.js", () => ({
  default: vi.fn().mockImplementation(({ opts }) => (
    <div data-testid="mock-echarts" style={{ height: opts.height, width: opts.width }}>
      Chart Mock
    </div>
  )),
}));

describe("SummaryPerformancesChart", () => {
  const mockData = [
    { value: 95, datetime: "2025-06-04T10:00:00Z" },
    { value: 90, datetime: "2025-06-04T10:05:00Z" },
    { value: 85, datetime: "2025-06-04T10:10:00Z" },
  ];

  it("renders the chart component", () => {
    render(<SummaryPerformancesChart data={mockData} />);

    const chart = screen.getByTestId("mock-echarts");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveTextContent("Chart Mock");
  });

  it("labels the x axis with the time of each point", () => {
    render(<SummaryPerformancesChart data={mockData} />);

    const calls = vi.mocked(ReactEChartsCore).mock.calls;
    const option = calls[calls.length - 1][0].option as { xAxis: { data: string[] } };
    expect(option.xAxis.data).toEqual(
      mockData.map(({ datetime }) =>
        new Date(datetime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      ),
    );
  });

  describe("colours", () => {
    const lastVisualMap = () => {
      const calls = vi.mocked(ReactEChartsCore).mock.calls;
      return (calls[calls.length - 1][0].option as { visualMap: { outOfRange: { color: string } } }).visualMap;
    };

    const lastPieces = () => {
      const calls = vi.mocked(ReactEChartsCore).mock.calls;
      const option = calls[calls.length - 1][0].option as { visualMap: { pieces: Array<{ color: string }> } };
      return option.visualMap.pieces;
    };

    afterEach(() => {
      restoreThemeTokens();
      document.documentElement.removeAttribute("data-theme");
    });

    it("paints each TPDEX piece with its rating's theme token", () => {
      stubThemeTokens(Object.fromEntries(tpdexScale.map(({ token }, i) => [token, `#0${i}0000`])));

      render(<SummaryPerformancesChart data={mockData} />);

      expect(lastPieces().map((piece) => piece.color)).toEqual(tpdexScale.map((_, i) => `#0${i}0000`));
    });

    it("converts oklch tokens, which ECharts cannot parse", () => {
      stubThemeTokens(Object.fromEntries(tpdexScale.map(({ token }) => [token, "oklch(100% 0 0)"])));

      render(<SummaryPerformancesChart data={mockData} />);

      for (const piece of lastPieces()) expect(piece.color).toBe("rgb(255, 255, 255)");
    });

    it("paints out-of-range values with the out-of-range chart token", () => {
      stubThemeTokens({ "--color-chart-out-of-range": "#123456" });

      render(<SummaryPerformancesChart data={mockData} />);

      expect(lastVisualMap().outOfRange.color).toBe("#123456");
    });

    it("follows a theme change on screen", async () => {
      const tokens = Object.fromEntries(tpdexScale.map(({ token }) => [token, "#111111"]));
      stubThemeTokens(tokens);
      render(<SummaryPerformancesChart data={mockData} />);

      for (const { token } of tpdexScale) tokens[token] = "#222222";
      act(() => document.documentElement.setAttribute("data-theme", "dark"));

      await waitFor(() => expect(lastPieces()[0].color).toBe("#222222"));
    });
  });

  describe("Tooltip", () => {
    it("escapes the name and the value", () => {
      render(<SummaryPerformancesChart data={mockData} />);
      const calls = vi.mocked(ReactEChartsCore).mock.calls;
      const { tooltip } = calls[calls.length - 1][0].option as {
        tooltip: { formatter: (params: unknown[]) => string };
      };
      const hostile = "<img src=x onerror=alert(1)>";

      const html = tooltip.formatter([{ name: hostile, value: hostile }]);

      expect(html).toContain("&lt;img");
      expect(html).not.toContain("<img");
    });
  });
});
