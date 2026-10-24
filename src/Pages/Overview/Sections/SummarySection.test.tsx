import { render } from "@testing-library/react";
import ReactEChartsCore from "echarts-for-react/lib/core.js";
import { afterEach, describe, expect, it, vi } from "vitest";
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
