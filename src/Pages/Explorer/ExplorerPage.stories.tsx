import { DefaultLayout } from "@msqd/lydia/Components/Layouts";
import { ApilabLogotype, DefaultLogo } from "@msqd/lydia/Components/NavBar/NavBar";
import { ToastProvider } from "@msqd/lydia/Components/Toast";
import type { DetailedTransaction, Transaction } from "@msqd/lydia/Models/Transactions/types";
import { toDetailedTransaction } from "@msqd/lydia/Pages/Transactions/Detail/TransactionsDetailPage.samples";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExplorerPage } from "./ExplorerPage";

// Layout wrapper for consistent page presentation
const LayoutWrapper = (Story: React.ComponentType) => (
  <ToastProvider>
    <DefaultLayout
      navBarProps={{
        logo: <DefaultLogo />,
        brand: <ApilabLogotype />,
        // Using default navigation which includes System link
        // Explorer is set as current by default, but we could customize if needed
      }}
    >
      <Story />
    </DefaultLayout>
  </ToastProvider>
);

const meta = {
  title: "Pages/ExplorerPage",
  component: ExplorerPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**ExplorerPage** provides a Windows Explorer-like interface for browsing API endpoints hierarchically. Features include:\n\n- **Tree View Navigation**: APIs at the top level with path segments as nested folders\n- **Minimal Transaction List**: Completely filter-free view for focused exploration\n- **Transaction Details**: Click any transaction to view details in a right drawer\n- **Smart Grouping**: Automatic endpoint discovery from transaction data\n- **Real-time Counts**: See transaction counts for each endpoint\n- **Responsive Design**: Split-pane layout optimized for exploration",
      },
    },
  },
  decorators: [LayoutWrapper],
} satisfies Meta<typeof ExplorerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate rich transaction data with various APIs and endpoints
const generateExplorerTransactions = (): DetailedTransaction[] => {
  const apis = [
    {
      name: "users-api",
      endpoints: [
        "/api/users",
        "/api/users/profile",
        "/api/users/settings",
        "/api/users/preferences",
        "/api/users/sessions",
        "/api/users/sessions/active",
        "/api/users/sessions/history",
        "/api/auth/login",
        "/api/auth/logout",
        "/api/auth/refresh",
        "/api/auth/verify",
        "/api/auth/2fa/enable",
        "/api/auth/2fa/verify",
      ],
    },
    {
      name: "orders-api",
      endpoints: [
        "/api/orders",
        "/api/orders/pending",
        "/api/orders/completed",
        "/api/orders/cancelled",
        "/api/orders/items",
        "/api/orders/items/add",
        "/api/orders/items/remove",
        "/api/orders/shipping",
        "/api/orders/shipping/track",
        "/api/orders/payment",
        "/api/orders/payment/refund",
      ],
    },
    {
      name: "products-api",
      endpoints: [
        "/api/products",
        "/api/products/search",
        "/api/products/categories",
        "/api/products/categories/electronics",
        "/api/products/categories/clothing",
        "/api/products/categories/books",
        "/api/products/inventory",
        "/api/products/inventory/update",
        "/api/products/reviews",
        "/api/products/reviews/add",
      ],
    },
    {
      name: "analytics-api",
      endpoints: [
        "/api/analytics/dashboard",
        "/api/analytics/reports",
        "/api/analytics/reports/daily",
        "/api/analytics/reports/weekly",
        "/api/analytics/reports/monthly",
        "/api/analytics/metrics",
        "/api/analytics/metrics/performance",
        "/api/analytics/metrics/usage",
        "/api/analytics/export",
      ],
    },
    {
      name: "notifications-api",
      endpoints: [
        "/api/notifications",
        "/api/notifications/email",
        "/api/notifications/sms",
        "/api/notifications/push",
        "/api/notifications/preferences",
        "/api/notifications/templates",
        "/api/notifications/history",
      ],
    },
  ];

  const transactions: Transaction[] = [];
  const baseTime = new Date();
  let id = 1;

  apis.forEach((api) => {
    api.endpoints.forEach((endpoint) => {
      // Generate 3-10 transactions per endpoint
      const transactionCount = Math.floor(Math.random() * 8) + 3;

      for (let i = 0; i < transactionCount; i++) {
        const timestamp = new Date(baseTime.getTime() - (id - 1) * 5 * 60 * 1000); // 5 minutes apart
        const methods =
          endpoint.includes("/add") || endpoint.includes("/update") || endpoint.includes("/login")
            ? ["POST"]
            : endpoint.includes("/remove") || endpoint.includes("/logout")
              ? ["DELETE"]
              : ["GET", "POST", "PUT"];
        const method = methods[Math.floor(Math.random() * methods.length)];

        // Vary response times and success rates by API type
        let responseTime: number;
        let status: "Successful" | "Failed";
        let statusCode: number;

        if (api.name === "analytics-api" && endpoint.includes("reports")) {
          // Analytics reports are slower
          responseTime = Math.floor(Math.random() * 2000) + 1000;
          status = Math.random() > 0.95 ? "Failed" : "Successful";
          statusCode = status === "Failed" ? 504 : 200;
        } else if (endpoint.includes("search")) {
          // Search endpoints have medium latency
          responseTime = Math.floor(Math.random() * 500) + 200;
          status = Math.random() > 0.98 ? "Failed" : "Successful";
          statusCode = status === "Failed" ? 500 : 200;
        } else {
          // Most endpoints are fast
          responseTime = Math.floor(Math.random() * 200) + 50;
          status = Math.random() > 0.97 ? "Failed" : "Successful";
          statusCode = status === "Failed" ? (Math.random() > 0.5 ? 404 : 500) : method === "POST" ? 201 : 200;
        }

        transactions.push({
          id: `tx${String(id).padStart(4, "0")}`,
          url: endpoint,
          method,
          status,
          statusCode,
          timestamp: timestamp.toISOString(),
          responseTime,
          client: ["Mobile App", "Website", "Admin Dashboard", "External API"][Math.floor(Math.random() * 4)],
          apiName: api.name,
          userAgent: "ExplorerDemo/1.0",
          remoteAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        });

        id++;
      }
    });
  });

  return transactions.map(toDetailedTransaction);
};

export const Default: Story = {
  args: {
    transactions: generateExplorerTransactions(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "**Default ExplorerPage** with a rich dataset of 5 APIs and multiple nested endpoints. Click on any API name to see all its transactions, or drill down to specific endpoints. The minimal transaction list is completely filter-free for focused exploration - click any transaction to view full details in the drawer.",
      },
    },
  },
};

export const WithSimpleStructure: Story = {
  args: {
    transactions: (
      [
        {
          id: "tx001",
          url: "/api/users",
          method: "GET",
          status: "Successful",
          statusCode: 200,
          timestamp: new Date().toISOString(),
          responseTime: 87,
          client: "Mobile App",
          apiName: "users-api",
          userAgent: "MyApp/1.0",
          remoteAddress: "192.168.1.1",
        },
        {
          id: "tx002",
          url: "/api/users/123",
          method: "GET",
          status: "Successful",
          statusCode: 200,
          timestamp: new Date(Date.now() - 60000).toISOString(),
          responseTime: 92,
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
          timestamp: new Date(Date.now() - 120000).toISOString(),
          responseTime: 156,
          client: "Admin Dashboard",
          apiName: "products-api",
          userAgent: "AdminPanel/2.0",
          remoteAddress: "192.168.1.3",
        },
      ] satisfies Transaction[]
    ).map(toDetailedTransaction),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A simple example with just two APIs and a few endpoints, demonstrating the basic tree structure and transaction filtering.",
      },
    },
  },
};

export const WithDeepNesting: Story = {
  args: {
    transactions: (() => {
      const transactions: Transaction[] = [];
      const deepPaths = [
        "/api/v1/resources/users/profiles/settings/privacy",
        "/api/v1/resources/users/profiles/settings/notifications",
        "/api/v1/resources/users/profiles/settings/security",
        "/api/v1/resources/users/profiles/preferences",
        "/api/v1/resources/users/sessions",
        "/api/v2/resources/products/categories/electronics/phones",
        "/api/v2/resources/products/categories/electronics/laptops",
        "/api/v2/resources/products/inventory",
        "/api/v3/admin/system/config/database",
        "/api/v3/admin/system/config/cache",
        "/api/v3/admin/system/logs",
      ];

      deepPaths.forEach((path, index) => {
        for (let i = 0; i < 5; i++) {
          transactions.push({
            id: `tx${String(index * 5 + i + 1).padStart(3, "0")}`,
            url: path,
            method: ["GET", "POST", "PUT"][Math.floor(Math.random() * 3)],
            status: Math.random() > 0.9 ? "Failed" : "Successful",
            statusCode: Math.random() > 0.9 ? 500 : 200,
            timestamp: new Date(Date.now() - (index * 5 + i) * 60000).toISOString(),
            responseTime: Math.floor(Math.random() * 300) + 50,
            client: "Deep Nesting Demo",
            apiName: path.includes("v1") ? "api-v1" : path.includes("v2") ? "api-v2" : "api-v3",
            userAgent: "TestClient/1.0",
            remoteAddress: `10.0.0.${index + 1}`,
          });
        }
      });

      return transactions.map(toDetailedTransaction);
    })(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates deep nesting capabilities with API versioning and complex path hierarchies. Shows how the explorer handles multiple levels of folders and maintains performance with nested structures.",
      },
    },
  },
};

export const WithFailedTransactions: Story = {
  args: {
    transactions: (() => {
      const transactions: Transaction[] = [];
      const errorScenarios = [
        { api: "auth-api", url: "/api/auth/login", code: 401, message: "Unauthorized" },
        { api: "auth-api", url: "/api/auth/verify", code: 403, message: "Forbidden" },
        { api: "payments-api", url: "/api/payments/process", code: 500, message: "Internal Server Error" },
        { api: "payments-api", url: "/api/payments/refund", code: 503, message: "Service Unavailable" },
        { api: "users-api", url: "/api/users/999", code: 404, message: "Not Found" },
        { api: "orders-api", url: "/api/orders/timeout", code: 504, message: "Gateway Timeout" },
      ];

      errorScenarios.forEach((scenario, index) => {
        // Add some successful transactions
        for (let i = 0; i < 3; i++) {
          transactions.push({
            id: `tx${String(index * 6 + i + 1).padStart(3, "0")}`,
            url: scenario.url,
            method: "GET",
            status: "Successful",
            statusCode: 200,
            timestamp: new Date(Date.now() - (index * 6 + i) * 30000).toISOString(),
            responseTime: Math.floor(Math.random() * 200) + 50,
            client: "Error Demo",
            apiName: scenario.api,
            userAgent: "TestClient/1.0",
            remoteAddress: `192.168.${index + 1}.${i + 1}`,
          });
        }

        // Add failed transactions
        for (let i = 0; i < 3; i++) {
          transactions.push({
            id: `tx${String(index * 6 + i + 4).padStart(3, "0")}`,
            url: scenario.url,
            method: ["POST", "PUT", "DELETE"][i % 3],
            status: "Failed",
            statusCode: scenario.code,
            timestamp: new Date(Date.now() - (index * 6 + i + 3) * 30000).toISOString(),
            responseTime: scenario.code === 504 ? 30000 : Math.floor(Math.random() * 500) + 100,
            client: "Error Demo",
            apiName: scenario.api,
            userAgent: "TestClient/1.0",
            remoteAddress: `192.168.${index + 1}.${i + 4}`,
          });
        }
      });

      return transactions.map(toDetailedTransaction);
    })(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows how the explorer displays APIs with high failure rates. Each API has a mix of successful and failed transactions, making it easy to identify problematic endpoints.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    transactions: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state when no transactions are available. Shows placeholder messages in both the tree view and transaction panel.",
      },
    },
  },
};
