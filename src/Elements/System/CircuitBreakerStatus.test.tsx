import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CircuitBreakerStatus } from "./CircuitBreakerStatus";

describe("CircuitBreakerStatus", () => {
  it("displays closed circuit breaker status", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.1 }} />);

    expect(screen.getByText("Circuit Breaker")).toBeInTheDocument();
    expect(screen.getByText(/● Closed/)).toBeInTheDocument();
    expect(screen.getByText("Normal operation")).toBeInTheDocument();
    expect(screen.getByText("Failure rate: 2.1%")).toBeInTheDocument();
  });

  it("displays open circuit breaker status", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "open", failureRate: 45.2 }} />);

    expect(screen.getByText(/○ Open/)).toBeInTheDocument();
    expect(screen.getByText("Blocking requests")).toBeInTheDocument();
    expect(screen.getByText("Failure rate: 45.2%")).toBeInTheDocument();
  });

  it("displays half-open circuit breaker status", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "half-open", failureRate: 12.8 }} />);

    expect(screen.getByText(/◐ Half-Open/)).toBeInTheDocument();
    expect(screen.getByText("Testing recovery")).toBeInTheDocument();
    expect(screen.getByText("Failure rate: 12.8%")).toBeInTheDocument();
  });

  it("formats failure rate to one decimal place", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.123456 }} />);

    expect(screen.getByText("Failure rate: 2.1%")).toBeInTheDocument();
  });

  it("displays compact mode", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.5 }} compact />);

    expect(screen.getByText("2.5%")).toBeInTheDocument();
    expect(screen.queryByText("Circuit Breaker")).not.toBeInTheDocument();
  });

  it("shows dropdown when editable in compact mode", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.5 }} compact editable />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.getByText("Half-Open")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("calls onChange when selecting a new status in compact mode", () => {
    const onChange = vi.fn();
    render(
      <CircuitBreakerStatus
        circuitBreaker={{ status: "closed", failureRate: 2.5 }}
        compact
        editable
        onChange={onChange}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const openOption = screen.getByText("Open");
    fireEvent.click(openOption);

    expect(onChange).toHaveBeenCalledWith("open");
  });

  it("shows dropdown when editable in full mode", () => {
    render(<CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.5 }} editable />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.getByText("Half-Open")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it.each([
    ["compact", true],
    ["full", false],
  ])("closes the menu on an outside click in %s mode", (_mode, compact) => {
    render(
      <>
        <CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.5 }} compact={compact} editable />
        <p>elsewhere</p>
      </>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Half-Open")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("elsewhere"));

    expect(screen.queryByText("Half-Open")).not.toBeInTheDocument();
  });

  it("keeps the menu open when pressing inside it, and still selects the item", () => {
    const onChange = vi.fn();
    render(
      <CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.5 }} editable onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button"));

    fireEvent.mouseDown(screen.getByText("Half-Open"));
    expect(screen.getByText("Half-Open")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Half-Open"));

    expect(onChange).toHaveBeenCalledWith("half-open");
  });

  it("listens to the document only while the menu is open", () => {
    const add = vi.spyOn(document, "addEventListener");
    render(<CircuitBreakerStatus circuitBreaker={{ status: "closed", failureRate: 2.5 }} editable />);
    const mousedowns = () => add.mock.calls.filter(([type]) => type === "mousedown").length;
    expect(mousedowns()).toBe(0);

    fireEvent.click(screen.getByRole("button"));

    expect(mousedowns()).toBe(1);
    add.mockRestore();
  });
});
