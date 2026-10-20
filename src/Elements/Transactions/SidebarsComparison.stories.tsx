import { useFacetState } from "@msqd/lydia/Components/Facets";
import type { Filters } from "@msqd/lydia/Models/Filters";
import { deriveTransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { TransactionsExplorerSidebar } from "./TransactionsExplorerSidebar";
import { TransactionsFiltersSidebar } from "./TransactionsFiltersSidebar";

const meta: Meta = {
  title: "Elements/Transactions/SidebarsComparison",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**Sidebars Comparison** shows both TransactionsFiltersSidebar and TransactionsExplorerSidebar side by side for UI coherence evaluation. This allows for visual comparison of styling, spacing, and design consistency between the two related components.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample transactions for the explorer
const generateSampleTransactions = (): Transaction[] => {
  const apis = [
    {
      name: "users-api",
      endpoints: [
        "/api/users",
        "/api/users/profile",
        "/api/users/settings",
        "/api/users/preferences",
        "/api/auth/login",
        "/api/auth/logout",
        "/api/auth/verify",
      ],
    },
    {
      name: "orders-api",
      endpoints: ["/api/orders", "/api/orders/pending", "/api/orders/completed", "/api/orders/items"],
    },
    {
      name: "products-api",
      endpoints: ["/api/products", "/api/products/search", "/api/products/categories", "/api/products/inventory"],
    },
  ];

  const transactions: Transaction[] = [];
  let id = 1;

  apis.forEach((api) => {
    api.endpoints.forEach((endpoint) => {
      // Generate 2-4 transactions per endpoint
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        transactions.push({
          id: `tx${String(id).padStart(3, "0")}`,
          url: endpoint,
          method: ["GET", "POST", "PUT"][Math.floor(Math.random() * 3)],
          status: Math.random() > 0.9 ? "Failed" : "Successful",
          statusCode: Math.random() > 0.9 ? 500 : 200,
          timestamp: new Date(Date.now() - id * 60000).toISOString(),
          responseTime: Math.floor(Math.random() * 300) + 50,
          client: ["Mobile App", "Website", "Admin Dashboard"][Math.floor(Math.random() * 3)],
          apiName: api.name,
          userAgent: "StoryDemo/1.0",
          remoteAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        });
        id++;
      }
    });
  });

  return transactions;
};

const sampleTransactions = generateSampleTransactions();

// Sample filters for the filters sidebar
const sampleFilters: Filters = {
  endpoint: ["/api/users", "/api/orders"],
  method: ["GET", "POST"],
  status: ["2", "4"],
  flags: ["favorite"],
  tags: ["production"],
  time: {
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  },
  tpdex: { min: 30, max: 70 },
};

export const SideBySide: Story = {
  render: () => {
    // State for filters sidebar
    const { filters, handleFilterChange, resetFilters } = useFacetState(sampleFilters);

    // State for explorer sidebar
    const [selectedPath, setSelectedPath] = useState<string | null>("users-api");
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["users-api", "orders-api"]));

    const handleSelect = (path: string) => {
      setSelectedPath(path);
    };

    const handleToggleExpand = (nodeId: string) => {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    };

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sidebars Design Comparison</h1>
          <p className="text-gray-600">
            Compare the visual consistency between TransactionsFiltersSidebar and TransactionsExplorerSidebar. Both
            components should share similar header styling, spacing, and overall design language.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filters Sidebar */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Filters Sidebar</h2>
            <div className="w-80">
              <TransactionsFiltersSidebar
                filters={filters}
                onFiltersChange={handleFilterChange}
                onResetFilters={resetFilters}
                facets={deriveTransactionFacets(sampleTransactions)}
                title="Filters"
                showDefaultHeader={true}
              />
            </div>
          </div>

          {/* Explorer Sidebar */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Explorer Sidebar</h2>
            <div className="w-80">
              <TransactionsExplorerSidebar
                transactions={sampleTransactions}
                selectedPath={selectedPath}
                expandedNodes={expandedNodes}
                onSelect={handleSelect}
                onToggleExpand={handleToggleExpand}
                title="API Endpoints"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side comparison of both sidebar components. This story is designed to help evaluate visual consistency, spacing, and design patterns between the filters and explorer sidebars. Both components should feel like part of the same design system.",
      },
    },
  },
};

export const EmptyStates: Story = {
  render: () => {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empty States Comparison</h1>
          <p className="text-gray-600">Compare how both sidebars handle empty states and minimal content.</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filters Sidebar - No filters applied */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Filters (No Active Filters)</h2>
            <div className="w-80">
              <TransactionsFiltersSidebar
                filters={{}}
                onFiltersChange={fn()}
                onResetFilters={fn()}
                facets={deriveTransactionFacets(sampleTransactions)}
                title="Filters"
                showDefaultHeader={true}
              />
            </div>
          </div>

          {/* Explorer Sidebar - No transactions */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Explorer (No Data)</h2>
            <div className="w-80">
              <TransactionsExplorerSidebar
                transactions={[]}
                onSelect={fn()}
                onToggleExpand={fn()}
                title="API Endpoints"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comparison of how both sidebars handle empty or minimal states. This helps ensure consistent UX patterns when there's no data to display.",
      },
    },
  },
};

export const HeaderStyling: Story = {
  render: () => {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Header Styling Focus</h1>
          <p className="text-gray-600">
            Close examination of header styling consistency between both sidebar components.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filters with active count */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Filter Header (with count)</h2>
            <div className="w-80">
              <TransactionsFiltersSidebar
                filters={sampleFilters}
                onFiltersChange={fn()}
                onResetFilters={fn()}
                title="Transaction Filters"
                showDefaultHeader={true}
              />
            </div>
          </div>

          {/* Explorer with custom title */}
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Explorer Header</h2>
            <div className="w-80">
              <TransactionsExplorerSidebar
                transactions={sampleTransactions.slice(0, 15)}
                selectedPath="users-api"
                expandedNodes={new Set(["users-api"])}
                onSelect={fn()}
                onToggleExpand={fn()}
                title="Service Explorer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Focused comparison of header styling. Pay attention to typography, spacing, background colors, and border treatments to ensure visual consistency.",
      },
    },
  },
};
