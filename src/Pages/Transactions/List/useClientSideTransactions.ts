import type { FilterChangeHandler, Filters } from "@msqd/lydia/Models/Filters";
import { type TransactionFacets, deriveTransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import { filterTransactions } from "@msqd/lydia/Models/Transactions/filtering";
import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { useCallback, useMemo, useState } from "react";

export interface ClientSideTransactionsOptions {
  itemsPerPage?: number;
  initialFilters?: Filters;
  initialSearch?: string;
}

export interface ClientSideTransactions {
  transactions: Transaction[];
  facets: TransactionFacets;
  filters: Filters;
  onFiltersChange: FilterChangeHandler;
  onResetFilters: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  page: number;
  pageCount: number;
  total: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Filters, searches and paginates a list of transactions in memory, and returns the whole prop
 * bundle `TransactionsListPage` expects.
 *
 * **This is the fallback, not the recommended path.** A consumer that fetches transactions from a
 * server filters, searches and paginates there, where the whole dataset is; doing it here narrows
 * only the page already fetched, and the totals are the totals of that page. Reach for this when
 * the whole list is already in memory and small: stories, demos, a fixed list in a drawer.
 *
 * Pass a stable `transactions` array. A fresh literal on every render defeats the memo and costs a
 * full filter pass each time; hoist an empty default to a module-level constant.
 *
 * The requested page is clamped for display but remembered, so a list whose data shrinks and grows
 * back underneath returns the reader to where they were.
 */
export function useClientSideTransactions(
  transactions: Transaction[],
  { itemsPerPage = 20, initialFilters = {}, initialSearch = "" }: ClientSideTransactionsOptions = {},
): ClientSideTransactions {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const matching = useMemo(
    () => filterTransactions(transactions, { filters, search }),
    [transactions, filters, search],
  );

  // From `transactions`, never from `matching`. Deriving the vocabulary from the filtered set
  // would remove every unselected value from the list the moment one is selected, leaving the
  // user unable to deselect it: the control they need is gone.
  const facets = useMemo(() => deriveTransactionFacets(transactions), [transactions]);

  const pageCount = Math.max(1, Math.ceil(matching.length / itemsPerPage));
  // Bounded both ways. Without the lower bound a negative page slices from the end of the list,
  // rendering a window from the middle while reporting a nonsense page number. A page restored
  // from a URL is exactly where a 0, a negative or a NaN comes from.
  const requestedPage = Number.isFinite(page) ? page : 1;
  const currentPage = Math.max(1, Math.min(requestedPage, pageCount));

  const onFiltersChange = useCallback<FilterChangeHandler>((name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setPage(1);
  }, []);

  const onResetFilters = useCallback(() => {
    setFilters({});
    setSearch("");
    setPage(1);
  }, []);

  const onSearchChange = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
  }, []);

  return {
    transactions: matching.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    facets,
    filters,
    onFiltersChange,
    onResetFilters,
    search,
    onSearchChange,
    page: currentPage,
    pageCount,
    total: matching.length,
    itemsPerPage,
    onPageChange: setPage,
  };
}
