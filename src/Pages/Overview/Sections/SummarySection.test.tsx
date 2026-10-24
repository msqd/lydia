import { render, screen } from "@testing-library/react";
import ReactEChartsCore from "echarts-for-react/lib/core.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LinkComponentType } from "../../../Components/NavBar";
import { restoreThemeTokens, stubThemeTokens } from "../../../Components/Utilities/Testing";
import { SummarySection } from "./SummarySection";

// ECharts renders to a canvas, which jsdom does not provide. See Testing.mdx, What to mock.
vi.mock("echarts-for-react/lib/core.js", () => ({
  default: vi.fn().mockImplementation(() => <div data-testid="mock-echarts" />),
}));

const rate = { rate: 3, period: "h", data: [{ datetime: "2025-06-04T10:00:00Z", value: 3 }] };

describe("SummarySection", () => {
  afterEach(restoreThemeTokens);

  it("draws the Errors chart in the danger colour its ring uses, so retheming danger moves both", () => {
    stubThemeTokens({ "--color-danger-200": "#aa0000" });

    const { container } = render(
      <SummarySection performance={{ mean: 90, data: [] }} transactions={rate} errors={rate} />,
    );

    expect(container.querySelector("[class*='ring-danger-']")).toHaveClass("ring-danger-200");
    const colours = vi
      .mocked(ReactEChartsCore)
      .mock.calls.map(([props]) => (props.option as { series: Array<{ color?: string }> }).series[0].color);
    expect(colours).toContain("#aa0000");
  });

  it("draws the Transactions chart in the transactions chart colour", () => {
    stubThemeTokens({ "--color-chart-transactions": "#00aa00" });

    render(<SummarySection performance={{ mean: 90, data: [] }} transactions={rate} errors={rate} />);

    const colours = vi
      .mocked(ReactEChartsCore)
      .mock.calls.map(([props]) => (props.option as { series: Array<{ color?: string }> }).series[0].color);
    expect(colours).toContain("#00aa00");
  });
});

describe("SummarySection links and window label", () => {
  const props = { performance: { mean: 90, data: [] }, transactions: rate, errors: rate };

  it("renders no link and no window label when given none", () => {
    render(<SummarySection {...props} />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Performances" })).toBeInTheDocument();
    expect(screen.queryByText(/average/)).not.toBeInTheDocument();
  });

  it("renders only the links it is given, as plain anchors by default", () => {
    render(<SummarySection {...props} links={{ errors: "/errors" }} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/errors");
  });

  it("renders every link through the link component", () => {
    const RoutedLink: LinkComponentType = ({ href, ...rest }) => <a data-routed="" href={href} {...rest} />;

    render(
      <SummarySection
        {...props}
        links={{ performance: "/p", transactions: "/t", errors: "/e" }}
        linkComponent={RoutedLink}
      />,
    );

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/p", "/t", "/e"]);
    for (const link of links) {
      expect(link).toHaveAttribute("data-routed");
    }
  });

  it("suffixes the titles and the averages with the window label", () => {
    render(<SummarySection {...props} windowLabel="7d" />);

    expect(screen.getByRole("heading", { name: "Performances (7d)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Transactions (7d)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Errors (7d)" })).toBeInTheDocument();
    expect(screen.getAllByText("7d average")).toHaveLength(3);
  });
});
