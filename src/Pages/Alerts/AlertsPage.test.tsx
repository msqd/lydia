import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertsPage } from "./AlertsPage";
import { sampleAlerts } from "./AlertsPage.samples";

// Only the embedded page is mocked, so this test stays about the alerts. The client-side fallback
// hook it drives that page with is the real one: mocking it would hide whether this page wires it
// up at all. See Testing.mdx, What to mock.
vi.mock("@msqd/lydia/Pages/Transactions/List", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@msqd/lydia/Pages/Transactions/List")>()),
  TransactionsListPage: ({
    transactions,
    total,
    search,
    onSearchChange,
    className,
  }: {
    transactions: any[];
    total?: number;
    search?: string;
    onSearchChange?: (search: string) => void;
    className?: string;
  }) => (
    <div data-testid="transactions-list" className={className}>
      <input aria-label="Search" value={search} onChange={(event) => onSearchChange?.(event.target.value)} />
      <div>
        Transactions: {transactions.length} of {total}
      </div>
      {transactions.slice(0, 3).map((tx, i) => (
        <div key={i} data-testid={`transaction-${i}`}>
          {tx.url} - {tx.method} - {tx.status}
        </div>
      ))}
    </div>
  ),
}));

describe("AlertsPage", () => {
  it("renders the AlertsPage component", () => {
    const { container } = render(<AlertsPage alerts={sampleAlerts} />);
    expect(container).toMatchSnapshot();
  });

  it("displays the page title and description", () => {
    render(<AlertsPage alerts={sampleAlerts} />);
    expect(screen.getByText("Active & Recent Alerts")).toBeInTheDocument();
    expect(
      screen.getByText("Monitor and manage API observability alerts. Click on any alert to view related transactions."),
    ).toBeInTheDocument();
  });

  it("displays alert names and descriptions", () => {
    render(<AlertsPage alerts={sampleAlerts} />);
    expect(screen.getByText("Transaction Failure Rate High")).toBeInTheDocument();
    expect(
      screen.getByText("Transaction failure rate for /api/payments is 15.3% (threshold: 10%)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Circuit Breaker Activated")).toBeInTheDocument();
    expect(
      screen.getByText("External payment service circuit breaker triggered (failure rate: 95%)"),
    ).toBeInTheDocument();
  });

  it("displays alert metadata (endpoints and transaction counts)", () => {
    render(<AlertsPage alerts={sampleAlerts} />);
    expect(screen.getByText("/api/payments")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();

    // Check for multiple instances of "transactions" text
    const transactionTexts = screen.getAllByText(/transactions/);
    expect(transactionTexts.length).toBeGreaterThan(0);
  });

  it("displays the correct alert statuses and severities", () => {
    render(<AlertsPage alerts={sampleAlerts} />);
    const firingAlerts = screen.getAllByText("firing");
    const expiredAlerts = screen.getAllByText("expired");
    const criticalAlerts = screen.getAllByText("critical");
    const warningAlerts = screen.getAllByText("warning");

    expect(firingAlerts.length).toBeGreaterThan(0);
    expect(expiredAlerts.length).toBeGreaterThan(0);
    expect(criticalAlerts.length).toBeGreaterThan(0);
    expect(warningAlerts.length).toBeGreaterThan(0);
  });

  it("opens drawer when alert is clicked", async () => {
    render(<AlertsPage alerts={sampleAlerts} />);

    // Initially, drawer should not be visible
    expect(screen.queryByText(/Transactions for:/)).not.toBeInTheDocument();

    // Click on the first alert
    const firstAlert = screen.getByText("Transaction Failure Rate High");
    fireEvent.click(firstAlert);

    // Drawer should now be visible with alert-specific title
    expect(screen.getByText("Transactions for: Transaction Failure Rate High")).toBeInTheDocument();
    expect(screen.getByText(/Showing 142 transactions related to this alert/)).toBeInTheDocument();
  });

  it("shows related transactions in drawer", async () => {
    render(<AlertsPage alerts={sampleAlerts} />);

    // Click on an alert to open drawer
    const alert = screen.getByText("Transaction Failure Rate High");
    fireEvent.click(alert);

    // Check that transactions list is rendered
    expect(screen.getByTestId("transactions-list")).toBeInTheDocument();
    // A page of rows, and the count only the caller can know: the drawer paginates 142 related
    // transactions rather than handing all of them to the list at once.
    expect(screen.getByText(/Transactions: 20 of 142/)).toBeInTheDocument();
  });

  it("closes drawer when close button is clicked", async () => {
    render(<AlertsPage alerts={sampleAlerts} />);

    // Open drawer
    const alert = screen.getByText("Transaction Failure Rate High");
    fireEvent.click(alert);

    // Drawer should be visible
    expect(screen.getByText("Transactions for: Transaction Failure Rate High")).toBeInTheDocument();

    // Close drawer (find close button)
    const closeButton = screen.getByLabelText("Close drawer");
    fireEvent.click(closeButton);

    // Drawer should be closed
    expect(screen.queryByText("Transactions for: Transaction Failure Rate High")).not.toBeInTheDocument();
  });

  it("displays last triggered times", () => {
    render(<AlertsPage alerts={sampleAlerts} />);
    expect(screen.getByText("2 minutes ago")).toBeInTheDocument();
    expect(screen.getByText("30 seconds ago")).toBeInTheDocument();
    expect(screen.getByText("3 hours ago")).toBeInTheDocument();
  });

  it("renders no count for an alert without transactions", () => {
    const alert = { ...sampleAlerts[0], transactionCount: 0, transactions: [] };
    render(<AlertsPage alerts={[alert]} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("counts the transactions the drawer lists, not the alert's declared count", () => {
    const alert = {
      ...sampleAlerts[0],
      transactionCount: 999,
      transactions: sampleAlerts[0].transactions?.slice(0, 5),
    };
    render(<AlertsPage alerts={[alert]} />);
    fireEvent.click(screen.getByText(alert.name));
    expect(screen.getByText(/Showing 5 transactions related to this alert/)).toBeInTheDocument();
  });

  it("starts each alert with a clean list state", () => {
    render(<AlertsPage alerts={sampleAlerts} />);
    fireEvent.click(screen.getByText(sampleAlerts[0].name));
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "payments" } });
    expect(screen.getByLabelText("Search")).toHaveValue("payments");

    // Selected while the drawer is still open, so the list stays mounted across the switch.
    fireEvent.click(screen.getByText(sampleAlerts[1].name));
    expect(screen.getByLabelText("Search")).toHaveValue("");
  });
});
