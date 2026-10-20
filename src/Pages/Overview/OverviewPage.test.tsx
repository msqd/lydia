import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OverviewPage from "./OverviewPage";
import { sampleHistoryData } from "./Sections/HistorySection.samples";
import { sampleSummary } from "./Sections/SummarySection.samples";

const sampleHistory = { timeRange: "7d", onTimeRangeChange: () => {}, ...sampleHistoryData("7d") };

/**
 * Note: We avoid snapshot testing for components that include ECharts
 * because ECharts instances generate unique IDs on every render,
 * making snapshots unstable and unreliable.
 */

// The charts are mocked because ECharts renders to a canvas jsdom does not provide, and its
// instance ids make snapshots unstable. That is an environment boundary, not a design-system
// component this page hands props to. Everything else here renders for real. See #56.
vi.mock("@msqd/lydia/Components/Charts", () => ({
  SummaryPerformancesChart: () => (
    <div data-testid="summary-performances-chart" data-chart-type="performances">
      Mocked SummaryPerformancesChart
    </div>
  ),
  SummaryRateChart: () => (
    <div data-testid="summary-rate-chart" data-chart-type="rate">
      Mocked SummaryRateChart
    </div>
  ),
  TransactionsChart: () => (
    <div data-testid="transactions-chart" data-chart-type="transactions">
      Mocked TransactionsChart
    </div>
  ),
}));

describe("OverviewPage", () => {
  it("renders the Summary and History sections", () => {
    const { container } = render(<OverviewPage summary={sampleSummary} history={sampleHistory} />);

    // Verify the Summary section exists - look for the specific heading
    const summaryHeading = screen.getByRole("heading", { name: /summary/i });
    expect(summaryHeading).toBeInTheDocument();

    // Verify the main container exists
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<OverviewPage summary={sampleSummary} history={sampleHistory} />);
    expect(container).toBeInTheDocument();
  });

  it("renders mocked chart components", () => {
    render(<OverviewPage summary={sampleSummary} history={sampleHistory} />);

    // Verify that chart components are rendered (mocked versions)
    // Use getAllByTestId to handle multiple elements with same testid
    const summaryPerformancesCharts = screen.queryAllByTestId("summary-performances-chart");
    const summaryRateCharts = screen.queryAllByTestId("summary-rate-chart");
    const transactionsCharts = screen.queryAllByTestId("transactions-chart");

    // At least one chart should be present (depending on the implementation)
    const hasCharts =
      summaryPerformancesCharts.length > 0 || summaryRateCharts.length > 0 || transactionsCharts.length > 0;
    expect(hasCharts).toBe(true);
  });

  it("links the errors to the transactions filtered on the 5 class and failures", () => {
    render(<OverviewPage summary={sampleSummary} history={sampleHistory} />);

    const hrefs = screen.getAllByRole("link", { name: /details/ }).map((link) => link.getAttribute("href") ?? "");
    const statuses = hrefs.flatMap((href) => new URL(href, "http://localhost").searchParams.getAll("status"));

    expect(hrefs).toContain("/transactions?status=5&status=failure");
    expect(statuses.length).toBeGreaterThan(0);
    for (const status of statuses) {
      expect(status).toMatch(/^(?:[1-5]|[1-5]\d\d|failure)$/);
    }
  });
});
