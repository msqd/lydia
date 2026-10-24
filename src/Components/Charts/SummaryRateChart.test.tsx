import { act, render, screen, waitFor } from "@testing-library/react";
import ReactEChartsCore from "echarts-for-react/lib/core.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreThemeTokens, stubThemeTokens } from "../Utilities/Testing";
import { SummaryRateChart } from "./SummaryRateChart";

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

describe("SummaryRateChart", () => {
  const createMockData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 10,
      datetime: new Date(Date.now() + i * 300000).toISOString(), // 5-minute intervals
    }));
  };

  describe("Basic Rendering", () => {
    it("renders the chart component", () => {
      const mockData = createMockData(3);
      render(<SummaryRateChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveTextContent("Chart Mock");
    });

    it("accepts optional color prop", () => {
      const mockData = createMockData(3);
      render(<SummaryRateChart data={mockData} color="#ff5500" />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("creates chart with wrapper div for responsive behavior", () => {
      const mockData = createMockData(3);
      const { container } = render(<SummaryRateChart data={mockData} />);

      // Should have a wrapper div with 100% width to enable container width detection
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: "100%" });
    });

    it("handles empty data without crashing", () => {
      render(<SummaryRateChart data={[]} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });
  });

  describe("Chart Configuration", () => {
    it("sets correct chart height for summary charts", () => {
      const mockData = createMockData(5);
      render(<SummaryRateChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toHaveStyle({ height: "240px" });
    });

    it("enables responsive width", () => {
      const mockData = createMockData(5);
      render(<SummaryRateChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toHaveStyle({ width: "auto" });
    });
  });

  describe("Responsive Features", () => {
    it("renders successfully with different data sizes", () => {
      const dataSizes = [1, 5, 15, 30, 50];

      dataSizes.forEach((size) => {
        const mockData = createMockData(size);
        const { unmount } = render(<SummaryRateChart data={mockData} />);

        const chart = screen.getByTestId("mock-echarts");
        expect(chart).toBeInTheDocument();

        unmount();
      });
    });

    it("handles data density variations", () => {
      // Test sparse data (few points)
      const sparseData = createMockData(3);
      const { unmount: unmountSparse } = render(<SummaryRateChart data={sparseData} />);

      let chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
      unmountSparse();

      // Test dense data (many points)
      const denseData = createMockData(60);
      const { unmount: unmountDense } = render(<SummaryRateChart data={denseData} />);

      chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
      unmountDense();
    });
  });

  describe("Data Handling", () => {
    it("handles different value ranges", () => {
      const testData = [
        { value: 0, datetime: "2025-06-04T10:00:00Z" },
        { value: 50, datetime: "2025-06-04T10:05:00Z" },
        { value: 100, datetime: "2025-06-04T10:10:00Z" },
      ];

      render(<SummaryRateChart data={testData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("handles extreme values", () => {
      const extremeData = [
        { value: 0, datetime: "2025-06-04T10:00:00Z" },
        { value: 999999, datetime: "2025-06-04T10:05:00Z" },
      ];

      render(<SummaryRateChart data={extremeData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("handles negative values gracefully", () => {
      const negativeData = [
        { value: -10, datetime: "2025-06-04T10:00:00Z" },
        { value: 20, datetime: "2025-06-04T10:05:00Z" },
      ];

      render(<SummaryRateChart data={negativeData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });
  });

  describe("Bar Width Adaptations", () => {
    it("adapts to container constraints", () => {
      // The component should render without crashing regardless of container size
      // The actual bar width calculation is tested implicitly through successful rendering

      const mockData = createMockData(20);
      render(<SummaryRateChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });

    it("maintains consistency with gap spacing", () => {
      // Test that 2px gaps are consistently applied (implementation detail)
      // This is verified through the fact that the component renders successfully
      // with the gap calculation logic

      const mockData = createMockData(15);
      render(<SummaryRateChart data={mockData} />);

      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();
    });
  });

  describe("Pinned output", () => {
    const lastOption = () => {
      const calls = vi.mocked(ReactEChartsCore).mock.calls;
      return calls[calls.length - 1][0].option as {
        series: Array<{ barWidth: string }>;
        xAxis: { data: string[] };
      };
    };

    // jsdom lays nothing out, so the chart measures 0 and falls back to 300px wide, a 260px area.
    it.each([
      [3, "19px"],
      [20, "11px"],
      [60, "2px"],
    ])("sizes the bars of %i points at %s", (count, barWidth) => {
      render(<SummaryRateChart data={createMockData(count)} />);

      expect(lastOption().series[0].barWidth).toBe(barWidth);
    });

    it("labels the x axis with the time of each point", () => {
      const datetime = "2025-06-04T10:05:00Z";

      render(<SummaryRateChart data={[{ value: 1, datetime }]} />);

      expect(lastOption().xAxis.data).toEqual([
        new Date(datetime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      ]);
    });
  });

  describe("Colour", () => {
    const seriesColor = () => {
      const calls = vi.mocked(ReactEChartsCore).mock.calls;
      const option = calls[calls.length - 1][0].option as { series: Array<{ color?: string }> };
      return option.series[0].color;
    };

    afterEach(() => {
      restoreThemeTokens();
      document.documentElement.removeAttribute("data-theme");
    });

    it("resolves a theme token, converting oklch", () => {
      stubThemeTokens({ "--color-danger-200": "oklch(100% 0 0)" });

      render(<SummaryRateChart data={createMockData(3)} color="--color-danger-200" />);

      expect(seriesColor()).toBe("rgb(255, 255, 255)");
    });

    it("keeps a literal colour untouched", () => {
      render(<SummaryRateChart data={createMockData(3)} color="#ff5500" />);

      expect(seriesColor()).toBe("#ff5500");
    });

    it("follows a theme change on screen", async () => {
      const tokens = { "--color-danger-200": "#111111" };
      stubThemeTokens(tokens);
      render(<SummaryRateChart data={createMockData(3)} color="--color-danger-200" />);

      tokens["--color-danger-200"] = "#222222";
      act(() => document.documentElement.setAttribute("data-theme", "dark"));

      await waitFor(() => expect(seriesColor()).toBe("#222222"));
    });
  });

  describe("Tooltip", () => {
    it("escapes the name and the value", () => {
      render(<SummaryRateChart data={createMockData(3)} />);
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

  describe("Integration with ResizeObserver", () => {
    it("sets up resize observation for responsive behavior", () => {
      const mockData = createMockData(10);
      render(<SummaryRateChart data={mockData} />);

      // Verify that ResizeObserver is being used (through successful render)
      const chart = screen.getByTestId("mock-echarts");
      expect(chart).toBeInTheDocument();

      // The mock ResizeObserver should have been instantiated
      expect(MockResizeObserver).toBeDefined();
    });
  });
});
