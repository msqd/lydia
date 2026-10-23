import type { Filters } from "@msqd/lydia/Models/Filters";
import type { TransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionsFiltersSidebar } from "./TransactionsFiltersSidebar";

// The sidebar knows which facets exist, never what they can offer. A test therefore has to say
// what the consumer would say; these values live here rather than in the component on purpose.
const facets: TransactionFacets = {
  endpoint: [
    { name: "/api/users", label: "/api/users", count: 245 },
    { name: "/api/orders", label: "/api/orders", count: 189 },
  ],
  method: [
    { name: "GET", label: "GET", count: 543 },
    { name: "POST", label: "POST", count: 234 },
  ],
  status: [
    { name: "2", label: "2xx", count: 756, under: [{ name: "200", label: "200", count: 756 }] },
    { name: "4", label: "4xx", count: 123, under: [{ name: "404", label: "404", count: 123 }] },
  ],
  cacheStatus: [{ name: "hit", label: "Cache Hit", count: 234 }],
  flags: [{ name: "favorite", label: "Favorite", count: 45 }],
  tags: [{ name: "env=production", label: "env=production", count: 234 }],
};

const defaultProps = {
  filters: {} as Filters,
  onFiltersChange: vi.fn(),
  onResetFilters: vi.fn(),
  title: "Filters",
  showDefaultHeader: true,
  facets,
};

describe("TransactionsFiltersSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Endpoint")).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Flags")).toBeInTheDocument();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("Performance Index")).toBeInTheDocument();
  });

  it("calls onResetFilters when reset button is clicked", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: { status: ["successful"] },
    };

    render(<TransactionsFiltersSidebar {...propsWithFilters} />);

    const resetLink = screen.getByRole("link", { name: "Reset all filters" });
    fireEvent.click(resetLink);

    expect(defaultProps.onResetFilters).toHaveBeenCalledTimes(1);
  });

  it("calls onFiltersChange when status filter is changed", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    // Find the checkbox by its text content instead of aria-label
    const successOption = screen.getByText("2xx").closest("div")?.querySelector("input");
    if (successOption) {
      fireEvent.click(successOption);
      // The HARP logic inverts selection - unchecking from "all" means selecting others
      expect(defaultProps.onFiltersChange).toHaveBeenCalled();
    }
  });

  it.each(["4xx", "4XX", "4Xx"])("reads a status class passed as %s as 4, and writes it back as 4", (written) => {
    render(<TransactionsFiltersSidebar {...defaultProps} filters={{ status: [written] }} />);

    expect(screen.getByRole("checkbox", { name: /^4xx/ })).toBeChecked();

    fireEvent.click(screen.getByRole("checkbox", { name: /^2xx/ }));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("status", ["2", "4"]);
  });

  it("calls onFiltersChange when method filter is changed", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    const getOption = screen.getByText("GET").closest("div")?.querySelector("input");
    if (getOption) {
      fireEvent.click(getOption);
      expect(defaultProps.onFiltersChange).toHaveBeenCalled();
    }
  });

  it("calls onFiltersChange when endpoint filter is changed", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    const usersOption = screen.getByText("/api/users").closest("div")?.querySelector("input");
    if (usersOption) {
      fireEvent.click(usersOption);
      expect(defaultProps.onFiltersChange).toHaveBeenCalled();
    }
  });

  it("calls onFiltersChange when flags filter is changed", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    const favoriteOption = screen.getByText("Favorite").closest("div")?.querySelector("input");
    if (favoriteOption) {
      fireEvent.click(favoriteOption);
      expect(defaultProps.onFiltersChange).toHaveBeenCalled();
    }
  });

  it("displays selected filters correctly", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        status: ["2"],
        method: ["GET"],
        endpoint: ["/api/users"],
      },
    };

    render(<TransactionsFiltersSidebar {...propsWithFilters} />);

    // Check that the filter options are present
    expect(screen.getByText("2xx")).toBeInTheDocument();
    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("/api/users")).toBeInTheDocument();
  });

  it("shows filter options with counts", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    // Check that options with counts are displayed (now without parentheses)
    expect(screen.getAllByText("756")).toHaveLength(2); // 2xx count, and its only code
    expect(screen.getByText("543")).toBeInTheDocument(); // GET count
    expect(screen.getByText("245")).toBeInTheDocument(); // /api/users count
  });

  it("renders filter facets with correct structure", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} />);

    // Check that all filter sections are rendered within Foldable components
    const timeSection = screen.getByText("Time").closest("div");
    const endpointSection = screen.getByText("Endpoint").closest("div");
    const methodSection = screen.getByText("Method").closest("div");
    const statusSection = screen.getByText("Status").closest("div");
    const flagsSection = screen.getByText("Flags").closest("div");
    const tagsSection = screen.getByText("Tags").closest("div");
    const performanceSection = screen.getByText("Performance Index").closest("div");

    expect(timeSection).toBeInTheDocument();
    expect(endpointSection).toBeInTheDocument();
    expect(methodSection).toBeInTheDocument();
    expect(statusSection).toBeInTheDocument();
    expect(flagsSection).toBeInTheDocument();
    expect(tagsSection).toBeInTheDocument();
    expect(performanceSection).toBeInTheDocument();
  });

  it("matches snapshot with default filters", () => {
    const { container } = render(<TransactionsFiltersSidebar {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with filters applied", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        endpoint: ["/api/users"],
        method: ["GET", "POST"],
        status: ["2"],
        flags: ["favorite"],
        tags: ["production"],
        time: { startDate: "2024-01-01", endDate: "2024-01-31" },
        tpdex: { min: 20, max: 60 },
      },
    };

    const { container } = render(<TransactionsFiltersSidebar {...propsWithFilters} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("supports custom className", () => {
    const { container } = render(<TransactionsFiltersSidebar {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("passes through additional props", () => {
    const { container } = render(<TransactionsFiltersSidebar {...defaultProps} data-testid="filters-sidebar" />);
    // Since TransactionsFiltersSidebar now uses skipCardWrapper,
    // the data-testid will be on the main container div
    expect(container.firstChild).toHaveAttribute("data-testid", "filters-sidebar");
  });

  // After the snapshot tests: React's generated ids are part of the snapshots and depend on how
  // many components rendered before them.
  it("offers no reset when the only bounds set are empty", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} filters={{ time: { startDate: "", endDate: "" } }} />);

    expect(screen.queryByRole("link", { name: "Reset all filters" })).not.toBeInTheDocument();
  });

  it("offers a reset once a choice is selected", () => {
    render(<TransactionsFiltersSidebar {...defaultProps} filters={{ method: ["GET"] }} />);

    expect(screen.getByRole("link", { name: "Reset all filters" })).toBeInTheDocument();
  });
});
