import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RequestMethodBadge } from "./RequestMethodBadge";

describe("RequestMethodBadge", () => {
  it("renders GET method with green color", () => {
    render(<RequestMethodBadge method="GET" />);
    const badge = screen.getByText("GET");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-50", "text-green-700", "ring-green-600/20");
  });

  it("renders DELETE method with red color", () => {
    render(<RequestMethodBadge method="DELETE" />);
    const badge = screen.getByText("DELETE");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-50", "text-red-700", "ring-red-600/20");
  });

  it("renders PUT method with yellow color", () => {
    render(<RequestMethodBadge method="PUT" />);
    const badge = screen.getByText("PUT");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-yellow-50", "text-yellow-700", "ring-yellow-600/20");
  });

  it("renders POST method with orange color", () => {
    render(<RequestMethodBadge method="POST" />);
    const badge = screen.getByText("POST");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-orange-50", "text-orange-700", "ring-orange-600/20");
  });

  it("renders PATCH method with purple color", () => {
    render(<RequestMethodBadge method="PATCH" />);
    const badge = screen.getByText("PATCH");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-purple-50", "text-purple-700", "ring-purple-600/20");
  });

  it("renders OPTIONS method with blue color", () => {
    render(<RequestMethodBadge method="OPTIONS" />);
    const badge = screen.getByText("OPTIONS");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-blue-50", "text-blue-700", "ring-blue-600/20");
  });

  it("renders unknown methods with default color", () => {
    render(<RequestMethodBadge method="CUSTOM" />);
    const badge = screen.getByText("CUSTOM");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-gray-50", "text-gray-700", "ring-gray-600/20");
  });
});
