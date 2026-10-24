import { describe, expect, it } from "vitest";
import { UNKNOWN_API, apiOf, isUnder, segmentsOf } from "./endpoints";
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
  apiName: "users-api",
  ...overrides,
});

describe("apiOf", () => {
  it.each([
    ["a named API", "users-api", "users-api"],
    ["no name", undefined, UNKNOWN_API],
    ["an empty name", "", UNKNOWN_API],
  ])("%s", (_label, apiName, expected) => {
    expect(apiOf(transaction({ apiName }))).toBe(expected);
  });
});

describe("segmentsOf", () => {
  it.each([
    ["a path", "/api/users", ["api", "users"]],
    ["a query string", "/api/analytics/report?period=daily", ["api", "analytics", "report"]],
    ["a full URL, without scheme or host", "https://host/api/x", ["api", "x"]],
    ["a full URL with a port and a query", "http://host:8080/api/x?a=/b", ["api", "x"]],
    ["a bare host", "https://host", []],
    ["the root", "/", []],
    ["repeated slashes", "/api//x/", ["api", "x"]],
    ["a malformed URL", "//[x", ["[x"]],
  ])("%s", (_label, url, expected) => {
    expect(segmentsOf(transaction({ url }))).toEqual(expected);
  });
});

describe("isUnder", () => {
  const user = transaction({ id: "a", url: "/api/user" });
  const users = transaction({ id: "b", url: "/api/users/1" });
  const unnamed = transaction({ id: "c", url: "/api/x?y=1", apiName: undefined });
  const selection = (apiName: string, segments: string[]) => ({ type: "folder" as const, apiName, segments });

  it.each([
    ["the API itself", user, selection("users-api", []), true],
    ["another API", user, selection("other-api", []), false],
    ["a path prefix", users, selection("users-api", ["api"]), true],
    ["the exact path", user, selection("users-api", ["api", "user"]), true],
    ["a longer sibling name", users, selection("users-api", ["api", "user"]), false],
    ["a deeper selection", user, selection("users-api", ["api", "user", "1"]), false],
    ["the unknown API", unnamed, selection(UNKNOWN_API, []), true],
    ["under the unknown API", unnamed, selection(UNKNOWN_API, ["api", "x"]), true],
  ])("%s", (_label, t, sel, expected) => {
    expect(isUnder(t, sel)).toBe(expected);
  });
});
