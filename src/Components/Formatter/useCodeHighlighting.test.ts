import { renderHook } from "@testing-library/react";
import { refractor } from "refractor/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCodeHighlighting } from "./useCodeHighlighting";

describe("useCodeHighlighting", () => {
  afterEach(() => vi.restoreAllMocks());

  it("splits the content into lines", () => {
    const { result } = renderHook(() => useCodeHighlighting("a\nb\nc", "text"));
    expect(result.current.lines).toEqual(["a", "b", "c"]);
  });

  it("indents JSON before splitting", () => {
    const { result } = renderHook(() => useCodeHighlighting('{"a":1}', "json"));
    expect(result.current.lines).toEqual(["{", '  "a": 1', "}"]);
  });

  it("keeps invalid JSON as is", () => {
    const { result } = renderHook(() => useCodeHighlighting('{"a":1,}', "json"));
    expect(result.current.lines).toEqual(['{"a":1,}']);
  });

  it("splits once per content change, not per render", () => {
    const { result, rerender } = renderHook(({ code }) => useCodeHighlighting(code, "text"), {
      initialProps: { code: "a\nb" },
    });
    const first = result.current.lines;

    rerender({ code: "a\nb" });
    expect(result.current.lines).toBe(first);

    rerender({ code: "a\nb\nc" });
    expect(result.current.lines).toEqual(["a", "b", "c"]);
  });

  it("highlights a line into tokens", () => {
    const { result } = renderHook(() => useCodeHighlighting("const x = 5;", "javascript"));
    const tree = result.current.highlightLine("const x = 5;");
    expect(tree?.children.some((node) => node.type === "element")).toBe(true);
  });

  it("does not highlight text", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    const { result } = renderHook(() => useCodeHighlighting("hello", "text"));

    expect(result.current.highlightLine("hello")).toBeNull();
    expect(highlight).not.toHaveBeenCalled();
  });

  it("highlights a given line once", () => {
    const highlight = vi.spyOn(refractor, "highlight");
    const { result } = renderHook(() => useCodeHighlighting("1\n1", "json"));

    result.current.highlightLine("1");
    result.current.highlightLine("1");
    expect(highlight).toHaveBeenCalledTimes(1);
  });
});
