import { sampleTransactions } from "@msqd/lydia/Models/Transactions/transactions.samples";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TransactionsListPage } from "./TransactionsListPage";

// Design-system children render for real in this file. Mocking Badge, TpdexBadge or the Http
// elements would make the snapshot record the page's skeleton against itself: #45 changed badge
// sizing on this page and moved no snapshot, because the badges were mocked away. Mock only what
// this page hands no props to. See #56.

const facets = {
  endpoint: [
    { name: "/api/orders", label: "/api/orders", count: 3 },
    { name: "/api/carts", label: "/api/carts", count: 7 },
  ],
  method: [{ name: "GET", label: "GET", count: 2 }],
};

const driven = {
  facets,
  filters: {},
  onFiltersChange: () => undefined,
  onResetFilters: () => undefined,
  search: "",
  onSearchChange: () => undefined,
  onPageChange: () => undefined,
};

describe("TransactionsListPage", () => {
  describe("filters sidebar open state", () => {
    const hide = () => screen.getByRole("button", { name: "Hide filters sidebar" });
    const show = () => screen.getByRole("button", { name: "Show filters sidebar" });

    it("starts closed and opens on its own when uncontrolled", async () => {
      const user = userEvent.setup();
      render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

      await user.click(show());
      expect(hide()).toBeInTheDocument();
    });

    it("keeps two instances independent", async () => {
      const user = userEvent.setup();
      render(
        <>
          <TransactionsListPage {...driven} transactions={sampleTransactions} />
          <TransactionsListPage {...driven} transactions={sampleTransactions} />
        </>,
      );

      await user.click(screen.getAllByRole("button", { name: "Show filters sidebar" })[0]);
      expect(screen.getAllByRole("button", { name: "Hide filters sidebar" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Show filters sidebar" })).toHaveLength(1);
    });

    it("follows filtersOpen and reports changes without changing itself when controlled", async () => {
      const user = userEvent.setup();
      const onFiltersOpenChange = vi.fn();
      const { rerender } = render(
        <TransactionsListPage
          {...driven}
          transactions={sampleTransactions}
          filtersOpen={true}
          onFiltersOpenChange={onFiltersOpenChange}
        />,
      );

      await user.click(hide());
      expect(onFiltersOpenChange).toHaveBeenCalledWith(false);
      expect(hide()).toBeInTheDocument();

      rerender(
        <TransactionsListPage
          {...driven}
          transactions={sampleTransactions}
          filtersOpen={false}
          onFiltersOpenChange={onFiltersOpenChange}
        />,
      );
      expect(show()).toBeInTheDocument();
    });

    it("writes nothing to browser storage", async () => {
      const user = userEvent.setup();
      localStorage.clear();
      sessionStorage.clear();
      render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

      await user.click(show());
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });
  });

  it("renders the page title and description", () => {
    const { container } = render(
      <TransactionsListPage {...driven} transactions={sampleTransactions} data-testid="transaction-list" />,
    );

    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("View and manage transaction history across all API endpoints.")).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  describe("it renders what it is given", () => {
    it("does not apply the filters it displays", () => {
      // The sharpest statement of the contract: a filter that contradicts every row changes
      // nothing, because filtering is the consumer's job.
      render(
        <TransactionsListPage
          {...driven}
          filters={{ method: ["NOTHING-MATCHES-THIS"] }}
          transactions={sampleTransactions}
        />,
      );

      expect(screen.getAllByRole("row")).toHaveLength(sampleTransactions.length + 1); // + header
    });

    it("does not apply the search term it displays", () => {
      render(<TransactionsListPage {...driven} search="no-such-endpoint" transactions={sampleTransactions} />);

      expect(screen.getAllByRole("row")).toHaveLength(sampleTransactions.length + 1);
    });

    it("does not slice the list to a page", () => {
      render(
        <TransactionsListPage {...driven} transactions={sampleTransactions} itemsPerPage={2} total={200} page={3} />,
      );

      expect(screen.getAllByRole("row")).toHaveLength(sampleTransactions.length + 1);
    });
  });

  describe("it reports what the user asks for", () => {
    it("reports a facet change without touching the list", () => {
      const onFiltersChange = vi.fn();
      render(<TransactionsListPage {...driven} onFiltersChange={onFiltersChange} transactions={sampleTransactions} />);

      fireEvent.click(screen.getByText("filters"));
      // A tick narrows to the value it chooses (msqd/jaco#129).
      fireEvent.click(screen.getByRole("checkbox", { name: /\/api\/orders/ }));

      expect(onFiltersChange).toHaveBeenCalledWith("endpoint", ["/api/orders"]);
      expect(screen.getAllByRole("row")).toHaveLength(sampleTransactions.length + 1);
    });

    it("reports a search term without touching the list", () => {
      const onSearchChange = vi.fn();
      render(<TransactionsListPage {...driven} onSearchChange={onSearchChange} transactions={sampleTransactions} />);

      const searchInput = screen.getByPlaceholderText("Search by endpoint, method, status...");
      fireEvent.change(searchInput, { target: { value: "orders" } });
      fireEvent.keyDown(searchInput, { key: "Enter" });

      expect(onSearchChange).toHaveBeenCalledWith("orders");
      expect(screen.getAllByRole("row")).toHaveLength(sampleTransactions.length + 1);
    });

    it("reports a page change without touching the list", () => {
      const onPageChange = vi.fn();
      render(
        <TransactionsListPage
          {...driven}
          onPageChange={onPageChange}
          transactions={sampleTransactions}
          total={100}
          itemsPerPage={10}
        />,
      );

      fireEvent.click(screen.getAllByText("Next")[0]);

      expect(onPageChange).toHaveBeenCalledWith(2);
      expect(screen.getAllByRole("row")).toHaveLength(sampleTransactions.length + 1);
    });
  });

  describe("the facets it offers are the consumer's", () => {
    it("offers exactly the values it was given, with the counts it was given", () => {
      render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);
      fireEvent.click(screen.getByText("filters"));

      expect(screen.getByRole("checkbox", { name: /\/api\/orders/ })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /\/api\/carts/ })).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    it("offers nothing it was not given, rather than inventing a vocabulary", () => {
      // The defect this replaces: the sidebar offered /api/users and claimed 245 of them, whatever
      // transactions were passed.
      render(<TransactionsListPage {...driven} facets={{}} transactions={sampleTransactions} />);
      fireEvent.click(screen.getByText("filters"));

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      expect(screen.queryByText("/api/users")).not.toBeInTheDocument();
      expect(screen.getAllByText("No values").length).toBeGreaterThan(0);
    });
  });

  describe("nothing to show", () => {
    it("says the filters matched nothing when filters are active", () => {
      render(<TransactionsListPage {...driven} filters={{ method: ["GET"] }} transactions={[]} />);

      expect(screen.getByText("No transactions match these filters.")).toBeInTheDocument();
      expect(screen.queryByText("No transactions yet.")).not.toBeInTheDocument();
    });

    it("says the filters matched nothing when only a search term is active", () => {
      render(<TransactionsListPage {...driven} search="orders" transactions={[]} />);

      expect(screen.getByText("No transactions match these filters.")).toBeInTheDocument();
    });

    it("says there is no data when nothing is narrowed", () => {
      render(<TransactionsListPage {...driven} transactions={[]} />);

      expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
    });

    it("offers a way out of an empty filtered view", () => {
      const onResetFilters = vi.fn();
      render(
        <TransactionsListPage
          {...driven}
          onResetFilters={onResetFilters}
          filters={{ method: ["GET"] }}
          transactions={[]}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

      expect(onResetFilters).toHaveBeenCalled();
    });

    it("does not treat an empty selection as an active filter", () => {
      // An untouched facet arrives as an empty array. Reading that as "filtered" would tell a
      // consumer with no data that its filters were at fault.
      render(<TransactionsListPage {...driven} filters={{ method: [], tpdex: {} }} transactions={[]} />);

      expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("says it is loading rather than that there is nothing", () => {
      render(<TransactionsListPage {...driven} isLoading transactions={[]} />);

      expect(screen.getByRole("status")).toHaveTextContent("Loading transactions");
      expect(screen.queryByText("No transactions yet.")).not.toBeInTheDocument();
      expect(screen.queryByText("No transactions match these filters.")).not.toBeInTheDocument();
    });

    it("says it is loading rather than showing a stale filtered-empty message", () => {
      render(<TransactionsListPage {...driven} isLoading filters={{ method: ["GET"] }} transactions={[]} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByText("No transactions match these filters.")).not.toBeInTheDocument();
    });
  });

  describe("controls appear only when they lead somewhere", () => {
    it("hides the search field when the consumer cannot receive the term", () => {
      render(<TransactionsListPage transactions={sampleTransactions} />);

      expect(screen.queryByPlaceholderText("Search by endpoint, method, status...")).not.toBeInTheDocument();
    });

    it("hides the filters sidebar when the consumer cannot receive the filters", () => {
      render(<TransactionsListPage transactions={sampleTransactions} />);

      expect(screen.queryByText("filters")).not.toBeInTheDocument();
    });

    it("hides the title, search and filters when embedded", () => {
      render(<TransactionsListPage {...driven} transactions={sampleTransactions} variant="embedded" />);

      expect(screen.queryByText("Transactions")).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Search by endpoint, method, status...")).not.toBeInTheDocument();
      expect(screen.queryByText("filters")).not.toBeInTheDocument();
    });
  });

  it("renders the transaction table with pagination", () => {
    render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

    expect(screen.getByRole("columnheader", { name: "Request" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Response" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Duration" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Date" })).toBeInTheDocument();

    // Top and bottom pagination, each in a mobile and a desktop view
    expect(screen.getAllByText("Previous")).toHaveLength(4);
    expect(screen.getAllByText("Next")).toHaveLength(4);
  });

  it("can toggle filter visibility", () => {
    render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

    fireEvent.click(screen.getByText("filters"));

    expect(screen.getByRole("heading", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Method" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Endpoint" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Time" })).toBeInTheDocument();
    expect(screen.getByText("hide")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <TransactionsListPage
        {...driven}
        transactions={sampleTransactions}
        className="custom-class"
        data-testid="transaction-list"
      />,
    );

    const transactionList = screen.getByTestId("transaction-list");
    expect(transactionList).toHaveClass("custom-class");
    expect(transactionList).toHaveClass("space-y-6");
  });

  it("reports the transaction a row belongs to when it is clicked", () => {
    const onRowClick = vi.fn();
    const onTransactionSelect = vi.fn();
    const { container } = render(
      <TransactionsListPage
        {...driven}
        transactions={sampleTransactions}
        onRowClick={onRowClick}
        onTransactionSelect={onTransactionSelect}
      />,
    );

    fireEvent.click(container.querySelectorAll("tbody tr")[0]);

    expect(onRowClick).toHaveBeenCalledWith(sampleTransactions[0].id);
    expect(onTransactionSelect).toHaveBeenCalledWith(sampleTransactions[0]);
  });

  it("keeps a row's favorite state when another row is selected", () => {
    const { container } = render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

    const star = screen.getByRole("button", { name: "Favourite GET /api/users/123/profile" });
    fireEvent.click(star);
    expect(star).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(container.querySelectorAll("tbody tr")[1]);

    expect(screen.getByRole("button", { name: "Favourite GET /api/users/123/profile" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  /**
   * The star was an `svg` with a click handler: a mouse could favourite a row,
   * a keyboard could not reach it, and a screen reader heard nothing. It is a
   * toggle button now, named by the transaction it marks.
   */
  it("favourites a row from the keyboard, without choosing the row", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<TransactionsListPage {...driven} transactions={sampleTransactions} onRowClick={onRowClick} />);

    const star = screen.getByRole("button", { name: "Favourite GET /api/users/123/profile" });
    expect(star).toHaveAttribute("aria-pressed", "false");

    star.focus();
    await user.keyboard(" ");
    expect(star).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Enter}");
    expect(star).toHaveAttribute("aria-pressed", "false");
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe("the transactions table's headers", () => {
  it("names the favourite column, whose header shows no text", () => {
    render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

    expect(screen.getByRole("columnheader", { name: "Favourite" })).toBeInTheDocument();
  });

  it("names its two paginators apart, above and below the list", () => {
    render(<TransactionsListPage {...driven} transactions={sampleTransactions} />);

    expect(screen.getByRole("navigation", { name: "Pagination, above the list" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Pagination, below the list" })).toBeInTheDocument();
  });
});

describe("pagination landmarks of a named page", () => {
  it("takes the page's aria-label into the names of its paginators", () => {
    render(<TransactionsListPage {...driven} transactions={sampleTransactions} aria-label="Errors" />);

    expect(screen.getByRole("navigation", { name: "Errors, pagination above the list" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Errors, pagination below the list" })).toBeInTheDocument();
  });

  it("takes the page's aria-labelledby into the names of its paginators", () => {
    render(
      <>
        <h2 id="errors-title">Errors</h2>
        <TransactionsListPage {...driven} transactions={sampleTransactions} aria-labelledby="errors-title" />
      </>,
    );

    expect(screen.getByRole("navigation", { name: "Errors pagination above the list" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Errors pagination below the list" })).toBeInTheDocument();
  });

  it("tells two named pages' landmarks apart", () => {
    render(
      <>
        <TransactionsListPage {...driven} transactions={sampleTransactions} aria-label="Errors" />
        <TransactionsListPage {...driven} transactions={sampleTransactions} aria-label="Slow requests" />
      </>,
    );

    expect(screen.getAllByRole("navigation", { name: /^Errors, / })).toHaveLength(2);
    expect(screen.getAllByRole("navigation", { name: /^Slow requests, / })).toHaveLength(2);
  });
});
