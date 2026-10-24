import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VirtualizedCodeView } from "./VirtualizedCodeView";
import type { CodeLanguage } from "./useCodeHighlighting";
import { useCodeHighlighting } from "./useCodeHighlighting";

type ViewProps = Omit<React.ComponentProps<typeof VirtualizedCodeView>, "lines" | "highlightLine"> & {
  lines: string[];
  language: CodeLanguage;
};

function View({ lines, language, ...props }: ViewProps) {
  const highlighting = useCodeHighlighting(lines.join("\n"), language);
  return <VirtualizedCodeView {...props} lines={highlighting.lines} highlightLine={highlighting.highlightLine} />;
}

const lines = (count: number) => Array.from({ length: count }, (_, i) => `"line${i}"`);

describe("VirtualizedCodeView", () => {
  it("draws every line of a short body, highlighted", () => {
    const { container } = render(<View lines={lines(3)} language="json" containerHeight={400} showLineNumbers />);

    expect(screen.getByText(/line2/)).toBeInTheDocument();
    expect(container.querySelectorAll(".token.string")).toHaveLength(3);
    expect(container.querySelector(".token[style]")).toBeNull();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("draws only the visible window of a long body, highlighted", () => {
    const { container } = render(<View lines={lines(5000)} language="json" containerHeight={400} />);

    expect(screen.getByText(/line0/)).toBeInTheDocument();
    expect(screen.queryByText(/line4999/)).not.toBeInTheDocument();
    expect(container.querySelectorAll(".token.string").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".token.string").length).toBeLessThan(100);
  });

  it("moves the window with the scroll", () => {
    render(<View lines={lines(10000)} language="json" containerHeight={400} />);

    const region = screen.getByRole("group", { name: "Code" });
    region.scrollTop = 20 * 5000;
    fireEvent.scroll(region);

    expect(screen.getByText(/line5000/)).toBeInTheDocument();
    expect(screen.queryByText(/line0"/)).not.toBeInTheDocument();
  });

  it("numbers the lines of the window", () => {
    render(<View lines={lines(10000)} language="json" containerHeight={400} showLineNumbers />);

    const region = screen.getByRole("group", { name: "Code" });
    region.scrollTop = 20 * 5000;
    fireEvent.scroll(region);

    expect(screen.getByText("5001")).toBeInTheDocument();
  });

  it("does not virtualize when told not to", () => {
    render(<View lines={lines(500)} language="json" containerHeight={400} virtualized={false} />);

    expect(screen.getByText(/line499/)).toBeInTheDocument();
  });

  it("draws markup as text", () => {
    const { container } = render(
      <View
        lines={["<script>alert(1)</script>", "<img src=x onerror=alert(1)>"]}
        language="html"
        containerHeight={400}
      />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("<script>alert(1)</script>");
  });
});
