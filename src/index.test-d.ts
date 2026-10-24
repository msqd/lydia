import {
  AlertsPage,
  type AlertsPageProps,
  CacheBadge,
  type CacheBadgeProps,
  CacheIndicator,
  type CacheIndicatorProps,
  type CircuitBreakerState,
  CircuitBreakerStatus,
  type CircuitBreakerStatusProps,
  ExplorerPage,
  type ExplorerPageProps,
  type FilterChangeHandler,
  type Filters,
  NetworkMap,
  type NetworkMapProps,
  OverviewPage,
  type OverviewPageProps,
  RequestMethodBadge,
  type RequestMethodBadgeProps,
  ResponseStatusBadge,
  type ResponseStatusBadgeProps,
  SystemPage,
  type SystemPageProps,
  TpdexBadge,
  type TpdexBadgeProps,
  TransactionFiltersCard,
  type TransactionFiltersCardProps,
  TransactionsDetailPage,
  type TransactionsDetailPageProps,
  TransactionsExplorerSidebar,
  type TransactionsExplorerSidebarProps,
  TransactionsFiltersSidebar,
  type TransactionsFiltersSidebarProps,
  TransactionsListPage,
  type TransactionsListPageProps,
  calculateTpdexScore,
  canonicalStatusToken,
  countActiveFilters,
  filterTransactions,
  findHeader,
  getTpdexRating,
  hasActiveFilters,
  parseStatusSelection,
  readArray,
  splitRequestTarget,
} from "./index";

/**
 * What the root entry promises: every Page and Element comes with its Props, and the Models are
 * reachable from the same import. Checked by the compiler (`pnpm types`).
 */
type Component<P> = (props: P) => unknown;

AlertsPage satisfies Component<AlertsPageProps>;
CacheBadge satisfies Component<CacheBadgeProps>;
CacheIndicator satisfies Component<CacheIndicatorProps>;
CircuitBreakerStatus satisfies Component<CircuitBreakerStatusProps>;
ExplorerPage satisfies Component<ExplorerPageProps>;
NetworkMap satisfies Component<NetworkMapProps>;
OverviewPage satisfies Component<OverviewPageProps>;
RequestMethodBadge satisfies Component<RequestMethodBadgeProps>;
ResponseStatusBadge satisfies Component<ResponseStatusBadgeProps>;
SystemPage satisfies Component<SystemPageProps>;
TpdexBadge satisfies Component<TpdexBadgeProps>;
TransactionFiltersCard satisfies Component<TransactionFiltersCardProps>;
TransactionsDetailPage satisfies Component<TransactionsDetailPageProps>;
TransactionsExplorerSidebar satisfies Component<TransactionsExplorerSidebarProps>;
TransactionsFiltersSidebar satisfies Component<TransactionsFiltersSidebarProps>;
TransactionsListPage satisfies Component<TransactionsListPageProps>;

splitRequestTarget("/a?b=1") satisfies { path: string; query: string };
canonicalStatusToken("2xx") satisfies string;
getTpdexRating(calculateTpdexScore(120)).label satisfies string;
parseStatusSelection(["2xx"]) satisfies ReturnType<typeof parseStatusSelection>;
findHeader([], "accept") satisfies string | undefined;
countActiveFilters(undefined) satisfies number;
hasActiveFilters(undefined, "") satisfies boolean;
readArray(undefined, "status") satisfies string[];
filterTransactions([], {}) satisfies readonly unknown[];

declare const filters: Filters;
declare const change: FilterChangeHandler;
declare const state: CircuitBreakerState;
change("status", filters["status"]);
state satisfies "open" | "closed" | "half-open";
