import type { Transaction } from "./types";

/**
 * How a transaction is encoded into the values its facets offer.
 *
 * These three encodings are shared by `deriveTransactionFacets`, which produces the vocabulary,
 * and `filterTransactions`, which consumes selections from it. They have to agree: if a facet
 * offers a value the filter cannot match, or the filter accepts one the facet never offers,
 * nothing throws and nobody finds out. Two copies would drift silently, so there is one.
 */

/** The class token of a status code: `404` is in class `"4"`. */
export const statusClassOf = (statusCode: number): string => String(Math.floor(statusCode / 100));

/**
 * The status tokens a transaction answers to (ADR 0002): its class (`"4"`), its code (`"404"`), and
 * `failure`, which is the transaction's own status and not a code.
 */
export const statusGroupsOf = (transaction: Transaction): string[] => {
  const tokens = [statusClassOf(transaction.statusCode), String(transaction.statusCode)];

  if (transaction.status === "Failed") {
    tokens.push("failure");
  }

  return tokens;
};

/** `"4xx"` (in any case) is a label, not a value; a consumer that passes it means the class `"4"`. */
export const canonicalStatusToken = (value: string): string => value.replace(/^([1-5])xx$/i, "$1");

const statusToken = /^(?:[1-5]|[1-5]\d\d|-[1-5]\d\d|failure)$/;

export interface StatusSelection {
  classes: string[];
  codes: string[];
  /** Codes excluded from a class that is selected whole. */
  excluded: string[];
  failure: boolean;
}

/**
 * Reads status tokens into what they select. A value outside the vocabulary is reported with
 * `console.error` and ignored, never dropped in silence: this runs during render, where a stale URL
 * must not crash the page, and the report is how the typo or stale value gets found.
 *
 * A code beside its own class reads as the class, and an exclusion only means something beside its
 * class, so both are dropped (ADR 0002, "Reading a filter").
 */
export function parseStatusSelection(values: string[]): StatusSelection {
  const tokens = values.map(canonicalStatusToken).filter((token, index) => {
    if (statusToken.test(token)) {
      return true;
    }
    console.error(
      `Unknown status value "${values[index]}" ignored: expected a class ("4"), a code ("404"), an exclusion ("-404") or "failure".`,
    );
    return false;
  });

  const classes = tokens.filter((token) => token.length === 1);
  const beside = (code: string) => classes.includes(code[0]);

  return {
    classes,
    codes: tokens.filter((token) => token.length === 3 && !beside(token)),
    excluded: tokens.filter((token) => token.startsWith("-") && beside(token.slice(1))).map((token) => token.slice(1)),
    failure: tokens.includes("failure"),
  };
}

/**
 * Cache status, folding the legacy `cached` boolean into the status it stands for.
 *
 * A transaction that reported nothing resolves to `unknown`, not to `miss`. "Nothing is known" and
 * "the cache was consulted and did not have it" are different facts, and only the second is a miss;
 * calling absence a miss makes a claim the transaction never made. An explicit `cached: false` is
 * a claim, and stays a miss.
 */
export const effectiveCacheStatus = (transaction: Transaction): string => {
  if (transaction.cacheStatus) {
    return transaction.cacheStatus;
  }

  if (transaction.cached === undefined) {
    return "unknown";
  }

  return transaction.cached ? "hit" : "miss";
};

/** Tags as `key=value` pairs: the key carries the meaning, so a bare value would conflate keys. */
export const tagPairsOf = (transaction: Transaction): string[] =>
  Object.entries(transaction.tags ?? {}).map(([key, value]) => `${key}=${value}`);

/** Status classes a facet may offer, in reading order. Anything outside this is not offered. */
export const statusClassOrder = ["1", "2", "3", "4", "5"];

/** Cache statuses a facet may offer, in reading order. `unknown` sits last: it is an absence. */
export const cacheStatusOrder = ["hit", "miss", "stale", "bypass", "unknown"];
