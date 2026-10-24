import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionsExplorerSidebar, buildApiTree } from "./TransactionsExplorerSidebar";

const mockTransactions: Transaction[] = [
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
];

describe("TransactionsExplorerSidebar", () => {
  it("renders with default props", () => {
    render(<TransactionsExplorerSidebar transactions={mockTransactions} />);
    expect(screen.getByText("API Endpoints")).toBeInTheDocument();
  });

  it("displays API names and transaction counts", () => {
    render(<TransactionsExplorerSidebar transactions={mockTransactions} />);

    expect(screen.getByText("users-api")).toBeInTheDocument();
    expect(screen.getByText("products-api")).toBeInTheDocument();

    // Check transaction counts
    const countElements = screen.getAllByText("2");
    expect(countElements.length).toBeGreaterThan(0); // users-api count
    expect(screen.getByText("1")).toBeInTheDocument(); // products-api count
  });

  it("shows empty state when no transactions", () => {
    render(<TransactionsExplorerSidebar transactions={[]} />);
    expect(screen.getByText("No APIs found")).toBeInTheDocument();
  });

  it("calls onSelect when API is clicked", () => {
    const onSelect = vi.fn();
    render(<TransactionsExplorerSidebar transactions={mockTransactions} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("users-api"));
    expect(onSelect).toHaveBeenCalledWith({ type: "api", apiName: "users-api", segments: [] });
  });

  it("calls onToggleExpand when API is clicked", () => {
    const onToggleExpand = vi.fn();
    render(<TransactionsExplorerSidebar transactions={mockTransactions} onToggleExpand={onToggleExpand} />);

    fireEvent.click(screen.getByText("users-api"));
    expect(onToggleExpand).toHaveBeenCalledWith("users-api");
  });

  /**
   * The chevron is a button with only an icon in it. Unnamed, a screen reader
   * announces "button" and nothing else, once per folder (axe `button-name`).
   */
  it("names each disclosure button by its node, and says whether it is open", () => {
    const onToggleExpand = vi.fn();
    render(
      <TransactionsExplorerSidebar
        transactions={mockTransactions}
        expandedNodes={new Set(["users-api"])}
        onToggleExpand={onToggleExpand}
      />,
    );

    const open = screen.getByRole("button", { name: "users-api" });
    expect(open).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "products-api" })).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(open);
    expect(onToggleExpand).toHaveBeenCalledWith("users-api");
  });

  it("shows expanded nodes when in expandedNodes set", () => {
    const expandedNodes = new Set(["users-api"]);
    render(<TransactionsExplorerSidebar transactions={mockTransactions} expandedNodes={expandedNodes} />);

    // Should show child nodes when expanded
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("highlights selected path", () => {
    render(
      <TransactionsExplorerSidebar
        transactions={mockTransactions}
        selected={{ type: "api", apiName: "users-api", segments: [] }}
      />,
    );

    // Find the clickable container div that has the background color
    const selectedNode = screen.getByText("users-api").closest(".cursor-pointer");
    expect(selectedNode).toHaveClass("bg-blue-50");
  });

  it("reports the structured selection of a nested node", () => {
    const onSelect = vi.fn();
    render(
      <TransactionsExplorerSidebar
        transactions={mockTransactions}
        expandedNodes={new Set(["users-api", "users-api/api", "users-api/api/users"])}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText("profile"));
    expect(onSelect).toHaveBeenCalledWith({
      type: "endpoint",
      apiName: "users-api",
      segments: ["api", "users", "profile"],
    });
  });

  describe("expansion", () => {
    it("expands and collapses on its own when expandedNodes is not given", () => {
      render(<TransactionsExplorerSidebar transactions={mockTransactions} />);
      expect(screen.queryByText("api")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "users-api" }));
      expect(screen.getByText("api")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "users-api" }));
      expect(screen.queryByText("api")).not.toBeInTheDocument();
    });

    it("reports changes of its own expansion through onToggleExpand", () => {
      const onToggleExpand = vi.fn();
      render(<TransactionsExplorerSidebar transactions={mockTransactions} onToggleExpand={onToggleExpand} />);

      fireEvent.click(screen.getByRole("button", { name: "users-api" }));
      expect(onToggleExpand).toHaveBeenCalledWith("users-api");
      expect(screen.getByText("api")).toBeInTheDocument();
    });

    it("leaves expansion to the caller when expandedNodes is given", () => {
      const onToggleExpand = vi.fn();
      render(
        <TransactionsExplorerSidebar
          transactions={mockTransactions}
          expandedNodes={new Set()}
          onToggleExpand={onToggleExpand}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "users-api" }));
      expect(onToggleExpand).toHaveBeenCalledWith("users-api");
      expect(screen.queryByText("api")).not.toBeInTheDocument();
    });
  });

  it("supports custom title", () => {
    render(<TransactionsExplorerSidebar transactions={mockTransactions} title="Custom API Explorer" />);

    expect(screen.getByText("Custom API Explorer")).toBeInTheDocument();
  });

  it("supports custom className", () => {
    const { container } = render(
      <TransactionsExplorerSidebar transactions={mockTransactions} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows folder and endpoint icons", () => {
    const expandedNodes = new Set(["users-api"]);
    render(<TransactionsExplorerSidebar transactions={mockTransactions} expandedNodes={expandedNodes} />);

    // Check for SVG icons in the tree structure
    const container = screen.getByText("users-api").closest("div");
    const svgIcons = container?.querySelectorAll("svg");
    expect(svgIcons).toBeDefined();
    expect(svgIcons!.length).toBeGreaterThan(0);
  });

  it("handles chevron button clicks", () => {
    const onToggleExpand = vi.fn();
    render(<TransactionsExplorerSidebar transactions={mockTransactions} onToggleExpand={onToggleExpand} />);

    // Find and click the chevron button
    const chevronButtons = screen.getAllByRole("button");
    const chevronButton = chevronButtons.find(
      (btn) => btn.querySelector("svg") && btn.classList.contains("hover:bg-gray-200"),
    );

    if (chevronButton) {
      fireEvent.click(chevronButton);
      expect(onToggleExpand).toHaveBeenCalled();
    }
  });
});

describe("buildApiTree", () => {
  const countsOf = (transactions: Transaction[]) =>
    Object.fromEntries(
      buildApiTree(transactions).flatMap(function flatten(node): [string, number | undefined][] {
        return [[node.id, node.transactionCount], ...(node.children ?? []).flatMap(flatten)];
      }),
    );

  it.each([
    [
      "a transaction without apiName under the unknown-API node",
      [{ url: "/api/a", apiName: undefined }],
      { "unknown-api": 1, "unknown-api/api": 1, "unknown-api/api/a": 1 },
    ],
    [
      "a query string dropped from the node",
      [{ url: "/api/analytics/report?period=daily" }],
      { "users-api": 1, "users-api/api": 1, "users-api/api/analytics": 1, "users-api/api/analytics/report": 1 },
    ],
    [
      "a full URL without host node",
      [{ url: "https://host/api/x" }],
      { "users-api": 1, "users-api/api": 1, "users-api/api/x": 1 },
    ],
    [
      "a name that is only a prefix of another not counted",
      [{ url: "/api/user" }, { url: "/api/users/1" }],
      {
        "users-api": 2,
        "users-api/api": 2,
        "users-api/api/user": 1,
        "users-api/api/users": 1,
        "users-api/api/users/1": 1,
      },
    ],
  ])("%s", (_label, overrides, expected) => {
    const transactions = overrides.map((o, i) => ({ ...mockTransactions[0], id: `t${i}`, ...o }));
    expect(countsOf(transactions)).toEqual(expected);
  });

  it("carries the selection each node reports", () => {
    const [products] = buildApiTree(mockTransactions);
    expect(products.apiName).toBe("products-api");
    expect(products.children?.[0].segments).toEqual(["api"]);
  });

  it("builds correct tree structure", () => {
    const tree = buildApiTree(mockTransactions);

    expect(tree).toHaveLength(2); // users-api and products-api
    expect(tree[0].name).toBe("products-api"); // sorted alphabetically
    expect(tree[1].name).toBe("users-api");

    // Check transaction counts
    expect(tree.find((node) => node.name === "users-api")?.transactionCount).toBe(2);
    expect(tree.find((node) => node.name === "products-api")?.transactionCount).toBe(1);
  });

  it("handles empty transactions array", () => {
    const tree = buildApiTree([]);
    expect(tree).toHaveLength(0);
  });

  it("builds hierarchical structure for nested paths", () => {
    const nestedTransactions: Transaction[] = [
      {
        ...mockTransactions[0],
        url: "/api/v1/users/profile/settings",
      },
    ];

    const tree = buildApiTree(nestedTransactions);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toBeDefined();
    expect(tree[0].children!.length).toBeGreaterThan(0);
  });
});
