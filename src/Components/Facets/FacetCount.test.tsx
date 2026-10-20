import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FacetCount } from "./FacetCount";

describe("FacetCount", () => {
  it("renders count value", () => {
    render(<FacetCount count={42} />);

    const count = screen.getByText("42");
    expect(count).toBeInTheDocument();
  });

  it("renders with default styling", () => {
    render(<FacetCount count={100} />);

    const count = screen.getByText("100");
    expect(count).toHaveClass("text-[11px]", "text-gray-500", "font-light");
  });

  it("applies additional className when provided", () => {
    render(<FacetCount count={5} className="ml-2 custom-class" />);

    const count = screen.getByText("5");
    expect(count).toHaveClass("text-[11px]", "text-gray-500", "font-light", "ml-2", "custom-class");
  });

  it("renders zero count", () => {
    render(<FacetCount count={0} />);

    const count = screen.getByText("0");
    expect(count).toBeInTheDocument();
  });

  it("renders large numbers", () => {
    render(<FacetCount count={999999} />);

    const count = screen.getByText("999999");
    expect(count).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<FacetCount count={10} />);

    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("10");
  });
});
