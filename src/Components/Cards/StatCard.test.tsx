import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders with required props", () => {
    const { container } = render(<StatCard title="Test Title" value="100" data-testid="stat-card" />);

    const title = screen.getByText("Test Title");
    const value = screen.getByText("100");

    expect(title).toBeInTheDocument();
    expect(value).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it("renders with unit", () => {
    render(<StatCard title="Test Title" value={42} unit="ms" />);

    const value = screen.getByText("42");
    const unit = screen.getByText("ms");

    expect(value).toBeInTheDocument();
    expect(unit).toBeInTheDocument();
  });

  it("renders with positive trend", () => {
    render(<StatCard title="Test Title" value="100" trend={{ value: 10, direction: "up", label: "vs last week" }} />);

    const trendValue = screen.getByText("10%");
    const trendLabel = screen.getByText("vs last week");

    expect(trendValue).toBeInTheDocument();
    expect(trendLabel).toBeInTheDocument();
    expect(trendValue.closest("span")).toHaveClass("text-success-700");
  });

  it("renders with negative trend", () => {
    render(<StatCard title="Test Title" value="100" trend={{ value: 5, direction: "down" }} />);

    const trendValue = screen.getByText("5%");

    expect(trendValue).toBeInTheDocument();
    expect(trendValue.closest("span")).toHaveClass("text-danger-700");
  });

  it("renders with neutral trend", () => {
    render(<StatCard title="Test Title" value="100" trend={{ value: 0, direction: "neutral" }} />);

    const trendValue = screen.getByText("0%");

    expect(trendValue).toBeInTheDocument();
    expect(trendValue.closest("span")).toHaveClass("text-gray-500");
  });

  it("applies custom className", () => {
    render(<StatCard title="Test Title" value="100" className="custom-class" data-testid="stat-card" />);

    const container = screen.getByTestId("stat-card");
    expect(container).toHaveClass("custom-class");
    expect(container).toHaveClass("flex");
  });
});
