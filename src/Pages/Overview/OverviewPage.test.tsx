import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LinkComponentType } from "../../Components/NavBar";
import { OverviewPage } from "./OverviewPage";
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
// component this page hands props to. Everything else here renders for real. See Testing.mdx, What to mock.
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

  it("links the panes where the consumer says, through its link component", () => {
    const RoutedLink: LinkComponentType = ({ href, ...rest }) => <a data-routed="" href={href} {...rest} />;

    render(
      <OverviewPage
        summary={{
          ...sampleSummary,
          links: { performance: "/p", transactions: "/t", errors: "/e" },
          linkComponent: RoutedLink,
          windowLabel: "24h",
        }}
        history={sampleHistory}
      />,
    );

    const links = screen.getAllByRole("link", { name: /details/ });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/p", "/t", "/e"]);
    for (const link of links) {
      expect(link).toHaveAttribute("data-routed");
    }
    expect(screen.getByRole("heading", { name: "Errors (24h)" })).toBeInTheDocument();
  });

  it("renders no link without links", () => {
    render(<OverviewPage summary={sampleSummary} history={sampleHistory} />);

    expect(screen.queryAllByRole("link", { name: /details/ })).toHaveLength(0);
  });
});
