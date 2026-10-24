import type { FacetOption, FilterMeta } from "@msqd/lydia/Models/Filters";
import { cacheStatusOrder, effectiveCacheStatus, statusClassOrder, statusGroupsOf, tagPairsOf } from "./encoding";
import type { Transaction } from "./types";

/** The facets a transaction list can be narrowed by. */
export type TransactionFacetName = "endpoint" | "method" | "status" | "cacheStatus" | "flags" | "tags";

/** Options offered by each facet. A facet with no entry offers nothing rather than something made up. */
export type TransactionFacets = Partial<Record<Exclude<TransactionFacetName, "status">, FilterMeta[]>> & {
  /** Status classes with their codes nested under them (ADR 0002). */
  status?: FacetOption[];
};

const cacheStatusLabels: Record<string, string> = {
  hit: "Cache Hit",
  miss: "Cache Miss",
  stale: "Stale",
  bypass: "Bypass",
  unknown: "Not reported",
};

const tally = (values: string[]) => {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
};

const byCountDescending = (counts: Map<string, number>, label: (name: string) => string = (name) => name) =>
  [...counts.entries()].sort(([, a], [, b]) => b - a).map(([name, count]) => ({ name, label: label(name), count }));

const inGivenOrder = (counts: Map<string, number>, order: string[], labels: Record<string, string>) =>
  order.filter((name) => counts.has(name)).map((name) => ({ name, label: labels[name], count: counts.get(name) ?? 0 }));

const statusClassDescriptions: Record<string, string> = {
  "1": "Informational",
  "2": "Success",
  "3": "Redirection",
  "4": "Client Error",
  "5": "Server Error",
};

/**
 * Classes with their codes nested under, then `failure` flat (ADR 0002). A class appears only when
 * the data holds a code in it, and a code only when the data holds it.
 */
const statusOptions = (transactions: Transaction[]): FacetOption[] => {
  const counts = tally(transactions.flatMap(statusGroupsOf));
  const failures = counts.get("failure");

  const classes = statusClassOrder
    .filter((name) => counts.has(name))
    .map((name) => ({
      name,
      label: `${name}xx`,
      description: statusClassDescriptions[name],
      count: counts.get(name) ?? 0,
      under: [...counts.entries()]
        .filter(([token]) => token.length === 3 && token.startsWith(name))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([code, count]) => ({ name: code, label: code, count })),
    }));

  return failures ? [...classes, { name: "failure", label: "Failure", count: failures }] : classes;
};

/**
 * Derives the facet options a list of transactions can offer, with their counts.
 *
 * **Derive from the full set you were handed, never from a page of it.** A facet count describes
 * the dataset, so counting a page gives a number that disagrees with what a server would compute
 * over the same data, while looking just as authoritative. This is the client-side counterpart of
 * a server's facet query, and it is only correct while it sees everything.
 *
 * Counts are of the unfiltered set: selecting `GET` does not narrow the status counts. Narrowing
 * each facet by the others is a different product behaviour, not a refinement of this one.
 *
 * `flags` is absent by construction. Flags are per-user state kept in their own table, keyed by
 * user and transaction, so no transaction payload can answer that facet at all. Only a consumer
 * that can ask the right question supplies those options.
 */
export function deriveTransactionFacets(transactions: Transaction[]): TransactionFacets {
  return {
    endpoint: byCountDescending(tally(transactions.map((transaction) => transaction.url))),
    method: byCountDescending(tally(transactions.map((transaction) => transaction.method))),
    status: statusOptions(transactions),
    cacheStatus: inGivenOrder(tally(transactions.map(effectiveCacheStatus)), cacheStatusOrder, cacheStatusLabels),
    tags: byCountDescending(tally(transactions.flatMap(tagPairsOf))),
  };
}
