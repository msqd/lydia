import { render, screen } from "@testing-library/react";
import { refractor } from "refractor/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeFormatter } from "./CodeFormatter";

/**
 * Highlighting is the expensive step (seconds on a 10 MB body) and its result
 * is drawn in one case only: a virtualized view short enough not to virtualize.
 * Every other path draws plain text, so highlighting there is work thrown away.
 */
describe("CodeFormatter highlighting", () => {
  afterEach(() => vi.restoreAllMocks());

  const lines = (count: number) => JSON.stringify(Array.from({ length: count - 2 }, (_, i) => i));

  it("highlights a short body, which is drawn highlighted", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    const { container } = render(<CodeFormatter code={lines(10)} language="json" />);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".token")).toBeInTheDocument();
  });

  it("does not highlight a body long enough to virtualize, which is drawn as plain text", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    render(<CodeFormatter code={lines(60)} language="json" />);

    expect(highlight).not.toHaveBeenCalled();
  });

  it("does not highlight when virtualization is off, which draws plain text", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    render(<CodeFormatter code={lines(10)} language="json" virtualized={false} />);

    expect(highlight).not.toHaveBeenCalled();
  });

  it("does not report a highlighting time for highlighting it did not do", () => {
    render(<CodeFormatter code={lines(60)} language="json" performance="detailed" />);

    expect(screen.queryByText(/Highlight:/)).not.toBeInTheDocument();
  });
});

describe("CodeFormatter Component", () => {
  it("renders the code with syntax highlighting", () => {
    const code = `{"name": "John", "age": 30}`;
    render(<CodeFormatter code={code} language="json" />);

    // Check that the code is rendered
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it("renders code content correctly", () => {
    const code = "line 1\nline 2\nline 3";
    render(<CodeFormatter code={code} language="text" />);

    // Check that the code content is rendered
    expect(screen.getByText(/line 1/)).toBeInTheDocument();
    expect(screen.getByText(/line 2/)).toBeInTheDocument();
    expect(screen.getByText(/line 3/)).toBeInTheDocument();
  });

  it("formats JSON correctly", () => {
    const code = `{"name":"John","age":30}`;
    render(<CodeFormatter code={code} language="json" />);

    // Check that the JSON is formatted (should contain proper spacing)
    const container = screen.getByText(/John/).closest("div");
    expect(container?.textContent).toContain("name");
    expect(container?.textContent).toContain("John");
    expect(container?.textContent).toContain("30");
  });

  it("handles different languages", () => {
    const jsCode = "const x = 5;";
    render(<CodeFormatter code={jsCode} language="javascript" />);

    expect(screen.getByText(/const/)).toBeInTheDocument();
    expect(screen.getByText(/x/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const code = "test code";
    const { container } = render(<CodeFormatter code={code} language="text" className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows performance metrics when enabled", () => {
    const code = "test code\nline 2\nline 3";
    render(<CodeFormatter code={code} language="text" performance="summary" />);

    // Check that performance metrics are displayed
    expect(screen.getByText(/lines/)).toBeInTheDocument();
  });

  it("handles different container heights", () => {
    const code = "test code";
    const { container } = render(<CodeFormatter code={code} language="text" height={200} />);

    // Check that the container has the correct structure
    expect(container.firstChild).toBeInTheDocument();
  });

  it("handles empty code", () => {
    const { container } = render(<CodeFormatter code="" language="text" />);

    // Should render without errors
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("border", "border-gray-200");
  });

  it("handles invalid JSON gracefully", () => {
    const code = `{"name":"John", "age":30,}`; // Invalid JSON with trailing comma
    render(<CodeFormatter code={code} language="json" />);

    // Should still render the code, even if invalid
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  /**
   * A body taller than its box scrolls, and holds nothing focusable, so a
   * keyboard could not scroll it at all (WCAG 2.1.1, axe
   * `scrollable-region-focusable`). The box is a named group in the tab order.
   */
  it("lets a keyboard reach and scroll a long body", () => {
    const code = Array.from({ length: 200 }, (_, line) => `line ${line}`).join("\n");
    render(<CodeFormatter code={code} language="text" />);

    const region = screen.getByRole("group", { name: "Code" });
    expect(region).toHaveAttribute("tabindex", "0");
  });
});
