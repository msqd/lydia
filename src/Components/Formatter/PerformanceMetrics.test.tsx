import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PerformanceMetrics } from "./PerformanceMetrics";

describe("PerformanceMetrics", () => {
  const data = { lineCount: 120, characterCount: 2048, isVirtualized: true, visibleItemCount: 20 };

  it("shows size and virtualization", () => {
    const { container } = render(<PerformanceMetrics data={data} />);

    expect(screen.getByText("120 lines")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
    expect(screen.getByText(/Virtualized/)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("shows the virtualization status in details", () => {
    render(<PerformanceMetrics data={data} showDetails />);

    expect(screen.getByText("Virtual rendering enabled")).toBeInTheDocument();
  });

  it("shows no timing", () => {
    render(<PerformanceMetrics data={data} showDetails />);

    expect(screen.queryByText(/Processed in|Format:|Highlight:/)).not.toBeInTheDocument();
  });
});
