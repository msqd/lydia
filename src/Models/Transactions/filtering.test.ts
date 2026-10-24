import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

const ids = (transactions: Transaction[]) => transactions.map((item) => item.id);

describe("filterTransactions", () => {
  it("returns everything when nothing is filtered", () => {
    const transactions = [transaction({ id: "a" }), transaction({ id: "b" })];

    expect(filterTransactions(transactions, {})).toEqual(transactions);
  });

  describe("an inactive facet does not filter", () => {
    it("keeps everything when a choice facet has no selection", () => {
      const transactions = [transaction({ id: "a", method: "GET" }), transaction({ id: "b", method: "POST" })];

      expect(ids(filterTransactions(transactions, { filters: { method: [] } }))).toEqual(["a", "b"]);
    });

    it("keeps everything when a range has no bounds", () => {
      const transactions = [transaction({ id: "a", tpdex: 10 }), transaction({ id: "b" })];

      expect(ids(filterTransactions(transactions, { filters: { tpdex: {} } }))).toEqual(["a", "b"]);
    });

    it("keeps a still-running transaction in the default view", () => {
      // The reason inactivity matters: an in-flight transaction has no tpdex yet, and it must
      // not disappear from an unfiltered list.
      const running = transaction({ id: "running", tpdex: undefined });

      expect(filterTransactions([running], { filters: {} })).toEqual([running]);
    });
  });

  describe("endpoint and method", () => {
    it("keeps only the selected endpoints", () => {
      const transactions = [transaction({ id: "a", url: "/api/users" }), transaction({ id: "b", url: "/api/orders" })];

      expect(ids(filterTransactions(transactions, { filters: { endpoint: ["/api/orders"] } }))).toEqual(["b"]);
    });

    it("keeps any of the selected methods", () => {
      const transactions = [
        transaction({ id: "a", method: "GET" }),
        transaction({ id: "b", method: "POST" }),
        transaction({ id: "c", method: "DELETE" }),
      ];

      expect(ids(filterTransactions(transactions, { filters: { method: ["GET", "DELETE"] } }))).toEqual(["a", "c"]);
    });
  });

  describe("status", () => {
    const transactions = [
      transaction({ id: "ok", statusCode: 200 }),
      transaction({ id: "moved", statusCode: 301 }),
      transaction({ id: "denied", statusCode: 403 }),
      transaction({ id: "missing", statusCode: 404 }),
      transaction({ id: "invalid", statusCode: 422 }),
      transaction({ id: "boom", statusCode: 500 }),
      transaction({ id: "failed", statusCode: 0, status: "Failed" }),
    ];
    const matching = (status: string[]) => ids(filterTransactions(transactions, { filters: { status } }));

    it("matches a class by its digit, codes not seen yet included", () => {
      expect(matching(["4"])).toEqual(["denied", "missing", "invalid"]);
      expect(matching(["2", "5"])).toEqual(["ok", "boom"]);
    });

    it("matches a code", () => {
      expect(matching(["404"])).toEqual(["missing"]);
      expect(matching(["404", "500"])).toEqual(["missing", "boom"]);
    });

    it("matches a class minus the codes excluded beside it", () => {
      expect(matching(["4", "-404"])).toEqual(["denied", "invalid"]);
      expect(matching(["4", "-404", "-422"])).toEqual(["denied"]);
    });

    it("reads a class beside one of its codes as the class", () => {
      expect(matching(["4", "404"])).toEqual(["denied", "missing", "invalid"]);
      expect(matching(["4", "-404", "404"])).toEqual(["denied", "invalid"]);
    });

    it("reads an exclusion beside no class as nothing for that class", () => {
      expect(matching(["-404", "500"])).toEqual(["boom"]);
      expect(matching(["4", "-500"])).toEqual(["denied", "missing", "invalid"]);
      expect(matching(["-404"])).toHaveLength(transactions.length);
    });

    it("treats failure as the transaction status rather than a code", () => {
      expect(matching(["failure"])).toEqual(["failed"]);
    });

    it.each(["4xx", "4XX", "4Xx"])("reads a class written %s as the class", (written) => {
      expect(matching([written])).toEqual(matching(["4"]));
      expect(matching([written, "-404"])).toEqual(matching(["4", "-404"]));
    });

    describe("an unknown value", () => {
      let report: MockInstance;

      beforeEach(() => {
        report = vi.spyOn(console, "error").mockImplementation(() => undefined);
      });

      afterEach(() => {
        report.mockRestore();
      });

      it.each(["banana", "4x", "xx", "6x", "44", "4040", "-4", "--404", "-failure", "", "Failure"])(
        "is reported and ignored: %j",
        (value) => {
          expect(matching([value])).toHaveLength(transactions.length);
          expect(report).toHaveBeenCalledWith(expect.stringContaining(`Unknown status value "${value}"`));
        },
      );

      it("leaves the other values to filter", () => {
        expect(matching(["banana", "404"])).toEqual(["missing"]);
        expect(report).toHaveBeenCalledTimes(1);
      });

      it("is reported even when there is nothing to filter", () => {
        filterTransactions([], { filters: { status: ["banana"] } });

        expect(report).toHaveBeenCalledWith(expect.stringContaining('Unknown status value "banana"'));
      });
    });
  });

  describe("time range", () => {
    const transactions = [
      transaction({ id: "early", timestamp: "2025-05-19T23:00:00" }),
      transaction({ id: "during", timestamp: "2025-05-20T10:30:00" }),
      transaction({ id: "late", timestamp: "2025-05-21T08:00:00" }),
    ];

    it("keeps what falls inside the range", () => {
      const filters = { time: { startDate: "2025-05-20", endDate: "2025-05-20" } };

      expect(ids(filterTransactions(transactions, { filters }))).toEqual(["during"]);
    });

    it("includes the whole of the end day", () => {
      const filters = { time: { startDate: "2025-05-20", endDate: "2025-05-21" } };

      expect(ids(filterTransactions(transactions, { filters }))).toEqual(["during", "late"]);
    });

    it("accepts an open-ended range", () => {
      expect(ids(filterTransactions(transactions, { filters: { time: { startDate: "2025-05-20" } } }))).toEqual([
        "during",
        "late",
      ]);
    });
  });

  describe("tpdex", () => {
    const scored = transaction({ id: "scored", tpdex: 40 });
    const good = transaction({ id: "good", tpdex: 95 });
    const running = transaction({ id: "running", tpdex: undefined });

    it("keeps scores inside the bounds", () => {
      expect(ids(filterTransactions([scored, good], { filters: { tpdex: { min: 90 } } }))).toEqual(["good"]);
      expect(ids(filterTransactions([scored, good], { filters: { tpdex: { max: 50 } } }))).toEqual(["scored"]);
    });

    it("excludes a transaction with no score once a bound is active", () => {
      // A missing score is not a low score and not a middle one. Substituting any value would
      // make a fabricated score indistinguishable from a measured one.
      expect(ids(filterTransactions([scored, running], { filters: { tpdex: { min: 0 } } }))).toEqual(["scored"]);
      expect(ids(filterTransactions([scored, running], { filters: { tpdex: { max: 100 } } }))).toEqual(["scored"]);
    });

    it("does not derive a score from the response time", () => {
      const fast = transaction({ id: "fast", responseTime: 1, tpdex: undefined });

      expect(filterTransactions([fast], { filters: { tpdex: { min: 90 } } })).toEqual([]);
    });
  });

  describe("cache status", () => {
    // These four must not collapse into each other. "Nothing was reported" and "the cache was
    // consulted and did not have it" are different facts, and only the second is a miss.
    it.each([
      ["an explicit status", { cacheStatus: "hit" as const }, "hit"],
      ["an explicit miss", { cacheStatus: "miss" as const }, "miss"],
      ["the legacy cached flag set", { cached: true }, "hit"],
      ["the legacy cached flag cleared", { cached: false }, "miss"],
      ["nothing reported at all", {}, "unknown"],
    ])("matches %s under %s", (_name, fields, expected) => {
      const subject = transaction({ id: "subject", ...fields });

      expect(ids(filterTransactions([subject], { filters: { cacheStatus: [expected] } }))).toEqual(["subject"]);
    });

    it("does not count a transaction that reported nothing as a miss", () => {
      // The defect this replaces: absence resolved to "miss", so a transaction that never said
      // anything about caching answered a question it was never asked.
      const silent = transaction({ id: "silent" });

      expect(filterTransactions([silent], { filters: { cacheStatus: ["miss"] } })).toEqual([]);
    });

    it("keeps an explicit not-cached apart from having said nothing", () => {
      const explicit = transaction({ id: "explicit", cached: false });
      const silent = transaction({ id: "silent" });

      expect(ids(filterTransactions([explicit, silent], { filters: { cacheStatus: ["miss"] } }))).toEqual(["explicit"]);
      expect(ids(filterTransactions([explicit, silent], { filters: { cacheStatus: ["unknown"] } }))).toEqual([
        "silent",
      ]);
    });

    it("uses the explicit status when there is one", () => {
      const transactions = [
        transaction({ id: "hit", cacheStatus: "hit" }),
        transaction({ id: "stale", cacheStatus: "stale" }),
      ];

      expect(ids(filterTransactions(transactions, { filters: { cacheStatus: ["stale"] } }))).toEqual(["stale"]);
    });

    it("reads the legacy cached flag as a hit", () => {
      const transactions = [transaction({ id: "legacy", cached: true }), transaction({ id: "plain" })];

      expect(ids(filterTransactions(transactions, { filters: { cacheStatus: ["hit"] } }))).toEqual(["legacy"]);
    });

    it("treats no cache information at all as unknown rather than as a miss", () => {
      // This test asserted the opposite: no cache information read as a miss. It was the defect, written down.
      const transactions = [transaction({ id: "plain" }), transaction({ id: "hit", cacheStatus: "hit" })];

      expect(filterTransactions(transactions, { filters: { cacheStatus: ["miss"] } })).toEqual([]);
      expect(ids(filterTransactions(transactions, { filters: { cacheStatus: ["unknown"] } }))).toEqual(["plain"]);
    });
  });

  describe("search", () => {
    const transactions = [
      transaction({ id: "users", url: "/api/users", method: "GET", statusCode: 200, apiName: "users-api" }),
      transaction({ id: "orders", url: "/api/orders", method: "POST", statusCode: 404, apiName: "orders-api" }),
    ];

    it("matches the endpoint, the method, the status code and the api name", () => {
      expect(ids(filterTransactions(transactions, { search: "orders" }))).toEqual(["orders"]);
      expect(ids(filterTransactions(transactions, { search: "post" }))).toEqual(["orders"]);
      expect(ids(filterTransactions(transactions, { search: "404" }))).toEqual(["orders"]);
      expect(ids(filterTransactions(transactions, { search: "users-api" }))).toEqual(["users"]);
    });

    it("ignores case", () => {
      expect(ids(filterTransactions(transactions, { search: "ORDERS" }))).toEqual(["orders"]);
    });

    it("searches the fields the placeholder promises and no others", () => {
      // Scanning every value used to match ids, raw timestamps and "[object Object]".
      expect(filterTransactions(transactions, { search: "Website" })).toEqual([]);
      expect(filterTransactions(transactions, { search: "2025-05-20T10:30:00" })).toEqual([]);
    });

    it("ignores a whitespace-only term", () => {
      expect(ids(filterTransactions(transactions, { search: "  " }))).toEqual(["users", "orders"]);
    });
  });

  describe("facets combined", () => {
    it("requires every active facet to match", () => {
      const transactions = [
        transaction({ id: "a", method: "GET", statusCode: 200 }),
        transaction({ id: "b", method: "GET", statusCode: 500 }),
        transaction({ id: "c", method: "POST", statusCode: 200 }),
      ];

      const filters = { method: ["GET"], status: ["2"] };
      expect(ids(filterTransactions(transactions, { filters }))).toEqual(["a"]);
    });

    it("applies the search on top of the facets", () => {
      const transactions = [
        transaction({ id: "a", url: "/api/users", method: "GET" }),
        transaction({ id: "b", url: "/api/orders", method: "GET" }),
      ];

      expect(ids(filterTransactions(transactions, { filters: { method: ["GET"] }, search: "orders" }))).toEqual(["b"]);
    });
  });

  describe("tags", () => {
    const transactions = [
      transaction({ id: "user", tags: { domain: "user", surface: "profile" } }),
      transaction({ id: "soap", tags: { protocol: "soap", format: "xml" } }),
      transaction({ id: "untagged" }),
    ];

    it("matches a key=value pair", () => {
      expect(ids(filterTransactions(transactions, { filters: { tags: ["domain=user"] } }))).toEqual(["user"]);
    });

    it("matches any of the selected pairs", () => {
      const filters = { tags: ["domain=user", "format=xml"] };

      expect(ids(filterTransactions(transactions, { filters }))).toEqual(["user", "soap"]);
    });

    it("does not match on the value alone", () => {
      // The key carries the meaning: a bare "user" would conflate domain=user with, say,
      // client=user, which is exactly the ambiguity the pair form exists to remove.
      expect(filterTransactions(transactions, { filters: { tags: ["user"] } })).toEqual([]);
    });

    it("excludes a transaction with no tags at all", () => {
      expect(ids(filterTransactions(transactions, { filters: { tags: ["domain=user"] } }))).not.toContain("untagged");
    });
  });

  describe("facets this cannot answer client-side", () => {
    it("ignores a flags filter rather than guessing", () => {
      // Flags are per-user state held in their own HARP table, not transaction data, so a
      // transaction payload cannot answer the question at all.
      const transactions = [transaction({ id: "a" })];

      expect(ids(filterTransactions(transactions, { filters: { flags: ["favorite"] } }))).toEqual(["a"]);
    });
  });
});
