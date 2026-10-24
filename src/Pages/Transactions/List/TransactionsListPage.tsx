import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/16/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import { DataTable, Paginator, type TypedColumn } from "@msqd/lydia/Components/DataTable";
import { SearchInput } from "@msqd/lydia/Components/Inputs/SearchInput";
import { P } from "@msqd/lydia/Components/Typography/Paragraphs";
import { Section } from "@msqd/lydia/Components/Typography/Section";
import { H2 } from "@msqd/lydia/Components/Typography/Titles";
import { useGlobalClickOutside } from "@msqd/lydia/Components/Utilities/useGlobalClickOutside";
import { CacheIndicator, RequestMethodBadge, ResponseStatusBadge } from "@msqd/lydia/Elements/Http";
import { TpdexBadge } from "@msqd/lydia/Elements/Tpdex/TpdexBadge";
import { TransactionsFiltersSidebar } from "@msqd/lydia/Elements/Transactions";
import { formatDistanceToNow } from "date-fns";
import { type ComponentProps, useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";

import { type FilterChangeHandler, type Filters, hasActiveFilters } from "@msqd/lydia/Models/Filters";
import { splitRequestTarget } from "@msqd/lydia/Models/Http/requestTarget";
import type { TransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";

interface TransactionsListPageBaseProps extends ComponentProps<"div"> {
  className?: string;
  onRowClick?: (id: string) => void;
  onTransactionSelect?: (transaction: Transaction | null) => void;
  isDrawerOpen?: boolean;
  /**
   * The transactions to render, exactly as given. This page does not filter, search or paginate
   * them: the consumer does, wherever the whole dataset lives.
   */
  transactions: Transaction[];
  /**
   * Layout variant. "embedded" hides the title, the search and the filters (for use inside
   * another component).
   */
  variant?: "page" | "embedded";

  /** Current facet selections. Displayed and reported, never applied here. */
  filters?: Filters;
  /** Called when a facet changes. The filters sidebar renders only when this is provided. */
  onFiltersChange?: FilterChangeHandler;
  /**
   * Values each facet can offer, with their counts. Only the consumer knows what exists in the
   * whole result set, so a facet with no entry offers nothing rather than something invented.
   */
  facets?: TransactionFacets;
  /**
   * Called when the user asks to start over. Expected to clear the facets **and** the search
   * term, since the control that triggers it is labelled as resetting everything.
   */
  onResetFilters?: () => void;

  /** Current search term. */
  search?: string;
  /** Called when the search term changes. The search field renders only when this is provided. */
  onSearchChange?: (search: string) => void;

  /** Current page, 1-based. */
  page?: number;
  /** Total matching transactions. Only the consumer knows this; a page of results cannot infer it. */
  total?: number;
  /** Number of pages. Derived from `total` and `itemsPerPage` when omitted. */
  pageCount?: number;
  /** Page size, used for the pagination summary. This page never slices the list itself. */
  itemsPerPage?: number;
  /** Called when the user asks for another page. */
  onPageChange?: (page: number) => void;

  /** True while the consumer is fetching, so an empty list reads as "not yet" rather than "none". */
  isLoading?: boolean;
}

/**
 * Sidebar state. `filtersOpen` and `onFiltersOpenChange` go together to control the sidebar, and
 * you persist it yourself if you want it remembered: `filtersOpen` alone would leave the toggle
 * dead, so it does not compile. Leave `filtersOpen` out and the page keeps its own state, closed at
 * first, forgotten on unmount; `onFiltersOpenChange` alone then just reports the changes.
 */
type FiltersOpenProps =
  | { filtersOpen: boolean; onFiltersOpenChange: (open: boolean) => void }
  | { filtersOpen?: undefined; onFiltersOpenChange?: (open: boolean) => void };

export type TransactionsListPageProps = TransactionsListPageBaseProps & FiltersOpenProps;

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const formatDuration = (milliseconds: number) => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else {
    const seconds = (milliseconds / 1000).toFixed(1);
    return `${seconds}s`;
  }
};

// Star/favorite component
/**
 * A toggle button, named by the transaction it marks. It was an `svg` with a
 * click handler, which a keyboard could not reach and a screen reader did not
 * announce. Its keys stop at the button, since the row's own Enter and Space
 * choose the row.
 */
const FavoriteAction = ({ transaction }: { transaction: Transaction }) => {
  const [isFavorite, setIsFavorite] = useState(false); // TODO: connect to actual favorite state

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`Favourite ${transaction.method} ${transaction.url}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsFavorite(!isFavorite);
      }}
      onKeyDown={(event) => event.stopPropagation()}
      className="rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-600"
    >
      {/* gray-500 rather than gray-300: the outline is the control's only
          visible edge, and gray-300 is 1.47:1 on white, gray-500 4.84:1 (WCAG 1.4.11). */}
      <StarIcon
        className={isFavorite ? "h-5 w-5 fill-current text-yellow-500" : "h-5 w-5 text-gray-500 hover:text-yellow-500"}
        aria-hidden="true"
      />
    </button>
  );
};

// Request summary component (inspired by MessageSummary)
const RequestSummary = ({ transaction }: { transaction: Transaction }) => {
  const { path, query: queryString } = splitRequestTarget(transaction.url);

  return (
    <span className="font-normal">
      <RequestMethodBadge method={transaction.method} />
      {transaction.apiName && (
        <span className="inline-flex items-center bg-gray-50 px-1 ml-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
          {transaction.apiName}
        </span>
      )}
      <span className="text-gray-500 font-mono text-xs ml-1" title={transaction.url}>
        {path}
      </span>
      {queryString && (
        <span className="text-gray-500 font-mono text-xs" title={transaction.url}>
          {queryString}
        </span>
      )}
    </span>
  );
};

// Duration component with TPDEX
const DurationDisplay = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="flex gap-x-1 items-center font-normal">
      <TpdexBadge score={transaction.tpdex} responseTime={transaction.responseTime} />
      <span className="text-sm">{formatDuration(transaction.responseTime)}</span>
      <CacheIndicator cacheStatus={transaction.cacheStatus} cached={transaction.cached} size="sm" />
    </div>
  );
};

// DataTable configuration
const columns = ["flags", "request", "response", "duration", "date"];
const types = {
  flags: {
    label: "Favourite",
    labelHidden: true,
    get: (transaction: Transaction) => transaction,
    format: (transaction: Transaction) => <FavoriteAction transaction={transaction} />,
    headerClassName: "w-1",
    className: "w-8",
  } satisfies TypedColumn<Transaction, Transaction>,
  request: {
    label: "Request",
    get: (transaction: Transaction) => transaction,
    format: (transaction: Transaction) => <RequestSummary transaction={transaction} />,
    className: "truncate max-w-0 w-full",
  } satisfies TypedColumn<Transaction, Transaction>,
  response: {
    label: "Response",
    get: (transaction: Transaction) => transaction,
    format: (transaction: Transaction) => (
      <span className="font-normal">
        <ResponseStatusBadge statusCode={transaction.statusCode} />
      </span>
    ),
  } satisfies TypedColumn<Transaction, Transaction>,
  duration: {
    label: "Duration",
    get: (transaction: Transaction) => transaction,
    format: (transaction: Transaction) => <DurationDisplay transaction={transaction} />,
  } satisfies TypedColumn<Transaction, Transaction>,
  date: {
    label: "Date",
    get: (transaction: Transaction) => transaction,
    format: (transaction: Transaction) => (
      <div title={new Date(transaction.timestamp).toLocaleString()}>{formatDate(transaction.timestamp)}</div>
    ),
  } satisfies TypedColumn<Transaction, Transaction>,
};

/**
 * Landmark names must be unique in a document, and two pages can share one: the page's own name
 * leads. A named page reads "Errors, pagination above the list"; an unnamed one keeps "Pagination,
 * above the list". With `aria-labelledby` only, the Paginator prefixes the referenced text itself.
 */
const paginatorLabel = (where: string, ariaLabel?: string, ariaLabelledby?: string) => {
  if (ariaLabel) return `${ariaLabel}, pagination ${where} the list`;
  if (ariaLabelledby) return `pagination ${where} the list`;
  return `Pagination, ${where} the list`;
};

export function TransactionsListPage({
  className,
  onRowClick,
  onTransactionSelect,
  isDrawerOpen = false,
  filtersOpen: filtersOpenProp,
  onFiltersOpenChange,
  itemsPerPage = 20,
  transactions,
  variant = "page",
  filters,
  onFiltersChange,
  onResetFilters,
  facets,
  search = "",
  onSearchChange,
  page = 1,
  total,
  pageCount,
  onPageChange,
  isLoading = false,
  ...props
}: TransactionsListPageProps) {
  const isEmbedded = variant === "embedded";
  const showSearch = !isEmbedded && Boolean(onSearchChange);
  const showFilters = !isEmbedded && !isDrawerOpen && Boolean(onFiltersChange);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [ownFiltersOpen, setOwnFiltersOpen] = useState(false);
  const filtersOpen = filtersOpenProp ?? ownFiltersOpen;
  const setFiltersOpen = (open: boolean) => {
    if (filtersOpenProp === undefined) setOwnFiltersOpen(open);
    onFiltersOpenChange?.(open);
  };

  const totalTransactions = total ?? transactions.length;
  const pages = pageCount ?? Math.max(1, Math.ceil(totalTransactions / itemsPerPage));
  const isNarrowed = hasActiveFilters(filters, search);

  // Handler for clicking outside to deselect
  const handleClickOutside = useCallback(() => {
    setSelectedTransaction(null);
    if (onTransactionSelect) {
      onTransactionSelect(null);
    }
  }, [onTransactionSelect]);

  // Use global click-outside hook to detect clicks anywhere in the app
  useGlobalClickOutside(handleClickOutside, !!selectedTransaction, [
    // Don't trigger when clicking on table rows or interactive elements within the table
    "tr",
    // Don't trigger when clicking drawer content
    "[data-drawer-content]",
    // Don't trigger when clicking other interactive elements
    'button[aria-label="Close drawer"]',
    "input",
    "select",
    "textarea",
    // Don't trigger on menu items
    '[role="menu"]',
    '[role="menuitem"]',
  ]);

  const tableArea = () => {
    if (isLoading) {
      return (
        <p className="px-4 py-12 text-center text-sm text-gray-500" role="status">
          Loading transactions…
        </p>
      );
    }

    if (transactions.length === 0) {
      return isNarrowed ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-gray-500">No transactions match these filters.</p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-2 text-sm text-primary-600 hover:text-primary-500 cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <p className="px-4 py-12 text-center text-sm text-gray-500">No transactions yet.</p>
      );
    }

    return (
      <DataTable<Transaction>
        types={types}
        columns={columns}
        rows={transactions}
        onRowClick={(row) => {
          const transaction = row;
          setSelectedTransaction(transaction);
          if (onTransactionSelect) {
            onTransactionSelect(transaction);
          }
          if (onRowClick && transaction) {
            onRowClick(transaction.id);
          }
        }}
        selected={selectedTransaction ?? undefined}
        rowKey="id"
      />
    );
  };

  const paginator = (where: string) => (
    <Paginator
      current={page}
      pages={pages}
      perPage={itemsPerPage}
      total={totalTransactions}
      setPage={onPageChange}
      label={paginatorLabel(where, props["aria-label"], props["aria-labelledby"])}
      labelledBy={props["aria-label"] ? undefined : props["aria-labelledby"]}
    />
  );

  return (
    <div className={twMerge("space-y-6", className)} {...props}>
      {/* Compact header with title, description and wide search */}
      {!isEmbedded && (
        <Section>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <H2>Transactions</H2>
              <P className="text-gray-500 mt-1">View and manage transaction history across all API endpoints.</P>
            </div>

            {showSearch && onSearchChange && (
              <div className="flex-1 max-w-md">
                <SearchInput
                  label=""
                  placeHolder="Search by endpoint, method, status..."
                  setSearch={onSearchChange}
                  search={search}
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Filters and content layout */}
      <div className="flex gap-6">
        {showFilters && onFiltersChange && (
          <>
            {filtersOpen ? (
              <div className="w-64 flex-shrink-0">
                <div className="text-right mb-4">
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="text-gray-500 mx-1 font-normal text-xs hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label="Hide filters sidebar"
                    type="button"
                  >
                    <ChevronDoubleLeftIcon className="h-3 w-3 inline-block mr-1" />
                    hide
                  </button>
                </div>
                <TransactionsFiltersSidebar
                  filters={filters ?? {}}
                  onFiltersChange={onFiltersChange}
                  onResetFilters={onResetFilters ?? (() => undefined)}
                  facets={facets}
                />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="text-gray-500 mx-1 font-normal text-xs hover:text-gray-600 transition-colors flex flex-col items-center cursor-pointer"
                  aria-label="Show filters sidebar"
                  type="button"
                >
                  <ChevronDoubleRightIcon className="h-3 w-3" />
                  <div className="w-4">
                    <div className="rotate-90 whitespace-nowrap">filters</div>
                  </div>
                </button>
              </div>
            )}
          </>
        )}

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Transactions table with pagination above and below */}
          <div className="rounded-none border-0 overflow-hidden bg-white">
            <div className="border-b border-gray-200">{paginator("above")}</div>

            <div className="overflow-x-auto">{tableArea()}</div>

            <div className="border-t border-gray-200">{paginator("below")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
