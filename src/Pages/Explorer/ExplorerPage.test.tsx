import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { toDetailedTransaction } from "@msqd/lydia/Pages/Transactions/Detail/TransactionsDetailPage.samples";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExplorerPage } from "./ExplorerPage";

// Design-system children render for real in this file: only other *pages* are mocked, which keeps
// the unit boundary without hiding how a shared component behaves here. Mocking Dialog made this
// test assert on a drawer the mock invented. See Testing.mdx, What to mock.
//
// Only the embedded page is mocked, so this test stays about the explorer. The client-side
// fallback hook it drives that page with is the real one: mocking it would hide whether this page
// wires it up at all. See Testing.mdx, What to mock.
vi.mock("@msqd/lydia/Pages/Transactions/List", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@msqd/lydia/Pages/Transactions/List")>()),
  TransactionsListPage: ({
    transactions,
    variant,
    className,
    onTransactionSelect,
    isDrawerOpen,
    selectedId,
  }: {
    transactions: any[];
    variant?: "page" | "embedded";
    className?: string;
    onTransactionSelect?: (transaction: any) => void;
    isDrawerOpen?: boolean;
    selectedId?: string | null;
  }) => (
    <div data-testid="transactions-list" className={className}>
      <div>hideTitle: {variant === "embedded" ? "true" : "false"}</div>
      <div>hideFilters: {variant === "embedded" ? "true" : "false"}</div>
      <div>isDrawerOpen: {isDrawerOpen ? "true" : "false"}</div>
      <div>selectedId: {selectedId ?? "none"}</div>
      <div>Transactions: {transactions.length}</div>
      {transactions.slice(0, 3).map((tx, i) => (
        <div key={i} data-testid={`transaction-${i}`}>
          {tx.url} - {tx.apiName}
        </div>
      ))}
      {/* The real page reports a selection through this callback; the explorer opens its drawer on
          it, so a test needs a way to fire it. */}
      <button type="button" onClick={() => onTransactionSelect?.(transactions[0])}>
        select first transaction
      </button>
    </div>
  ),
}));

// Another page is mocked, which keeps the unit boundary: this file is about the explorer, not
// about the detail page's rendering. Design-system components render for real. See Testing.mdx, What to mock.
vi.mock("@msqd/lydia/Pages/Transactions/Detail", () => ({
  TransactionsDetailPage: ({ transaction }: { transaction?: { id?: string } }) => (
    <div data-testid="transaction-detail">
      <div>Transaction ID: {transaction?.id}</div>
    </div>
  ),
}));

const mockBasicTransactions: Transaction[] = [
  {
    id: "tx001",
    url: "/api/users",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:00:00",
    responseTime: 100,
    client: "Mobile App",
    apiName: "users-api",
    userAgent: "TestApp/1.0",
    remoteAddress: "192.168.1.1",
  },
  {
    id: "tx002",
    url: "/api/users/profile",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:05:00",
    responseTime: 150,
    client: "Website",
    apiName: "users-api",
    userAgent: "Chrome/120",
    remoteAddress: "192.168.1.2",
  },
  {
    id: "tx003",
    url: "/api/products",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:10:00",
    responseTime: 200,
    client: "Admin Dashboard",
    apiName: "products-api",
    userAgent: "AdminPanel/2.0",
    remoteAddress: "192.168.1.3",
  },
  {
    id: "tx004",
    url: "/api/products/categories",
    method: "GET",
    status: "Failed",
    statusCode: 500,
    timestamp: "2025-05-20T10:15:00",
    responseTime: 500,
    client: "External API",
    apiName: "products-api",
    userAgent: "APIClient/1.0",
    remoteAddress: "192.168.1.4",
  },
];

const mockTransactions = mockBasicTransactions.map(toDetailedTransaction);

describe("ExplorerPage", () => {
  it("renders the ExplorerPage component", () => {
    const { container } = render(<ExplorerPage transactions={mockTransactions} />);
    expect(container).toMatchSnapshot();
  });

  it("displays the page title and description", () => {
    render(<ExplorerPage transactions={mockTransactions} />);
    expect(screen.getByText("API Explorer")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Browse and explore API endpoints hierarchically. Select an API or endpoint to view related transactions.",
      ),
    ).toBeInTheDocument();
  });

  it("builds tree structure from transactions", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Check API names are displayed
    expect(screen.getByText("users-api")).toBeInTheDocument();
    expect(screen.getByText("products-api")).toBeInTheDocument();

    // Check transaction counts are displayed
    const countElements = screen.getAllByText("2");
    expect(countElements.length).toBeGreaterThan(0); // users-api count appears
  });

  it("shows empty state when no transactions", () => {
    render(<ExplorerPage transactions={[]} />);
    expect(screen.getByText("No APIs found")).toBeInTheDocument();
    expect(screen.getByText("Select an API or endpoint to view transactions")).toBeInTheDocument();
  });

  it("expands and collapses tree nodes", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Initially, child nodes should not be visible
    expect(screen.queryByText("users")).not.toBeInTheDocument();

    // Click on users-api to expand
    const usersApiNode = screen.getByText("users-api");
    fireEvent.click(usersApiNode);

    // Now child nodes should be visible
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("selects API and shows all its transactions", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Click on users-api
    const usersApiNode = screen.getByText("users-api");
    fireEvent.click(usersApiNode);

    // Check that transactions are shown
    expect(screen.getByTestId("transactions-list")).toBeInTheDocument();
    expect(screen.getByText("hideTitle: true")).toBeInTheDocument();
    expect(screen.getByText("hideFilters: true")).toBeInTheDocument();
    expect(screen.getByText("isDrawerOpen: false")).toBeInTheDocument();
  });

  it("selects endpoint and shows filtered transactions", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // First expand products-api
    const productsApiNode = screen.getByText("products-api");
    fireEvent.click(productsApiNode);

    // Then click on a specific endpoint
    const apiNode = screen.getByText("api");
    fireEvent.click(apiNode);

    // Check that filtered transactions are shown
    expect(screen.getByTestId("transactions-list")).toBeInTheDocument();
  });

  it.each([
    ["an unnamed API", { apiName: undefined, url: "/api/a" }, "unknown-api", "Transactions: 1"],
    ["a query string", { url: "/api/users?page=2" }, "users-api", "Transactions: 3"],
    ["a full URL", { url: "https://host/api/users" }, "users-api", "Transactions: 3"],
  ])("lists the transactions the tree counts for %s", (_label, overrides, apiName, listed) => {
    const extra = toDetailedTransaction({ ...mockBasicTransactions[0], id: "extra", ...overrides });
    render(<ExplorerPage transactions={[...mockTransactions, extra]} />);

    fireEvent.click(screen.getByText(apiName));

    expect(screen.getByText(listed)).toBeInTheDocument();
  });

  it("does not list /api/users transactions under /api/user", () => {
    const sibling = toDetailedTransaction({ ...mockBasicTransactions[0], id: "sibling", url: "/api/user" });
    render(<ExplorerPage transactions={[sibling, ...mockTransactions]} />);

    fireEvent.click(screen.getByRole("button", { name: "users-api" }));
    fireEvent.click(screen.getByRole("button", { name: "api" }));
    fireEvent.click(screen.getByText("user"));

    expect(screen.getByText("Transactions: 1")).toBeInTheDocument();
  });

  it("shows folder and endpoint icons correctly", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Expand to see icons
    const usersApiNode = screen.getByText("users-api");
    fireEvent.click(usersApiNode);

    // Check for SVG icons in the tree structure
    const container = screen.getByText("users-api").closest("div");
    const svgIcons = container?.querySelectorAll("svg");
    expect(svgIcons).toBeDefined();
    expect(svgIcons!.length).toBeGreaterThan(0);
  });

  it("toggles expansion with chevron button", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Find and click the chevron button
    const chevronButtons = screen.getAllByRole("button");
    const chevronButton = chevronButtons.find(
      (btn) => btn.querySelector("svg") && btn.classList.contains("hover:bg-gray-200"),
    );

    if (chevronButton) {
      fireEvent.click(chevronButton);
      // Node should expand
      expect(screen.getByText("api")).toBeInTheDocument();
    }
  });

  it("maintains selection state when expanding/collapsing", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Select users-api
    const usersApiNode = screen.getByText("users-api");
    fireEvent.click(usersApiNode);

    // Should show transactions
    expect(screen.getByTestId("transactions-list")).toBeInTheDocument();

    // Click again to collapse (selection should remain)
    fireEvent.click(usersApiNode);

    // Transactions should still be shown
    expect(screen.getByTestId("transactions-list")).toBeInTheDocument();
  });

  it("drawer is not initially visible", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a real drawer when a transaction is selected, and names it", () => {
    render(<ExplorerPage transactions={mockTransactions} />);
    fireEvent.click(screen.getByText("users-api"));

    fireEvent.click(screen.getByRole("button", { name: "select first transaction" }));

    const drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText("Transaction Details")).toBeInTheDocument();
  });

  it("closes the drawer through the control the drawer itself renders", async () => {
    render(<ExplorerPage transactions={mockTransactions} />);
    fireEvent.click(screen.getByText("users-api"));
    fireEvent.click(screen.getByRole("button", { name: "select first transaction" }));

    fireEvent.click(screen.getByRole("button", { name: "Close drawer" }));

    // The real drawer leaves on a transition, so it is still mounted for a tick. The mock closed
    // instantly, which is one more thing the old test could not have caught.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  describe("clears the list selection when the drawer closes", () => {
    const openDrawer = () => {
      render(<ExplorerPage transactions={mockTransactions} />);
      fireEvent.click(screen.getByText("users-api"));
      fireEvent.click(screen.getByRole("button", { name: "select first transaction" }));
      expect(screen.getByText("selectedId: tx002")).toBeInTheDocument();
    };
    const closed = async () => {
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.getByText("selectedId: none")).toBeInTheDocument();
    };

    it("with the close button", async () => {
      openDrawer();
      fireEvent.click(screen.getByRole("button", { name: "Close drawer" }));
      await closed();
    });

    it("with Escape", async () => {
      openDrawer();
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      await closed();
    });

    it("with a click on the backdrop", async () => {
      openDrawer();
      const backdrop = document.querySelector(".fixed.inset-0.bg-black\\/25");
      await userEvent.click(backdrop!);
      await closed();
    });
  });

  it("ensures filters are hidden in embedded transaction list", () => {
    render(<ExplorerPage transactions={mockTransactions} />);

    // Select an API to show the transaction list
    const usersApiNode = screen.getByText("users-api");
    fireEvent.click(usersApiNode);

    // Verify that filters are hidden in the embedded list
    expect(screen.getByText("hideFilters: true")).toBeInTheDocument();
  });
});
