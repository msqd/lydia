import {
  type DateRangeFilter,
  type Filters,
  type MinMaxFilter,
  parseLocalDay,
  readArray,
  readDates,
  readRange,
} from "@msqd/lydia/Models/Filters";
import { effectiveCacheStatus, parseStatusSelection, statusClassOf, tagPairsOf } from "./encoding";
import type { Transaction } from "./types";

export interface TransactionCriteria {
  /** Facet selections, in the shape the facet components produce. */
  filters?: Filters;
  /** Free text term, matched against the fields the search placeholder promises. */
  search?: string;
}

/**
 * Fields the search term is matched against. Deliberately explicit: scanning every value of a
 * transaction matched ids, raw timestamps and the string "[object Object]", none of which a user
 * typing in a search box is looking for.
 */
const searchableValues = (transaction: Transaction) => [
  transaction.url,
  transaction.method,
  String(transaction.statusCode),
  transaction.apiName ?? "",
];

/**
 * Values outside the status vocabulary are reported and ignored. A selection that names no class,
 * code or failure (only unknown values, or exclusions, which mean nothing alone) does not filter.
 */
const statusMatcher = (selected: string[]): ((transaction: Transaction) => boolean) => {
  const { classes, codes, excluded, failure } = parseStatusSelection(selected);

  if (classes.length + codes.length === 0 && !failure) {
    return () => true;
  }

  return (transaction) => {
    const code = String(transaction.statusCode);

    return (
      (failure && transaction.status === "Failed") ||
      codes.includes(code) ||
      (classes.includes(statusClassOf(transaction.statusCode)) && !excluded.includes(code))
    );
  };
};

const matchesTimeRange = (transaction: Transaction, range: DateRangeFilter) => {
  const timestamp = new Date(transaction.timestamp);
  const start = parseLocalDay(range.startDate ?? "");
  const end = parseLocalDay(range.endDate ?? "");

  if (start && timestamp < start) {
    return false;
  }

  if (end) {
    const nextDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
    return timestamp < nextDay;
  }

  return true;
};

/**
 * A transaction that has not ended carries no score. Substituting one would make a fabricated
 * score indistinguishable from a measured one, so an absent score matches no bounded range.
 */
const matchesTpdex = (transaction: Transaction, range: MinMaxFilter) => {
  if (transaction.tpdex === undefined) {
    return false;
  }

  if (range.min !== undefined && transaction.tpdex < range.min) {
    return false;
  }

  return !(range.max !== undefined && transaction.tpdex > range.max);
};

const matchesTags = (transaction: Transaction, selected: string[]) => {
  const pairs = tagPairsOf(transaction);

  return selected.some((pair) => pairs.includes(pair));
};

/**
 * Applies facet selections and a search term to a list of transactions, in memory.
 *
 * This is the fallback for consumers with no filtering backend, not the recommended path: a
 * consumer that fetches transactions from a server filters, searches and paginates there, where
 * the whole dataset is. Filtering a page of results client-side narrows only that page.
 *
 * An inactive facet does not filter, so a transaction the facets say nothing about stays in the
 * default view. `flags` are per-user state kept outside the transaction payload, so no transaction
 * can answer them and the facet is ignored here.
 */
export function filterTransactions(transactions: Transaction[], criteria: TransactionCriteria): Transaction[] {
  const { filters = {}, search = "" } = criteria;
  const term = search.trim().toLowerCase();

  const endpoints = readArray(filters, "endpoint");
  const methods = readArray(filters, "method");
  const matchesStatus = statusMatcher(readArray(filters, "status"));
  const cacheStatuses = readArray(filters, "cacheStatus");
  const tags = readArray(filters, "tags");
  const time = readDates(filters, "time");
  const tpdex = readRange(filters, "tpdex");
  const boundedTpdex = tpdex.min !== undefined || tpdex.max !== undefined;

  return transactions.filter((transaction) => {
    if (term && !searchableValues(transaction).some((value) => value.toLowerCase().includes(term))) {
      return false;
    }

    if (endpoints.length > 0 && !endpoints.includes(transaction.url)) {
      return false;
    }

    if (methods.length > 0 && !methods.includes(transaction.method)) {
      return false;
    }

    if (!matchesStatus(transaction)) {
      return false;
    }

    if (cacheStatuses.length > 0 && !cacheStatuses.includes(effectiveCacheStatus(transaction))) {
      return false;
    }

    if (tags.length > 0 && !matchesTags(transaction, tags)) {
      return false;
    }

    if (!matchesTimeRange(transaction, time)) {
      return false;
    }

    return !(boundedTpdex && !matchesTpdex(transaction, tpdex));
  });
}
