import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntrypointNode } from "./EntrypointNode";

describe("EntrypointNode", () => {
  const mockEntrypoint = {
    id: "ep-test",
    name: "payments",
    port: 8080,
    path: "/api/payments",
  };

  it("renders entrypoint information correctly", () => {
    render(<EntrypointNode entrypoint={mockEntrypoint} />);

    expect(screen.getByText("payments")).toBeInTheDocument();
    expect(screen.getByText("8080")).toBeInTheDocument();
    expect(screen.getByText("/api/payments")).toBeInTheDocument();
  });

  it("displays port as a badge", () => {
    render(<EntrypointNode entrypoint={mockEntrypoint} />);

    const portBadge = screen.getByTestId("badge-blue");
    expect(portBadge).toBeInTheDocument();
    expect(portBadge).toHaveTextContent("8080");
  });

  it("truncates long names and paths", () => {
    const longEntrypoint = {
      id: "ep-long",
      name: "very-long-entrypoint-name-that-should-truncate",
      port: 9000,
      path: "/api/very/long/path/that/should/also/truncate",
    };

    render(<EntrypointNode entrypoint={longEntrypoint} />);

    const nameElement = screen.getByText("very-long-entrypoint-name-that-should-truncate");
    expect(nameElement).toHaveClass("truncate");

    const pathElement = screen.getByText("/api/very/long/path/that/should/also/truncate");
    expect(pathElement).toHaveClass("truncate");
  });
});
