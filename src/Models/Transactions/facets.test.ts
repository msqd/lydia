import { describe, expect, it } from "vitest";
import { deriveTransactionFacets } from "./facets";
import { filterTransactions } from "./filtering";
import type { Transaction } from "./types";

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "tx-1",
  url: "/api/users",
  method: "GET",
  status: "Successful",
  statusCode: 200,
  timestamp: "2025-05-20T10:30:00",
  responseTime: 120,
  client: "Website",
  ...overrides,
});

describe("deriveTransactionFacets", () => {
  it("offers nothing when there are no transactions", () => {
    expect(deriveTransactionFacets([])).toEqual({
      endpoint: [],
      method: [],
      status: [],
      cacheStatus: [],
      tags: [],
    });
  });

  describe("endpoints", () => {
    it("offers each endpoint once, with how many transactions hit it", () => {
      const transactions = [
        transaction({ url: "/api/users" }),
        transaction({ url: "/api/users" }),
        transaction({ url: "/api/orders" }),
      ];

      expect(deriveTransactionFacets(transactions).endpoint).toEqual([
        { name: "/api/users", label: "/api/users", count: 2 },
        { name: "/api/orders", label: "/api/orders", count: 1 },
      ]);
    });

    it("offers no endpoint that is not in the data", () => {
      const offered = deriveTransactionFacets([transaction({ url: "/api/only" })]).endpoint;

      expect(offered?.map((option) => option.name)).toEqual(["/api/only"]);
    });

    it("puts the busiest endpoint first", () => {
      const transactions = [
        transaction({ url: "/api/rare" }),
        transaction({ url: "/api/busy" }),
        transaction({ url: "/api/busy" }),
      ];

      expect(deriveTransactionFacets(transactions).endpoint?.[0].name).toBe("/api/busy");
    });
  });

  describe("methods", () => {
    it("offers only the methods present", () => {
      const transactions = [transaction({ method: "GET" }), transaction({ method: "POST" })];

      expect(deriveTransactionFacets(transactions).method).toEqual([
        { name: "GET", label: "GET", count: 1 },
        { name: "POST", label: "POST", count: 1 },
      ]);
    });
  });

  describe("status", () => {
    it("offers each class by its digit, labelled 4xx, with the codes seen nested under it", () => {
      const transactions = [
        transaction({ statusCode: 204 }),
        transaction({ statusCode: 200 }),
        transaction({ statusCode: 200 }),
        transaction({ statusCode: 404 }),
      ];

      expect(deriveTransactionFacets(transactions).status).toEqual([
        {
          name: "2",
          label: "2xx",
          description: "Success",
          count: 3,
          under: [
            { name: "200", label: "200", count: 2 },
            { name: "204", label: "204", count: 1 },
          ],
        },
        {
          name: "4",
          label: "4xx",
          description: "Client Error",
          count: 1,
          under: [{ name: "404", label: "404", count: 1 }],
        },
      ]);
    });

    it("describes each class in words, and its codes not at all", () => {
      const transactions = [100, 200, 300, 404, 500].map((statusCode) => transaction({ statusCode }));
      const status = deriveTransactionFacets(transactions).status ?? [];

      expect(status.map((option) => option.description)).toEqual([
        "Informational",
        "Success",
        "Redirection",
        "Client Error",
        "Server Error",
      ]);
      expect(status.flatMap((option) => option.under ?? []).map((code) => code.description)).toEqual(
        Array(5).fill(undefined),
      );
    });

    it("offers failure only when something failed", () => {
      const succeeded = deriveTransactionFacets([transaction()]).status;
      expect(succeeded?.map((option) => option.name)).not.toContain("failure");

      const failed = deriveTransactionFacets([transaction({ status: "Failed", statusCode: 0 })]).status;
      expect(failed).toContainEqual({ name: "failure", label: "Failure", count: 1 });
      expect(failed?.find((option) => option.name === "failure")).not.toHaveProperty("under");
    });

    it("keeps the groups in code order rather than by count", () => {
      const transactions = [
        transaction({ statusCode: 500 }),
        transaction({ statusCode: 500 }),
        transaction({ statusCode: 200 }),
      ];

      expect(deriveTransactionFacets(transactions).status?.map((option) => option.name)).toEqual(["2", "5"]);
    });
  });

  describe("cache status", () => {
    it("counts the status each transaction effectively has", () => {
      const transactions = [
        transaction({ cacheStatus: "hit" }),
        transaction({ cached: true }),
        transaction({ cacheStatus: "stale" }),
        transaction({ cached: false }),
      ];

      expect(deriveTransactionFacets(transactions).cacheStatus).toEqual([
        { name: "hit", label: "Cache Hit", count: 2 },
        { name: "miss", label: "Cache Miss", count: 1 },
        { name: "stale", label: "Stale", count: 1 },
      ]);
    });

    it("offers a value for the transactions that reported nothing", () => {
      // A choice facet has room for "not reported", unlike a bounded range, so hiding those rows
      // would let a user select every offered value and still not see all their transactions.
      const transactions = [transaction({ cacheStatus: "hit" }), transaction({}), transaction({})];

      expect(deriveTransactionFacets(transactions).cacheStatus).toEqual([
        { name: "hit", label: "Cache Hit", count: 1 },
        { name: "unknown", label: "Not reported", count: 2 },
      ]);
    });

    it("partitions the transactions, so the counts sum to the whole", () => {
      // Cache status is single-valued per transaction, so once "unknown" exists every transaction
      // lands in exactly one bucket. A reader can check the sidebar adds up.
      const transactions = [
        transaction({ cacheStatus: "hit" }),
        transaction({ cacheStatus: "stale" }),
        transaction({ cached: true }),
        transaction({ cached: false }),
        transaction({}),
      ];

      const counted = (deriveTransactionFacets(transactions).cacheStatus ?? []).reduce(
        (total, option) => total + (option.count ?? 0),
        0,
      );

      expect(counted).toBe(transactions.length);
    });
  });

  describe("tags", () => {
    it("offers each key=value pair once", () => {
      const transactions = [
        transaction({ tags: { domain: "user", surface: "profile" } }),
        transaction({ tags: { domain: "user" } }),
      ];

      expect(deriveTransactionFacets(transactions).tags).toEqual([
        { name: "domain=user", label: "domain=user", count: 2 },
        { name: "surface=profile", label: "surface=profile", count: 1 },
      ]);
    });

    it("keeps two keys sharing a value apart", () => {
      const transactions = [transaction({ tags: { domain: "user" } }), transaction({ tags: { client: "user" } })];

      expect(deriveTransactionFacets(transactions).tags?.map((option) => option.name)).toEqual([
        "domain=user",
        "client=user",
      ]);
    });
  });

  describe("flags", () => {
    it("offers no flags at all, because a transaction cannot answer them", () => {
      // Flags are per-user state in their own table, keyed by (user, transaction, flag). Deriving
      // them from a transaction payload is not merely unimplemented, it is impossible.
      expect(deriveTransactionFacets([transaction()])).not.toHaveProperty("flags");
    });
  });

  it("counts the whole list it was handed, not a page of it", () => {
    // The rule that keeps a client-side count agreeing with a server-computed one: a facet count
    // describes the dataset, so it is only right when derived from all of it.
    const transactions = Array.from({ length: 30 }, () => transaction({ url: "/api/users" }));

    expect(deriveTransactionFacets(transactions).endpoint?.[0].count).toBe(30);
  });
});

describe("the vocabulary and the filter agree", () => {
  // deriveTransactionFacets produces the vocabulary and filterTransactions consumes selections
  // from it. They share three non-obvious encodings: the status grouping, where "failure" is the
  // transaction's own status and not a code; the key=value tag pairs; and the cache status with
  // its legacy `cached` fallback. If those ever drift, a facet offers a value the filter cannot
  // match, or accepts one the facet never offers, and nothing throws. This is the guard.
  const varied: Transaction[] = [
    transaction({ id: "a", url: "/api/users", method: "GET", statusCode: 200, cacheStatus: "hit" }),
    transaction({ id: "b", url: "/api/orders", method: "POST", statusCode: 201, cached: true }),
    transaction({ id: "c", url: "/api/orders", method: "DELETE", statusCode: 404 }),
    transaction({ id: "d", url: "/api/pay", method: "PROPFIND", statusCode: 503, cacheStatus: "bypass" }),
    transaction({ id: "e", url: "/api/pay", method: "GET", statusCode: 0, status: "Failed" }),
    transaction({ id: "f", url: "/api/tagged", method: "PATCH", statusCode: 302, tags: { domain: "user" } }),
    transaction({
      id: "g",
      url: "/api/tagged",
      method: "GET",
      statusCode: 204,
      tags: { domain: "user", tier: "free" },
    }),
  ];

  const facets = deriveTransactionFacets(varied);

  it.each(["endpoint", "method", "status", "cacheStatus", "tags"] as const)(
    "offers no %s value that matches nothing",
    (facet) => {
      for (const option of facets[facet] ?? []) {
        const matched = filterTransactions(varied, { filters: { [facet]: [option.name] } });

        expect({ facet, option: option.name, matched: matched.length }).toEqual({
          facet,
          option: option.name,
          matched: option.count,
        });
      }
    },
  );

  it("offers no status class or code that matches nothing, nor a count it does not match", () => {
    // Classes and codes alike: the class count and every code count must be what selecting it finds.
    for (const option of facets.status ?? []) {
      for (const entry of [option, ...(option.under ?? [])]) {
        const matched = filterTransactions(varied, { filters: { status: [entry.name] } });

        expect({ value: entry.name, matched: matched.length }).toEqual({ value: entry.name, matched: entry.count });
      }
    }
  });

  it("offers the codes of a class that add up to the class", () => {
    for (const option of (facets.status ?? []).filter((entry) => entry.under)) {
      const total = (option.under ?? []).reduce((sum, code) => sum + (code.count ?? 0), 0);

      expect({ value: option.name, total }).toEqual({ value: option.name, total: option.count });
    }
  });

  it("exercises the unknown cache status, so the invariant above covers it", () => {
    // Guards the guard: if the fixture stopped containing a transaction that reported no cache
    // information, the invariant would still pass and would no longer be checking the case of a transaction
    // with no cache information.
    expect(facets.cacheStatus?.map((option) => option.name)).toContain("unknown");
  });

  it("offers every value the filter would match, for the facets it can derive", () => {
    // The converse: a value present in the data must be offered, or a user cannot ask for it.
    expect(facets.method?.map((option) => option.name).sort()).toEqual(
      ["DELETE", "GET", "PATCH", "POST", "PROPFIND"].sort(),
    );
    expect(facets.endpoint?.map((option) => option.name).sort()).toEqual(
      ["/api/orders", "/api/pay", "/api/tagged", "/api/users"].sort(),
    );
  });

  it("counts a failed transaction under its code group as well as under failure", () => {
    // A 503 that failed is both a 5xx response and a failure, and both facet values must find it.
    const failed503 = [transaction({ id: "x", statusCode: 503, status: "Failed" })];

    expect(filterTransactions(failed503, { filters: { status: ["5"] } })).toHaveLength(1);
    expect(filterTransactions(failed503, { filters: { status: ["503"] } })).toHaveLength(1);
    expect(filterTransactions(failed503, { filters: { status: ["failure"] } })).toHaveLength(1);
    expect(deriveTransactionFacets(failed503).status).toEqual([
      {
        name: "5",
        label: "5xx",
        description: "Server Error",
        count: 1,
        under: [{ name: "503", label: "503", count: 1 }],
      },
      { name: "failure", label: "Failure", count: 1 },
    ]);
  });
});
