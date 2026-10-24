import { act, render, screen, waitFor } from "@testing-library/react";
import ReactEChartsCore from "echarts-for-react/lib/core.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreThemeTokens, stubThemeTokens } from "../Utilities/Testing";
import TransactionsChart from "./TransactionsChart";

// ECharts renders to a canvas, which jsdom does not provide. This is an environment boundary
// rather than a design-system component, so it stays mocked. See Testing.mdx, What to mock.
vi.mock("echarts-for-react/lib/core.js", () => ({
  default: vi.fn().mockImplementation(({ opts }) => (
    <div data-testid="mock-echarts" style={{ height: opts.height, width: opts.width }}>
      Chart Mock
    </div>
  )),
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
global.ResizeObserver = MockResizeObserver as any;

describe("TransactionsChart", () => {
  const createMockData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      datetime: new Date(Date.now() + i * 3600000).toISOString(),
      count: Math.floor(Math.random() * 100) + 50,
      errors: Math.floor(Math.random() * 10),
      cached: Math.floor(Math.random() * 20),
    }));
  };

  describe("Basic Rendering", () => {
    it("renders the chart component", () => {
      const mockData = createMockData(3);
      render(<TransactionsChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveTextContent("Chart Mock");
    });

    it("accepts timeRange prop", () => {
      const mockData = createMockData(3);
      render(<TransactionsChart data={mockData} timeRange="24h" />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("creates chart with wrapper div for responsive behavior", () => {
      const mockData = createMockData(3);
      const { container } = render(<TransactionsChart data={mockData} />);

      // Should have a wrapper div with 100% width to enable container width detection
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: "100%" });
    });

    it("handles empty data without crashing", () => {
      render(<TransactionsChart data={[]} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });
  });

  describe("Responsive Features", () => {
    it("renders successfully with different data sizes", () => {
      const dataSizes = [1, 5, 20, 60, 100];

      dataSizes.forEach((size) => {
        const mockData = createMockData(size);
        const { unmount } = render(<TransactionsChart data={mockData} />);

        const chart = screen.getByTestId("mock-echarts");
        expect(chart).toBeInTheDocument();

        unmount();
      });
    });

    it("renders with different time ranges", () => {
      const mockData = createMockData(10);
      const timeRanges = ["1h", "24h", "7d", "1m", "1y"];

      timeRanges.forEach((timeRange) => {
        const { unmount } = render(<TransactionsChart data={mockData} timeRange={timeRange} />);

        const chart = screen.getByTestId("mock-echarts");
        expect(chart).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Chart Configuration", () => {
    it("sets correct chart height", () => {
      const mockData = createMockData(5);
      render(<TransactionsChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toHaveStyle({ height: "300px" });
    });

    it("enables responsive width", () => {
      const mockData = createMockData(5);
      render(<TransactionsChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toHaveStyle({ width: "auto" });
    });
  });

  describe("Theme colours", () => {
    const themed = (shade: string) => ({
      "--color-chart-transactions": shade,
      "--color-danger-200": shade,
      "--color-success-200": shade,
      "--color-chart-rest": shade,
      "--color-chart-label": shade,
    });

    const lastOption = () => {
      const calls = vi.mocked(ReactEChartsCore).mock.calls;
      return calls[calls.length - 1][0].option as { series: Array<{ color?: string; label?: { color?: string } }> };
    };

    afterEach(() => {
      restoreThemeTokens();
      document.documentElement.removeAttribute("data-theme");
    });

    it("paints every series, and the labels, from theme tokens", () => {
      stubThemeTokens(themed("oklch(100% 0 0)"));

      render(<TransactionsChart data={createMockData(3)} />);

      const { series } = lastOption();
      for (const serie of series) expect(serie.color).toBe("rgb(255, 255, 255)");
      expect(series[0].label?.color).toBe("rgb(255, 255, 255)");
    });

    it("follows a theme change on screen", async () => {
      const tokens = themed("#111111");
      stubThemeTokens(tokens);
      render(<TransactionsChart data={createMockData(3)} />);

      for (const token of Object.keys(tokens)) tokens[token as keyof typeof tokens] = "#222222";
      act(() => document.documentElement.setAttribute("data-theme", "dark"));

      await waitFor(() => expect(lastOption().series.map((serie) => serie.color)).toContain("#222222"));
      expect(lastOption().series.every((serie) => serie.color === "#222222")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles data with zero counts", () => {
      const mockData = [
        {
          datetime: new Date().toISOString(),
          count: 0,
          errors: 0,
          cached: 0,
        },
      ];

      render(<TransactionsChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("handles data with high error rates", () => {
      const mockData = [
        {
          datetime: new Date().toISOString(),
          count: 100,
          errors: 90, // 90% error rate
          cached: 5,
        },
      ];

      render(<TransactionsChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("handles data with errors exceeding total count", () => {
      const mockData = [
        {
          datetime: new Date().toISOString(),
          count: 50,
          errors: 100, // More errors than total
          cached: 20,
        },
      ];

      render(<TransactionsChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });
  });
});
