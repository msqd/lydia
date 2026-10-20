import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { TransactionsExplorerSidebar } from "./TransactionsExplorerSidebar";

const meta: Meta<typeof TransactionsExplorerSidebar> = {
  title: "Elements/Transactions/TransactionsExplorerSidebar",
  component: TransactionsExplorerSidebar,
  decorators: [
    (Story) => (
      <div style={{ minWidth: "320px", width: "320px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**TransactionsExplorerSidebar** provides a hierarchical tree view of API endpoints extracted from transaction data. Features include:\n\n- **Automatic Tree Building**: Constructs API hierarchy from transaction URLs\n- **Visual Transaction Counts**: Shows transaction counts for each API and endpoint\n- **Interactive Navigation**: Expand/collapse folders and select endpoints\n- **Clean Design**: Matches the ExplorerPage aesthetic with consistent styling\n- **Icon Differentiation**: Different icons for APIs, folders, and endpoints",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    transactions: {
      description: "Array of transactions to build the tree from",
    },
    selectedPath: {
      control: "text",
      description: "Currently selected path in the tree",
    },
    title: {
      control: "text",
      description: "Custom title for the sidebar header",
    },
    onSelect: {
      description: "Callback when a tree node is selected",
    },
    onToggleExpand: {
      description: "Callback when a tree node is expanded/collapsed",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample transactions for the stories
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
      endpoints: [
        "/api/orders",
        "/api/orders/pending",
        "/api/orders/completed",
        "/api/orders/items",
        "/api/orders/shipping",
        "/api/orders/payment",
      ],
    },
    {
      name: "products-api",
      endpoints: [
        "/api/products",
        "/api/products/search",
        "/api/products/categories",
        "/api/products/categories/electronics",
        "/api/products/inventory",
        "/api/products/reviews",
      ],
    },
  ];

  const transactions: Transaction[] = [];
  let id = 1;

  apis.forEach((api) => {
    api.endpoints.forEach((endpoint) => {
      // Generate 2-5 transactions per endpoint
      const count = Math.floor(Math.random() * 4) + 2;
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

export const Default: Story = {
  args: {
    transactions: sampleTransactions,
    onSelect: fn(),
    onToggleExpand: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default TransactionsExplorerSidebar with a rich dataset of multiple APIs and endpoints. The tree automatically builds from the transaction data, showing API names at the top level with nested endpoints.",
      },
    },
  },
};

export const WithSelection: Story = {
  args: {
    transactions: sampleTransactions,
    selectedPath: "users-api",
    expandedNodes: new Set(["users-api"]),
    onSelect: fn(),
    onToggleExpand: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the sidebar with a selected API and expanded tree structure. The selected node is highlighted in blue.",
      },
    },
  },
};

export const WithDeepNesting: Story = {
  args: {
    transactions: [
      {
        id: "tx001",
        url: "/api/v1/resources/users/profiles/settings/privacy",
        method: "GET",
        status: "Successful",
        statusCode: 200,
        timestamp: "2025-05-20T10:00:00",
        responseTime: 100,
        client: "Website",
        apiName: "api-v1",
        userAgent: "Chrome/120",
        remoteAddress: "192.168.1.1",
      },
      {
        id: "tx002",
        url: "/api/v1/resources/users/profiles/settings/notifications",
        method: "PUT",
        status: "Successful",
        statusCode: 200,
        timestamp: "2025-05-20T10:05:00",
        responseTime: 150,
        client: "Mobile App",
        apiName: "api-v1",
        userAgent: "MobileApp/2.0",
        remoteAddress: "192.168.1.2",
      },
      {
        id: "tx003",
        url: "/api/v2/admin/system/config/database",
        method: "GET",
        status: "Successful",
        statusCode: 200,
        timestamp: "2025-05-20T10:10:00",
        responseTime: 200,
        client: "Admin Dashboard",
        apiName: "api-v2",
        userAgent: "AdminPanel/1.0",
        remoteAddress: "192.168.1.3",
      },
    ],
    expandedNodes: new Set(["api-v1", "api-v1/api", "api-v1/api/v1"]),
    onSelect: fn(),
    onToggleExpand: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates deep nesting capabilities with complex API versioning and nested folder structures. Shows how the tree handles multiple levels efficiently.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    transactions: [],
    onSelect: fn(),
    onToggleExpand: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Empty state when no transactions are provided. Shows a helpful message to guide users.",
      },
    },
  },
};

export const CustomTitle: Story = {
  args: {
    transactions: sampleTransactions.slice(0, 10), // Smaller dataset
    title: "Service Registry",
    onSelect: fn(),
    onToggleExpand: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Example with a custom title for different use cases. The sidebar can be adapted for various contexts.",
      },
    },
  },
};

// Interactive story with state management
export const Interactive: Story = {
  render: (args) => {
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const handleSelect = (path: string, type: string) => {
      setSelectedPath(path);
      args.onSelect?.(path, type);
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
      args.onToggleExpand?.(nodeId);
    };

    return (
      <div className="w-80 h-96">
        <TransactionsExplorerSidebar
          {...args}
          selectedPath={selectedPath}
          expandedNodes={expandedNodes}
          onSelect={handleSelect}
          onToggleExpand={handleToggleExpand}
        />
      </div>
    );
  },
  args: {
    transactions: sampleTransactions,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive example with state management. Click to select nodes and expand/collapse the tree structure. This demonstrates the component's real-world behavior.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the component to render
    await expect(canvas.getByText("API Endpoints")).toBeInTheDocument();

    // Click on the first API to expand it
    const firstApi = canvas.getByText("orders-api");
    await userEvent.click(firstApi);

    // Verify the API is selected and expanded by finding the parent container with proper class
    await expect(firstApi.closest('div[class*="bg-blue-50"]')).toBeInTheDocument();
  },
};
