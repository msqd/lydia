import { sampleTopology } from "@msqd/lydia/Elements/System/NetworkMap.samples";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SystemPage } from "./SystemPage";

describe("SystemPage", () => {
  it("renders the system page title and content", () => {
    render(<SystemPage topology={sampleTopology} />);

    expect(screen.getByText("System Architecture")).toBeInTheDocument();
    expect(screen.getByText(/Network topology showing traffic flow/)).toBeInTheDocument();
  });

  it("renders the network map", () => {
    render(<SystemPage topology={sampleTopology} />);

    // Check for column headers
    expect(screen.getByText("Entrypoints")).toBeInTheDocument();
    expect(screen.getByText("Proxies")).toBeInTheDocument();
    expect(screen.getByText("Endpoints")).toBeInTheDocument();
  });

  it("displays entrypoint nodes", () => {
    render(<SystemPage topology={sampleTopology} />);

    expect(screen.getByText("payments")).toBeInTheDocument();
    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.getByText("orders")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getAllByText("8080")).toHaveLength(3); // Three entrypoints use port 8080
    expect(screen.getByText("9000")).toBeInTheDocument();
    expect(screen.getByText("/api/payments")).toBeInTheDocument();
    expect(screen.getByText("/admin")).toBeInTheDocument();
  });

  it("displays proxy nodes", () => {
    render(<SystemPage topology={sampleTopology} />);

    expect(screen.getByText("API Gateway")).toBeInTheDocument();
    expect(screen.getByText("Admin Proxy")).toBeInTheDocument();
    expect(screen.getByText("HARP")).toBeInTheDocument();
    expect(screen.getByText("ENVOY")).toBeInTheDocument();
  });

  it("displays endpoint nodes", () => {
    render(<SystemPage topology={sampleTopology} />);

    expect(screen.getByText("Payment Service")).toBeInTheDocument();
    expect(screen.getByText("User Service")).toBeInTheDocument();
    expect(screen.getByText("Order Service")).toBeInTheDocument();
    expect(screen.getByText("Admin Service")).toBeInTheDocument();
    expect(screen.getByText("payments-svc:8080")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SystemPage topology={sampleTopology} className="custom-class" data-testid="system-page" />);

    const systemPage = screen.getByTestId("system-page");
    expect(systemPage).toHaveClass("custom-class");
    expect(systemPage).toHaveClass("space-y-6");
  });

  it("shows circuit breaker statuses on edges", () => {
    render(<SystemPage topology={sampleTopology} />);

    // Circuit breakers are now shown on the edges between proxies and endpoints
    expect(screen.getByText(/1.2%/)).toBeInTheDocument(); // Failure rate for payments
    expect(screen.getByText(/0.8%/)).toBeInTheDocument(); // Failure rate for users
    expect(screen.getByText(/15.3%/)).toBeInTheDocument(); // Failure rate for orders (open)
  });

  it("shows endpoint health statuses", () => {
    render(<SystemPage topology={sampleTopology} />);

    expect(screen.getAllByText("healthy")).toHaveLength(3);
    expect(screen.getByText("degraded")).toBeInTheDocument();
  });
});
