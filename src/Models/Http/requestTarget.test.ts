import { describe, expect, it } from "vitest";
import { splitRequestTarget } from "./requestTarget";

describe("splitRequestTarget", () => {
  it.each([
    ["/api/users", "/api/users", ""],
    ["/api/users?page=2&q=a?b", "/api/users", "?page=2&q=a?b"],
    ["/api/users?", "/api/users", "?"],
    ["?only=query", "", "?only=query"],
    ["", "", ""],
    ["//[x", "//[x", ""],
    ["http://[::1", "http://[::1", ""],
    ["//a b/", "//a b/", ""],
    ["/static/../../etc/passwd", "/static/../../etc/passwd", ""],
    ["http://other-host/x?y=1", "http://other-host/x", "?y=1"],
  ])("splits %j into path %j and query %j without normalising", (raw, path, query) => {
    expect(splitRequestTarget(raw)).toEqual({ path, query });
  });
});
