import { render, screen } from "@testing-library/react";
import { refractor } from "refractor/core";
import { describe, expect, it, vi } from "vitest";
import { CodeFormatter } from "./CodeFormatter";
import { HIGHLIGHT_CAP } from "./bodyLimits";

describe("CodeFormatter highlighting", () => {
  const lines = (count: number) => JSON.stringify(Array.from({ length: count - 2 }, (_, i) => i));

  it("highlights a short body", () => {
    const { container } = render(<CodeFormatter code={lines(10)} language="json" />);

    expect(container.querySelector(".token")).toBeInTheDocument();
  });

  it("highlights a body long enough to virtualize", () => {
    const { container } = render(<CodeFormatter code={lines(5000)} language="json" />);

    expect(container.querySelector(".token.number")).toBeInTheDocument();
    expect(container.querySelectorAll(".token.number").length).toBeLessThan(100);
  });

  it("highlights when virtualization is off", () => {
    const { container } = render(<CodeFormatter code={lines(10)} language="json" virtualized={false} />);

    expect(container.querySelector(".token")).toBeInTheDocument();
  });

  it("draws one code box, virtualized or not", () => {
    const { rerender } = render(<CodeFormatter code={lines(10)} language="json" />);
    expect(screen.getAllByRole("group", { name: "Code" })).toHaveLength(1);

    rerender(<CodeFormatter code={lines(10)} language="json" virtualized={false} />);
    expect(screen.getAllByRole("group", { name: "Code" })).toHaveLength(1);
  });

  it("reports no timing", () => {
    render(<CodeFormatter code={lines(60)} language="json" performance="detailed" />);

    expect(screen.queryByText(/Highlight:|Format:|Processed in/)).not.toBeInTheDocument();
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
    const container = screen.getByRole("group", { name: "Code" });
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

  describe("body too large to highlight", () => {
    const hostile = `<script>alert(1)</script><img src=x onerror="alert(1)">`;
    const oneLine = `${hostile}${"x".repeat(HIGHLIGHT_CAP)}`;

    it("shows plain text with a notice, without highlighting", () => {
      const highlight = vi.spyOn(refractor, "highlight");
      const { container } = render(<CodeFormatter code={oneLine} language="html" />);

      expect(screen.getByRole("status")).toHaveTextContent("Too large to highlight: shown as plain text.");
      expect(container.querySelector(".token")).toBeNull();
      expect(highlight).not.toHaveBeenCalled();
      highlight.mockRestore();
    });

    it("shows no notice for a body that is highlighted", () => {
      render(<CodeFormatter code="<p>hi</p>" language="html" />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("keeps markup as text, highlighted or not", () => {
      for (const code of [hostile, oneLine]) {
        const { container, unmount } = render(<CodeFormatter code={code} language="html" />);
        expect(container.querySelector("script, img")).toBeNull();
        expect(container).toHaveTextContent("alert(1)");
        unmount();
      }
    });
  });
});
