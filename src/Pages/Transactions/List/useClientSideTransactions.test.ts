import type { Transaction } from "@msqd/lydia/Models/Transactions/types";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useClientSideTransactions } from "./useClientSideTransactions";

const transaction = (id: string, overrides: Partial<Transaction> = {}): Transaction => ({
  id,
  url: "/api/users",
  method: "GET",
  status: "Successful",
  statusCode: 200,
  timestamp: "2025-05-20T10:30:00",
  responseTime: 120,
  client: "Website",
  ...overrides,
});

const manyTransactions = Array.from({ length: 25 }, (_, index) => transaction(`tx-${index}`));

const ids = (transactions: Transaction[]) => transactions.map((item) => item.id);

describe("useClientSideTransactions", () => {
  it("hands back a page of transactions and the totals the page cannot infer", () => {
    const { result } = renderHook(() => useClientSideTransactions(manyTransactions, { itemsPerPage: 10 }));

    expect(result.current.transactions).toHaveLength(10);
    expect(result.current.total).toBe(25);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.page).toBe(1);
  });

  it("moves the window when the page changes", () => {
    const { result } = renderHook(() => useClientSideTransactions(manyTransactions, { itemsPerPage: 10 }));

    act(() => result.current.onPageChange(3));

    expect(ids(result.current.transactions)).toEqual(["tx-20", "tx-21", "tx-22", "tx-23", "tx-24"]);
  });

  it("offers status classes with their codes, and narrows on a class minus a code", () => {
    const transactions = [
      transaction("ok"),
      transaction("missing", { statusCode: 404 }),
      transaction("invalid", { statusCode: 422 }),
    ];
    const { result } = renderHook(() => useClientSideTransactions(transactions));

    expect(result.current.facets.status?.map((option) => option.name)).toEqual(["2", "4"]);
    expect(result.current.facets.status?.[1].under?.map((code) => code.name)).toEqual(["404", "422"]);

    act(() => result.current.onFiltersChange("status", ["4", "-404"]));

    expect(ids(result.current.transactions)).toEqual(["invalid"]);
  });

  it("narrows on a facet selection and returns to the first page", () => {
    const transactions = [transaction("a", { method: "GET" }), transaction("b", { method: "POST" })];
    const { result } = renderHook(() => useClientSideTransactions(transactions, { itemsPerPage: 1 }));

    act(() => result.current.onPageChange(2));
    act(() => result.current.onFiltersChange("method", ["POST"]));

    expect(result.current.page).toBe(1);
    expect(ids(result.current.transactions)).toEqual(["b"]);
    expect(result.current.total).toBe(1);
  });

  it("narrows on a search term and returns to the first page", () => {
    const transactions = [transaction("a", { url: "/api/users" }), transaction("b", { url: "/api/orders" })];
    const { result } = renderHook(() => useClientSideTransactions(transactions, { itemsPerPage: 1 }));

    act(() => result.current.onPageChange(2));
    act(() => result.current.onSearchChange("orders"));

    expect(result.current.page).toBe(1);
    expect(ids(result.current.transactions)).toEqual(["b"]);
  });

  it("clears filters, search and page together on reset", () => {
    const { result } = renderHook(() => useClientSideTransactions(manyTransactions, { itemsPerPage: 10 }));

    act(() => result.current.onFiltersChange("method", ["POST"]));
    act(() => result.current.onSearchChange("nothing"));
    act(() => result.current.onResetFilters());

    expect(result.current.filters).toEqual({});
    expect(result.current.search).toBe("");
    expect(result.current.page).toBe(1);
    expect(result.current.total).toBe(25);
  });

  it("returns to the first page when a facet selection changes", () => {
    const { result } = renderHook(() => useClientSideTransactions(manyTransactions, { itemsPerPage: 10 }));

    act(() => result.current.onPageChange(3));
    act(() => result.current.onFiltersChange("endpoint", ["/api/users"]));

    expect(result.current.page).toBe(1);
    expect(result.current.transactions).toHaveLength(10);
  });

  it("clamps the page when the list shrinks underneath it", () => {
    const { result, rerender } = renderHook(({ items }) => useClientSideTransactions(items, { itemsPerPage: 10 }), {
      initialProps: { items: manyTransactions },
    });

    act(() => result.current.onPageChange(3));
    rerender({ items: manyTransactions.slice(0, 5) });

    expect(result.current.page).toBe(1);
    expect(result.current.transactions).toHaveLength(5);
  });

  it("remembers the page it was asked for when the list grows back", () => {
    const { result, rerender } = renderHook(({ items }) => useClientSideTransactions(items, { itemsPerPage: 10 }), {
      initialProps: { items: manyTransactions },
    });

    act(() => result.current.onPageChange(3));
    rerender({ items: manyTransactions.slice(0, 5) });
    rerender({ items: manyTransactions });

    expect(result.current.page).toBe(3);
  });

  describe("a page it should never be asked for", () => {
    // These come from a URL: an absent param reads as 0, a malformed one as NaN, and a negative
    // page used to slice from the end of the list and render a window from the middle.
    it.each([0, -1, Number.NaN])("shows the first page rather than a window from nowhere: %s", (page) => {
      const { result } = renderHook(() => useClientSideTransactions(manyTransactions, { itemsPerPage: 10 }));

      act(() => result.current.onPageChange(page));

      expect(result.current.page).toBe(1);
      expect(ids(result.current.transactions)).toEqual(manyTransactions.slice(0, 10).map((item) => item.id));
    });
  });

  it("reports one empty page rather than none when nothing matches", () => {
    const { result } = renderHook(() => useClientSideTransactions(manyTransactions, { itemsPerPage: 10 }));

    act(() => result.current.onSearchChange("no-such-endpoint"));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.pageCount).toBe(1);
  });

  it("starts from the filters it is given, so a consumer can restore a view", () => {
    const transactions = [transaction("a", { method: "GET" }), transaction("b", { method: "POST" })];
    const { result } = renderHook(() =>
      useClientSideTransactions(transactions, { initialFilters: { method: ["POST"] }, initialSearch: "" }),
    );

    expect(ids(result.current.transactions)).toEqual(["b"]);
  });
});
