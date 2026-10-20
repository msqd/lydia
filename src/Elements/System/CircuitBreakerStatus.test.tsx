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
});
