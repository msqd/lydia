import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonTreeView } from "./JsonTreeView";

describe("JsonTreeView Component", () => {
  it("renders a simple object correctly", () => {
    const data = { name: "John", age: 30 };
    render(<JsonTreeView data={data} initiallyExpanded={true} />);

    // Check property keys and values
    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/"John"/i)).toBeInTheDocument();
    expect(screen.getByText(/age:/i)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it("renders a nested object with initiallyExpanded", () => {
    const data = {
      person: {
        name: "John",
        address: {
          city: "New York",
        },
      },
    };
    render(<JsonTreeView data={data} initiallyExpanded={true} />);

    // Check nested structure
    expect(screen.getByText(/person:/i)).toBeInTheDocument();
    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/"John"/i)).toBeInTheDocument();
    expect(screen.getByText(/address:/i)).toBeInTheDocument();
    expect(screen.getByText(/city:/i)).toBeInTheDocument();
    expect(screen.getByText(/"New York"/i)).toBeInTheDocument();
  });

  it("renders an array correctly", () => {
    const data = [1, 2, "three"];
    render(<JsonTreeView data={data} initiallyExpanded={true} />);

    // Check array items
    expect(screen.getByText(/0:/i)).toBeInTheDocument(); // Array indices
    expect(screen.getByText(/1$/)).toBeInTheDocument(); // The value 1
    expect(screen.getByText(/1:/i)).toBeInTheDocument();
    expect(screen.getByText(/2$/)).toBeInTheDocument(); // The value 2
    expect(screen.getByText(/2:/i)).toBeInTheDocument();
    expect(screen.getByText(/"three"/i)).toBeInTheDocument();
  });

  it("handles null, boolean, and other primitive values", () => {
    const data = {
      nullValue: null,
      trueValue: true,
      falseValue: false,
      number: 123,
    };
    render(<JsonTreeView data={data} initiallyExpanded={true} />);

    // Check property names
    expect(screen.getByText(/nullValue:/i)).toBeInTheDocument();
    expect(screen.getByText(/trueValue:/i)).toBeInTheDocument();
    expect(screen.getByText(/falseValue:/i)).toBeInTheDocument();
    expect(screen.getByText(/number:/i)).toBeInTheDocument();

    // Check for values (using more specific queries)
    const nullSpan = Array.from(document.querySelectorAll(".text-gray-500.italic")).find(
      (el) => el.textContent === "null",
    );
    expect(nullSpan).toBeInTheDocument();

    const trueSpan = Array.from(document.querySelectorAll(".text-purple-600")).find((el) => el.textContent === "true");
    expect(trueSpan).toBeInTheDocument();

    const falseSpan = Array.from(document.querySelectorAll(".text-purple-600")).find(
      (el) => el.textContent === "false",
    );
    expect(falseSpan).toBeInTheDocument();

    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("respects expandedDepth prop", () => {
    const data = {
      level1: {
        level2: {
          level3: "deep",
        },
      },
    };
    render(<JsonTreeView data={data} expandedDepth={2} />);

    // Should see level1 and level2
    expect(screen.getByText(/level1:/i)).toBeInTheDocument();
    expect(screen.getByText(/level2:/i)).toBeInTheDocument();

    // Should not see level3 content (it's beyond the expandedDepth)
    expect(screen.queryByText(/"deep"/i)).not.toBeInTheDocument();
  });

  it("calls onValueClick when a primitive value is clicked", () => {
    const onValueClick = vi.fn();
    const data = { name: "John" };
    render(<JsonTreeView data={data} initiallyExpanded={true} onValueClick={onValueClick} />);

    // Find and click the value
    const valueElement = screen.getByText(/"John"/i);
    fireEvent.click(valueElement);

    // Check callback was called with path and value
    expect(onValueClick).toHaveBeenCalledWith(expect.stringContaining("name"), "John");
  });

  it("accepts JSON string as input", () => {
    const jsonString = '{"name":"John","age":30}';
    render(<JsonTreeView data={jsonString} initiallyExpanded={true} />);

    // Check that parsed data is rendered
    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/"John"/i)).toBeInTheDocument();
    expect(screen.getByText(/age:/i)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });
});

describe("JsonTreeView depth cap", () => {
  const nested = (levels: number) => JSON.parse("[".repeat(levels) + "]".repeat(levels));

  it("renders a very deep document without throwing, fully expanded", () => {
    expect(() => render(<JsonTreeView data={nested(1000)} initiallyExpanded />)).not.toThrow();
    expect(screen.getByTitle(/64/)).toBeInTheDocument();
  });

  it("renders a very deep document without throwing with a huge expandedDepth", () => {
    expect(() => render(<JsonTreeView data={nested(1000)} expandedDepth={1000} />)).not.toThrow();
    expect(screen.getByTitle(/64/)).toBeInTheDocument();
  });

  it("stops expanding by click at the cap and shows an inert ellipsis", () => {
    const { container } = render(<JsonTreeView data={nested(100)} />);
    const buttons = () => container.querySelectorAll("button");
    let count = 0;
    while (buttons().length > count) {
      count = buttons().length;
      fireEvent.click(buttons()[count - 1]);
    }
    expect(buttons()).toHaveLength(64);
    const marker = screen.getByTitle(/64/);
    expect(marker).toHaveTextContent("…");
    expect(marker.tagName).not.toBe("BUTTON");
  });

  it("still expands a tree just under the cap", () => {
    const { container } = render(<JsonTreeView data={nested(63)} initiallyExpanded />);
    expect(container.querySelectorAll("button")).toHaveLength(63);
    expect(screen.queryByTitle(/64/)).not.toBeInTheDocument();
  });
});
