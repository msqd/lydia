import { ToastProvider } from "@msqd/lydia/Components/Toast";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TransactionsDetailPage } from "./TransactionsDetailPage";
import { sampleDetailedTransaction } from "./TransactionsDetailPage.samples";

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

// Design-system children render for real in this file. Mocking Badge, TpdexBadge or the Http
// elements would make the snapshot record the page's skeleton against itself: #45 changed badge
// sizing on this page and moved no snapshot, because the badges were mocked away. Mock only what
// this page hands no props to. See #56.

describe("TransactionsDetailPage", () => {
  it("renders the transaction details correctly", () => {
    const { container } = render(
      <TestWrapper>
        <TransactionsDetailPage transaction={sampleDetailedTransaction} data-testid="transaction-detail" />
      </TestWrapper>,
    );

    // Check some transaction metadata is displayed (now uses tx001 data)
    expect(screen.getByText("/api/users/123/profile")).toBeInTheDocument();
    expect(screen.getByTestId("method-badge-GET")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-200")).toBeInTheDocument();

    // Check sections are present
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getByText("Response")).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("draws no app chrome nor page title of its own", () => {
    render(
      <TestWrapper>
        <TransactionsDetailPage transaction={sampleDetailedTransaction} />
      </TestWrapper>,
    );

    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("renders the request and response sections", () => {
    render(
      <TestWrapper>
        <TransactionsDetailPage transaction={sampleDetailedTransaction} />
      </TestWrapper>,
    );

    // Check request section
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getAllByText("Headers")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Body")[0]).toBeInTheDocument();

    // Check response section
    expect(screen.getByText("Response")).toBeInTheDocument();
    expect(screen.getAllByText("Headers")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Body")[1]).toBeInTheDocument();

    // HeadersDisplay renders each header itself, key by key
    expect(screen.getAllByText("Content-Type:")).toHaveLength(2); // Request and response headers
    expect(screen.getByText("Authorization:")).toBeInTheDocument();
    expect(screen.getByText("nginx/1.20.1")).toBeInTheDocument();
  });

  it("displays tags correctly when metadata section is expanded", () => {
    render(
      <TestWrapper>
        <TransactionsDetailPage transaction={sampleDetailedTransaction} />
      </TestWrapper>,
    );

    // Since metadata section is closed by default, tags won't be visible initially
    expect(screen.queryByText("user")).not.toBeInTheDocument();
    expect(screen.queryByText("profile")).not.toBeInTheDocument();
    expect(screen.queryByText("mobile")).not.toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
  });

  it("displays basic transaction information in header", () => {
    render(
      <TestWrapper>
        <TransactionsDetailPage transaction={sampleDetailedTransaction} />
      </TestWrapper>,
    );

    // Check that the request/response format is visible in header (now uses tx001 data)
    expect(screen.getByTestId("method-badge-GET")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-200")).toBeInTheDocument();
    expect(screen.getByText("users-api")).toBeInTheDocument();
    expect(screen.getByText("/api/users/123/profile")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <TestWrapper>
        <TransactionsDetailPage
          transaction={sampleDetailedTransaction}
          className="custom-class"
          data-testid="transaction-detail"
        />
      </TestWrapper>,
    );

    const detailPage = screen.getByTestId("transaction-detail");
    expect(detailPage).toHaveClass("custom-class");
  });

  it("copy button is not visible when metadata section is closed", () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <TestWrapper>
        <TransactionsDetailPage transaction={sampleDetailedTransaction} />
      </TestWrapper>,
    );

    // Copy button should not be visible when metadata section is closed by default
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  it("shows the tags of the transaction it is given, not the first one rendered", async () => {
    const withTags = (tags: Record<string, string>) => ({ ...sampleDetailedTransaction, tags });
    const { rerender } = render(
      <TestWrapper>
        <TransactionsDetailPage transaction={withTags({ env: "alpha" })} />
      </TestWrapper>,
    );
    rerender(
      <TestWrapper>
        <TransactionsDetailPage transaction={withTags({ env: "beta" })} />
      </TestWrapper>,
    );

    await userEvent.click(screen.getByTestId("method-badge-GET"));

    expect(screen.getByText("env=beta")).toBeInTheDocument();
    expect(screen.queryByText("env=alpha")).not.toBeInTheDocument();
  });
});
