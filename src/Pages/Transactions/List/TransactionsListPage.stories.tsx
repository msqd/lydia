import { Drawer } from "@msqd/lydia/Components/Dialog";
import { DefaultLayout } from "@msqd/lydia/Components/Layouts/DefaultLayout";
import { ApilabLogotype, DefaultLogo } from "@msqd/lydia/Components/NavBar/NavBar";
import { ToastProvider } from "@msqd/lydia/Components/Toast";
import { deriveTransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import { filterTransactions } from "@msqd/lydia/Models/Transactions/filtering";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { TransactionsDetailPage } from "@msqd/lydia/Pages/Transactions/Detail";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { TransactionsListPage, type TransactionsListPageProps } from "./TransactionsListPage";
import { useClientSideTransactions } from "./useClientSideTransactions";

// Layout wrapper for consistent page presentation
const LayoutWrapper = (Story: React.ComponentType) => (
  <ToastProvider>
    <DefaultLayout
      navBarProps={{
        logo: <DefaultLogo />,
        brand: <ApilabLogotype />,
        navigation: [
          { name: "Overview", href: "#", current: false },
          { name: "Journal", href: "#", current: true },
          { name: "Explorer", href: "#", current: false },
          { name: "Editor", href: "#", current: false },
          { name: "Alerts", href: "#", current: false },
          { name: "System", href: "#", current: false },
        ],
      }}
    >
      <Story />
    </DefaultLayout>
  </ToastProvider>
);

/**
 * The page renders the transactions it is handed and reports intent upward. It never filters,
 * searches or paginates, so every story that wants working controls has to drive it. These ones
 * drive it with the client-side fallback, because Storybook has no backend.
 */
const Driven = ({ transactions, ...props }: TransactionsListPageProps) => (
  <TransactionsListPage {...props} {...useClientSideTransactions(transactions)} />
);

const meta = {
  title: "Pages/Transactions/List",
  component: TransactionsListPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "TransactionsListPage lists API transactions with facets, search and pagination.",
          "",
          "**It does none of those three itself.** It renders the transactions it is given and reports every",
          "change through a callback, so a consumer filters where the whole dataset is, which for a server-backed",
          "consumer means server-side. Most stories here drive it with `useClientSideTransactions`, the in-memory",
          "fallback for consumers that have no backend, such as this Storybook.",
          "",
          "The same holds for the facet vocabulary: the values each facet offers come from the `facets` prop, so a",
          "facet given nothing offers nothing rather than inventing endpoints nobody called.",
        ].join("\n"),
      },
    },
  },
  decorators: [LayoutWrapper],
  render: (args) => <Driven {...args} />,
} satisfies Meta<typeof TransactionsListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate more transaction data for better pagination demonstration
const generateExtendedTransactions = (count: number): Transaction[] => {
  const baseTransactions = [
    {
      url: "/api/users/profile",
      method: "GET",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 12,
      client: "Mobile App",
      apiName: "users-api",
      userAgent: "MyApp/2.5.0 (iOS)",
      cacheStatus: "hit" as const,
    },
    {
      url: "/api/orders",
      method: "POST",
      status: "Successful" as const,
      statusCode: 201,
      responseTime: 156,
      client: "Website",
      apiName: "orders-api",
      userAgent: "Mozilla/5.0 (Chrome/120.0)",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/products/search",
      method: "GET",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 18,
      client: "Mobile App",
      apiName: "catalog-api",
      userAgent: "ShopApp/3.1.2 (Android)",
      cacheStatus: "hit" as const,
    },
    {
      url: "/api/auth/login",
      method: "POST",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 145,
      client: "Website",
      apiName: "auth-api",
      userAgent: "Mozilla/5.0 (Safari/17.0)",
      cacheStatus: "bypass" as const,
    },
    {
      url: "/api/payments/process",
      method: "POST",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 412,
      client: "Mobile App",
      apiName: "payments-api",
      userAgent: "PayApp/1.8.5",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/inventory/check",
      method: "GET",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 25,
      client: "Admin Dashboard",
      apiName: "inventory-api",
      userAgent: "AdminPanel/2.3.1",
      cached: true, // Legacy cached flag
    },
    {
      url: "/api/notifications/send",
      method: "POST",
      status: "Successful" as const,
      statusCode: 202,
      responseTime: 89,
      client: "Backend Service",
      apiName: "notifications-api",
      userAgent: "NotificationService/1.0",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/analytics/track",
      method: "POST",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 34,
      client: "Website",
      apiName: "analytics-api",
      userAgent: "AnalyticsSDK/2.1",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/users/404",
      method: "GET",
      status: "Failed" as const,
      statusCode: 404,
      responseTime: 23,
      client: "Mobile App",
      apiName: "users-api",
      userAgent: "TestApp/1.0",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/auth/expired",
      method: "POST",
      status: "Failed" as const,
      statusCode: 401,
      responseTime: 45,
      client: "Website",
      apiName: "auth-api",
      userAgent: "ExpiredSession/1.0",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/reports/heavy",
      method: "GET",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 2340,
      client: "Admin Dashboard",
      apiName: "reports-api",
      userAgent: "ReportViewer/1.5",
      cacheStatus: "miss" as const,
    },
    {
      url: "/api/cache/warm",
      method: "POST",
      status: "Successful" as const,
      statusCode: 200,
      responseTime: 280,
      client: "Backend Service",
      apiName: "cache-api",
      userAgent: "CacheWarmer/2.0",
      cacheStatus: "stale" as const,
    },
  ];

  const transactions: Transaction[] = [];
  const baseTime = new Date("2025-05-20T10:30:00");

  for (let i = 0; i < count; i++) {
    const baseIndex = i % baseTransactions.length;
    const base = baseTransactions[baseIndex];

    // Add some variation to response times
    const responseTimeVariation = Math.random() * 20 - 10; // ±10ms variation for more realistic cache hits
    const adjustedResponseTime = Math.max(10, base.responseTime + responseTimeVariation);

    // Create timestamp going backwards in time
    const timestamp = new Date(baseTime.getTime() - i * 2 * 60 * 1000); // 2 minutes apart

    transactions.push({
      id: `tx${String(i + 1).padStart(3, "0")}`,
      url: base.url,
      method: base.method,
      status: base.status,
      statusCode: base.statusCode,
      timestamp: timestamp.toISOString(),
      responseTime: Math.round(adjustedResponseTime),
      client: base.client,
      apiName: base.apiName,
      userAgent: base.userAgent,
      remoteAddress: `192.168.${Math.floor(i / 250) + 1}.${(i % 250) + 1}`,
      ...(base.cacheStatus && { cacheStatus: base.cacheStatus }),
      ...(base.cached && { cached: base.cached }),
    });
  }

  return transactions;
};

export const TransactionsList: Story = {
  args: {
    transactions: generateExtendedTransactions(85), // More than 4 pages with default pagination
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default view of the transactions list with extended data (85 transactions) showing transaction history with filtering and pagination capabilities. Navigate through multiple pages to see the full dataset.",
      },
    },
  },
};

export const WithCustomBackground: Story = {
  args: {
    className: "bg-gray-50 p-6",
    transactions: generateExtendedTransactions(120), // Even more data for this story
  },
  parameters: {
    docs: {
      description: {
        story:
          "Transactions list with a custom background color and padding, demonstrating style customization through props. Contains 120 transactions (6 pages) to showcase pagination.",
      },
    },
  },
};

// Interactive story with drawer functionality
const TransactionsListWithDrawer = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const handleTransactionSelect = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDrawer = () => {
    setSelectedTransaction(null);
  };

  return (
    <>
      <TransactionsListPage
        onTransactionSelect={handleTransactionSelect}
        isDrawerOpen={!!selectedTransaction}
        transactions={generateExtendedTransactions(95)} // Rich data for interactive demo
      />

      <Drawer
        isOpen={!!selectedTransaction}
        onClose={handleCloseDrawer}
        title="Transaction Details"
        description="Detailed view of the selected HTTP transaction"
        size="md"
        position="right"
        backdrop={false}
      >
        <TransactionsDetailPage transaction={selectedTransaction} isDrawer={true} />
      </Drawer>
    </>
  );
};

export const WithDrawerDetail: Story = {
  args: { transactions: [] },
  render: () => <TransactionsListWithDrawer />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive transactions list that opens a medium-sized drawer on the right when a transaction is selected. Click on any transaction row to see the detailed view in the drawer.",
      },
    },
  },
};

// Generate extended outliers data with cycling pattern
const generateExtendedOutliers = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const baseTime = new Date("2025-05-20T10:30:00");

  for (let i = 0; i < count; i++) {
    const cycle = i % 6; // 6 different patterns
    const timestamp = new Date(baseTime.getTime() - i * 90 * 1000); // 90 seconds apart

    let transaction: Transaction;

    switch (cycle) {
      case 0:
        transaction = {
          id: `tx-ultra-fast-${i + 1}`,
          url: "/api/health",
          method: "GET",
          status: "Successful",
          statusCode: 200,
          timestamp: timestamp.toISOString(),
          responseTime: Math.floor(Math.random() * 8) + 2, // 2-10ms
          client: "Health Check",
          apiName: "health-api",
          userAgent: "HealthBot/1.0",
          remoteAddress: `127.0.0.${(i % 254) + 1}`,
          cacheStatus: "hit", // Ultra fast responses are cache hits
        };
        break;
      case 1:
        transaction = {
          id: `tx-normal-${i + 1}`,
          url: "/api/users/profile",
          method: "GET",
          status: "Successful",
          statusCode: 200,
          timestamp: timestamp.toISOString(),
          responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
          client: "Mobile App",
          apiName: "users-api",
          userAgent: "MyApp/2.5.0",
          remoteAddress: `192.168.1.${(i % 254) + 1}`,
          // Mix of cache statuses for normal requests
          cacheStatus: Math.random() < 0.3 ? "hit" : Math.random() < 0.7 ? "miss" : "stale",
        };
        break;
      case 2:
        transaction = {
          id: `tx-slow-${i + 1}`,
          url: "/api/reports/analytics",
          method: "POST",
          status: "Successful",
          statusCode: 200,
          timestamp: timestamp.toISOString(),
          responseTime: Math.floor(Math.random() * 5000) + 3000, // 3-8 seconds
          client: "Analytics Dashboard",
          apiName: "analytics-api",
          userAgent: "AnalyticsApp/1.0",
          remoteAddress: `172.16.0.${(i % 254) + 1}`,
        };
        break;
      case 3:
        transaction = {
          id: `tx-ultra-slow-${i + 1}`,
          url: "/api/batch/export",
          method: "GET",
          status: "Successful",
          statusCode: 200,
          timestamp: timestamp.toISOString(),
          responseTime: Math.floor(Math.random() * 10000) + 10000, // 10-20 seconds
          client: "Export Service",
          apiName: "export-api",
          userAgent: "ExportBot/3.0",
          remoteAddress: `172.16.10.${(i % 254) + 1}`,
        };
        break;
      case 4:
        transaction = {
          id: `tx-timeout-${i + 1}`,
          url: "/api/external/third-party",
          method: "POST",
          status: "Failed",
          statusCode: 504,
          timestamp: timestamp.toISOString(),
          responseTime: Math.floor(Math.random() * 15000) + 25000, // 25-40 seconds
          client: "Integration Service",
          apiName: "external-api",
          userAgent: "IntegrationBot/1.5",
          remoteAddress: `203.0.113.${(i % 254) + 1}`,
        };
        break;
      case 5:
        const isSearchCached = Math.random() < 0.4;
        transaction = {
          id: `tx-mixed-${i + 1}`,
          url: "/api/search/query",
          method: "POST",
          status: "Successful",
          statusCode: 200,
          timestamp: timestamp.toISOString(),
          responseTime: isSearchCached ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 2000) + 200, // 20-70ms if cached, 200ms-2.2s otherwise
          client: "Search Engine",
          apiName: "search-api",
          userAgent: "SearchApp/2.1",
          remoteAddress: `10.0.1.${(i % 254) + 1}`,
          // Sometimes use legacy cached flag
          ...(isSearchCached && (Math.random() < 0.5 ? { cacheStatus: "hit" as const } : { cached: true })),
        };
        break;
      default:
        throw new Error(`Unexpected cycle ${cycle}`);
    }

    transactions.push(transaction);
  }

  return transactions;
};

// Generate extended bad performance data
const generateExtendedBadPerformance = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const baseTime = new Date("2025-05-20T10:30:00");

  const badEndpoints = [
    {
      url: "/api/search/complex-query",
      method: "POST",
      client: "Search Engine",
      api: "search-api",
      minTime: 3000,
      maxTime: 6000,
    },
    {
      url: "/api/database/heavy-query",
      method: "GET",
      client: "Admin Dashboard",
      api: "database-api",
      minTime: 4000,
      maxTime: 8000,
    },
    {
      url: "/api/ml/model-inference",
      method: "POST",
      client: "ML Service",
      api: "ml-api",
      minTime: 5000,
      maxTime: 10000,
    },
    {
      url: "/api/image/bulk-processing",
      method: "POST",
      client: "Image Service",
      api: "image-api",
      minTime: 7000,
      maxTime: 15000,
    },
    {
      url: "/api/cache/rebuild",
      method: "POST",
      client: "Cache Service",
      api: "cache-api",
      minTime: 10000,
      maxTime: 20000,
    },
    {
      url: "/api/backup/full-system",
      method: "POST",
      client: "Backup Service",
      api: "backup-api",
      minTime: 15000,
      maxTime: 30000,
    },
  ];

  for (let i = 0; i < count; i++) {
    const endpointIndex = i % badEndpoints.length;
    const endpoint = badEndpoints[endpointIndex];
    const timestamp = new Date(baseTime.getTime() - i * 120 * 1000); // 2 minutes apart

    const responseTime = Math.floor(Math.random() * (endpoint.maxTime - endpoint.minTime)) + endpoint.minTime;
    const isFailed = responseTime > 20000 && Math.random() < 0.3; // 30% chance of failure for very slow requests

    transactions.push({
      id: `tx-bad-${i + 1}`,
      url: endpoint.url,
      method: endpoint.method,
      status: isFailed ? "Failed" : "Successful",
      statusCode: isFailed ? (Math.random() < 0.5 ? 500 : 504) : 200,
      timestamp: timestamp.toISOString(),
      responseTime: responseTime,
      client: endpoint.client,
      apiName: endpoint.api,
      userAgent: `${endpoint.client.replace(/\s+/g, "")}/${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      remoteAddress: `172.16.${Math.floor(i / 254) + 1}.${(i % 254) + 1}`,
    });
  }

  return transactions;
};

export const WithPerformanceOutliers: Story = {
  args: {
    transactions: generateExtendedOutliers(72), // 3+ pages of outlier data
  },
  parameters: {
    docs: {
      description: {
        story:
          "Transactions list showcasing performance outliers with extremely fast responses (2-10ms), normal responses (50-150ms), slow responses (3-8s), and extremely slow responses (10-40s). Contains 72 transactions across multiple pages to demonstrate how TPDEX badges clearly differentiate performance levels throughout a large dataset.",
      },
    },
  },
};

export const WithBadPerformance: Story = {
  args: {
    transactions: generateExtendedBadPerformance(60), // 3 pages of bad performance data
  },
  parameters: {
    docs: {
      description: {
        story:
          "Transactions list focusing on bad performance scenarios with consistently slow response times (3-30 seconds). Contains 60 transactions showing various problematic endpoints with some failures. This demonstrates how the TPDEX system helps identify services that need optimization across multiple pages of data.",
      },
    },
  },
};

export const WithHighVolumeData: Story = {
  args: {
    transactions: generateExtendedTransactions(250), // 12+ pages of data
    itemsPerPage: 20,
  },
  parameters: {
    docs: {
      description: {
        story:
          "High-volume transactions list with 250 transactions (12+ pages) demonstrating the interface behavior with a large dataset. Perfect for testing pagination, performance, and overall user experience with substantial data loads. Shows how the interface handles realistic enterprise-scale transaction volumes.",
      },
    },
  },
};

// Custom transaction data specifically for showcasing cache features
const cachedTransactions: Transaction[] = [
  {
    id: "tx-cache-1",
    url: "/api/static/assets/logo.png",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:30:00",
    responseTime: 8,
    client: "Website",
    apiName: "cdn-api",
    userAgent: "Mozilla/5.0",
    remoteAddress: "192.168.1.100",
    cacheStatus: "hit",
  },
  {
    id: "tx-cache-2",
    url: "/api/products/catalog",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:29:30",
    responseTime: 12,
    client: "Mobile App",
    apiName: "catalog-api",
    userAgent: "ShopApp/3.1.2",
    remoteAddress: "192.168.1.101",
    cacheStatus: "hit",
  },
  {
    id: "tx-cache-3",
    url: "/api/config/settings",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:29:00",
    responseTime: 15,
    client: "Admin Dashboard",
    apiName: "config-api",
    userAgent: "AdminPanel/2.3.1",
    remoteAddress: "172.16.0.25",
    cached: true, // Legacy cache flag
  },
  {
    id: "tx-cache-4",
    url: "/api/users/profile",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:28:30",
    responseTime: 145,
    client: "Mobile App",
    apiName: "users-api",
    userAgent: "MyApp/2.5.0",
    remoteAddress: "192.168.1.102",
    cacheStatus: "miss",
  },
  {
    id: "tx-cache-5",
    url: "/api/news/feed",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:28:00",
    responseTime: 280,
    client: "Website",
    apiName: "content-api",
    userAgent: "Mozilla/5.0",
    remoteAddress: "192.168.1.103",
    cacheStatus: "stale",
  },
  {
    id: "tx-cache-6",
    url: "/api/auth/login",
    method: "POST",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:27:30",
    responseTime: 120,
    client: "Website",
    apiName: "auth-api",
    userAgent: "Mozilla/5.0",
    remoteAddress: "192.168.1.104",
    cacheStatus: "bypass",
  },
  {
    id: "tx-cache-7",
    url: "/api/translations/en-US",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:27:00",
    responseTime: 5,
    client: "Mobile App",
    apiName: "i18n-api",
    userAgent: "MyApp/2.5.0",
    remoteAddress: "192.168.1.105",
    cacheStatus: "hit",
  },
  {
    id: "tx-cache-8",
    url: "/api/reports/generate",
    method: "POST",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:26:30",
    responseTime: 2340,
    client: "Admin Dashboard",
    apiName: "reports-api",
    userAgent: "AdminPanel/2.3.1",
    remoteAddress: "172.16.0.26",
    cacheStatus: "miss",
  },
  {
    id: "tx-cache-9",
    url: "/api/inventory/stock",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:26:00",
    responseTime: 450,
    client: "Backend Service",
    apiName: "inventory-api",
    userAgent: "InventoryBot/1.0",
    remoteAddress: "172.16.10.5",
    cacheStatus: "stale",
  },
  {
    id: "tx-cache-10",
    url: "/api/payments/process",
    method: "POST",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:25:30",
    responseTime: 310,
    client: "Mobile App",
    apiName: "payments-api",
    userAgent: "PayApp/1.8.5",
    remoteAddress: "192.168.1.106",
    cacheStatus: "bypass",
  },
];

export const WithCacheStatus: Story = {
  args: {
    transactions: cachedTransactions,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Transactions list specifically showcasing cache status indicators. Shows all cache states: HIT (green, fast responses), MISS (gray, normal responses), STALE (yellow, served from stale cache), and BYPASS (blue, cache was bypassed). Also includes legacy cached=true support. Notice how cache hits typically have excellent performance (< 20ms).",
      },
    },
  },
};

export const Filtered: Story = {
  args: {
    transactions: generateExtendedTransactions(85),
  },
  render: (args) => <Driven {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByText("filters"));
    await userEvent.click((await canvas.findAllByRole("checkbox"))[0]);
  },
  parameters: {
    docs: {
      description: {
        story:
          "A facet selected. The page reports the selection and re-renders whatever it is handed back; here the client-side fallback is what narrows the list.",
      },
    },
  },
};

export const EmptyBecauseFiltered: Story = {
  args: {
    transactions: [],
    filters: { method: ["TRACE"] },
    search: "",
    onFiltersChange: () => undefined,
    onResetFilters: () => undefined,
    onSearchChange: () => undefined,
    onPageChange: () => undefined,
  },
  render: (args) => <TransactionsListPage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "No results **for these filters**. Distinct from having no data: the page says the filters matched nothing and offers a way out of the dead end.",
      },
    },
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
    filters: {},
    search: "",
    onFiltersChange: () => undefined,
    onResetFilters: () => undefined,
    onSearchChange: () => undefined,
    onPageChange: () => undefined,
  },
  render: (args) => <TransactionsListPage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Nothing to show and nothing narrowing it. An untouched facet arrives as an empty array, which is not a filter, so this stays the no-data message rather than blaming the filters.",
      },
    },
  },
};

export const Loading: Story = {
  args: {
    transactions: [],
    isLoading: true,
    filters: { method: ["GET"] },
    search: "",
    onFiltersChange: () => undefined,
    onResetFilters: () => undefined,
    onSearchChange: () => undefined,
    onPageChange: () => undefined,
  },
  render: (args) => <TransactionsListPage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Fetching. Once filtering is asynchronous, an empty list means nothing until the fetch resolves, so this state exists to stop the page claiming a result it does not have. The filters stay set and the pagination frame stays in place, so the layout does not jump when rows arrive.",
      },
    },
  },
};

// The case a real consumer has: view state lives in the URL, the page is told what to show, and a
// reload restores the view. Storybook has no router, so this reads and writes the iframe's hash.
const UrlDrivenList = ({ transactions }: { transactions: Transaction[] }) => {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.hash.slice(1)));

  useEffect(() => {
    const follow = () => setQuery(new URLSearchParams(window.location.hash.slice(1)));
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, []);

  const navigate = (next: URLSearchParams) => {
    window.location.hash = next.toString();
    setQuery(next);
  };

  const methods = query.getAll("method");
  const search = query.get("q") ?? "";
  const page = Number(query.get("page") ?? 1);

  const matching = filterTransactions(transactions, {
    filters: { method: methods },
    search,
  });
  const itemsPerPage = 20;

  return (
    <div className="space-y-2">
      <p className="px-4 pt-4 font-mono text-xs text-gray-500">
        #{query.toString() || "(no state yet, pick a method or search)"}
      </p>
      <TransactionsListPage
        transactions={matching.slice((page - 1) * itemsPerPage, page * itemsPerPage)}
        total={matching.length}
        itemsPerPage={itemsPerPage}
        page={page}
        filters={{ method: methods }}
        facets={deriveTransactionFacets(transactions)}
        search={search}
        onFiltersChange={(name, value) => {
          const next = new URLSearchParams(query);
          next.delete(name);
          for (const entry of (value as string[]) ?? []) {
            next.append(name, entry);
          }
          next.delete("page");
          navigate(next);
        }}
        onResetFilters={() => navigate(new URLSearchParams())}
        onSearchChange={(term) => {
          const next = new URLSearchParams(query);
          if (term) {
            next.set("q", term);
          } else {
            next.delete("q");
          }
          next.delete("page");
          navigate(next);
        }}
        onPageChange={(next) => {
          const params = new URLSearchParams(query);
          params.set("page", String(next));
          navigate(params);
        }}
      />
    </div>
  );
};

export const DrivenFromTheUrl: Story = {
  args: {
    transactions: generateExtendedTransactions(85),
  },
  render: (args) => <UrlDrivenList transactions={args.transactions} />,
  parameters: {
    docs: {
      description: {
        story:
          "The whole controlled loop, and the shape a real consumer has. Every facet, term and page lands in the URL; the page is told what to show and shows exactly that. Reload the iframe and the view comes back, which is the point of not holding this state inside the page.",
      },
    },
  },
};

export const FacetsFromAConsumer: Story = {
  args: {
    transactions: generateExtendedTransactions(20),
    filters: {},
    search: "",
    total: 4820,
    itemsPerPage: 20,
    page: 1,
    facets: {
      endpoint: [
        { name: "/v1/checkout", label: "/v1/checkout", count: 3120 },
        { name: "/v1/cart", label: "/v1/cart", count: 1700 },
      ],
      method: [
        { name: "POST", label: "POST", count: 4700 },
        { name: "PROPFIND", label: "PROPFIND", count: 120 },
      ],
      status: [{ name: "2", label: "2xx", count: 4820, under: [{ name: "200", label: "200", count: 4820 }] }],
      flags: [{ name: "favorite", label: "Favorite", count: 31 }],
    },
    onFiltersChange: () => undefined,
    onResetFilters: () => undefined,
    onSearchChange: () => undefined,
    onPageChange: () => undefined,
  },
  render: (args) => <TransactionsListPage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "The server-backed case: options and counts come from the consumer and describe its whole dataset, not the 20 rows on screen. `PROPFIND` and the `Flags` values are both things no built-in list could have contained, and the counts are larger than anything the page can see.",
      },
    },
  },
};

export const FacetsWithNothingToOffer: Story = {
  args: {
    transactions: generateExtendedTransactions(20),
    filters: {},
    search: "",
    facets: {},
    onFiltersChange: () => undefined,
    onResetFilters: () => undefined,
    onSearchChange: () => undefined,
    onPageChange: () => undefined,
  },
  render: (args) => <TransactionsListPage {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "A consumer that supplied no options. Each facet says so, rather than offering `/api/users` and claiming 245 of them the way this sidebar used to whatever it was passed.",
      },
    },
  },
};

const ControlledSidebar = ({ transactions }: { transactions: Transaction[] }) => {
  const [filtersOpen, setFiltersOpen] = useState(true);
  return (
    <>
      <p className="px-4 pt-2 text-sm" data-testid="consumer-state">
        Consumer state: filtersOpen = {String(filtersOpen)}
      </p>
      <Driven transactions={transactions} filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen} />
    </>
  );
};

export const ControlledFilters: Story = {
  args: { transactions: generateExtendedTransactions(25) },
  render: (args) => <ControlledSidebar transactions={args.transactions} />,
  parameters: {
    docs: {
      description: {
        story:
          "The consumer owns the sidebar state through `filtersOpen` and `onFiltersOpenChange`, and persists it if it wants to. Left out, the page keeps its own state, closed at first.",
      },
    },
  },
};

export const TwoInstances: Story = {
  args: { transactions: generateExtendedTransactions(25) },
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      <Driven transactions={args.transactions} aria-label="Errors" />
      <Driven transactions={args.transactions} aria-label="Slow requests" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Each page keeps its own sidebar state: collapsing one leaves the other. Each is named with `aria-label`, which also names its pagination landmarks apart.",
      },
    },
  },
};
