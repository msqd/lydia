import { sampleTopology } from "@msqd/lydia/Elements/System/NetworkMap.samples";
import { sampleTransactions } from "@msqd/lydia/Models/Transactions/transactions.samples";
import { AlertsPage } from "@msqd/lydia/Pages/Alerts/AlertsPage";
import { sampleAlerts } from "@msqd/lydia/Pages/Alerts/AlertsPage.samples";
import { ExplorerPage } from "@msqd/lydia/Pages/Explorer/ExplorerPage";
import { OverviewPage } from "@msqd/lydia/Pages/Overview/OverviewPage";
import { sampleHistoryData } from "@msqd/lydia/Pages/Overview/Sections/HistorySection.samples";
import { sampleSummary } from "@msqd/lydia/Pages/Overview/Sections/SummarySection.samples";
import { SystemPage } from "@msqd/lydia/Pages/SystemPage";
import { TransactionsDetailPage, TransactionsListPage } from "@msqd/lydia/Pages/Transactions";
import {
  sampleDetailedTransaction,
  sampleDetailedTransactions,
} from "@msqd/lydia/Pages/Transactions/Detail/TransactionsDetailPage.samples";
import { useClientSideTransactions } from "@msqd/lydia/Pages/Transactions/List";
import { type ReactNode, useState } from "react";

// The Overview history section is controlled; this demo route owns the selected range.
const OverviewRoute = () => {
  const [timeRange, setTimeRange] = useState("7d");
  return (
    <OverviewPage
      summary={sampleSummary}
      history={{ timeRange, onTimeRangeChange: setTimeRange, ...sampleHistoryData(timeRange) }}
    />
  );
};

// TransactionsListPage is driven by its props; this demo route has no backend, so it filters,
// searches and paginates the sample list in memory.
const TransactionsRoute = () => <TransactionsListPage {...useClientSideTransactions(sampleTransactions)} />;

/**
 * Navigation item configuration
 */
export interface NavigationRoute {
  /** Unique identifier for the route */
  id: string;
  /** Display name in navigation */
  name: string;
  /** URL fragment/hash */
  href: string;
  /** React component to render */
  component: ReactNode;
  /** Whether this route should be included in navigation bar */
  showInNav?: boolean;
  /** Parent route ID for nested routes */
  parentId?: string;
}

/**
 * Application navigation state
 */
export interface NavigationState {
  /** Currently active route ID */
  currentRoute: string;
  /** Route parameters (e.g., transaction ID) */
  params?: Record<string, string>;
}

/**
 * Navigation configuration
 * This centralized config makes it easy to add new pages and maintain consistency
 */
export const navigationRoutes: NavigationRoute[] = [
  {
    id: "overview",
    name: "Overview",
    href: "#overview",
    component: <OverviewRoute />,
    showInNav: true,
  },
  {
    id: "transactions",
    name: "Journal",
    href: "#transactions",
    component: <TransactionsRoute />,
    showInNav: true,
  },
  {
    id: "transaction-detail",
    name: "Transaction Detail",
    href: "#transactions/detail",
    component: <TransactionsDetailPage transaction={sampleDetailedTransaction} />,
    showInNav: false,
    parentId: "transactions",
  },
  {
    id: "explorer",
    name: "Explorer",
    href: "#explorer",
    component: <ExplorerPage transactions={sampleDetailedTransactions} />,
    showInNav: true,
  },
  {
    id: "alerts",
    name: "Alerts",
    href: "#alerts",
    component: <AlertsPage alerts={sampleAlerts} />,
    showInNav: true,
  },
  {
    id: "system",
    name: "System",
    href: "#system",
    component: <SystemPage topology={sampleTopology} />,
    showInNav: true,
  },
];

/**
 * Get navigation items for the navbar
 */
export function getNavigationItems(currentState: NavigationState) {
  return navigationRoutes
    .filter((route) => route.showInNav)
    .map((route) => ({
      name: route.name,
      href: route.href,
      current: isRouteActive(route, currentState),
      onClick: () => {
        // This will be handled by the navigation hook
      },
    }));
}

/**
 * Check if a route is currently active
 */
export function isRouteActive(route: NavigationRoute, state: NavigationState): boolean {
  // Direct match
  if (route.id === state.currentRoute) {
    return true;
  }

  // Check if current route is a child of this route
  const currentRoute = navigationRoutes.find((r) => r.id === state.currentRoute);
  if (currentRoute?.parentId === route.id) {
    return true;
  }

  return false;
}

/**
 * Get the current route configuration
 */
export function getCurrentRoute(routeId: string): NavigationRoute | undefined {
  return navigationRoutes.find((route) => route.id === routeId);
}

/**
 * Get the default route
 */
export function getDefaultRoute(): NavigationRoute {
  return navigationRoutes[0]; // Overview by default
}

/**
 * Find route by href
 */
export function getRouteByHref(href: string): NavigationRoute | undefined {
  return navigationRoutes.find((route) => route.href === href);
}
