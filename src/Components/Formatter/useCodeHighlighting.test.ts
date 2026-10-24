import { renderHook } from "@testing-library/react";
import { refractor } from "refractor/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FORMAT_CAP, HIGHLIGHT_CAP } from "./bodyLimits";
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

  describe("size caps", () => {
    const oneLine = (size: number) => `<p>${"x".repeat(size - 7)}</p>`;

    it("never highlights a one-line body above the highlight cap", () => {
      const highlight = vi.spyOn(refractor, "highlight");
      const body = oneLine(FORMAT_CAP);
      const { result } = renderHook(() => useCodeHighlighting(body, "html"));

      expect(result.current.tooLargeToHighlight).toBe(true);
      expect(result.current.highlightLine(body)).toBeNull();
      expect(highlight).not.toHaveBeenCalled();
    });

    it("highlights a one-line body at the highlight cap", () => {
      const body = oneLine(HIGHLIGHT_CAP);
      const { result } = renderHook(() => useCodeHighlighting(body, "html"));

      expect(result.current.tooLargeToHighlight).toBe(false);
      expect(result.current.highlightLine(body)).not.toBeNull();
    });

    it("does not call a text body too large to highlight", () => {
      const { result } = renderHook(() => useCodeHighlighting("x".repeat(HIGHLIGHT_CAP + 1), "text"));
      expect(result.current.tooLargeToHighlight).toBe(false);
    });

    it("reformats JSON up to the formatting cap and keeps it as is above", () => {
      const parse = vi.spyOn(JSON, "parse");
      const pad = (size: number) => `{"a":"${"x".repeat(size - 8)}"}`;

      const atCap = renderHook(() => useCodeHighlighting(pad(FORMAT_CAP), "json"));
      expect(atCap.result.current.lines).toHaveLength(3);

      parse.mockClear();
      const above = pad(FORMAT_CAP + 1);
      const over = renderHook(() => useCodeHighlighting(above, "json"));
      expect(over.result.current.lines).toEqual([above]);
      expect(parse).not.toHaveBeenCalled();
    });

    it("paints plain text first, then the tokens", () => {
      const renders: boolean[] = [];
      renderHook(() => {
        const { highlightLine } = useCodeHighlighting("const x = 5;", "javascript");
        renders.push(highlightLine("const x = 5;") !== null);
      });
      expect(renders[0]).toBe(false);
      expect(renders[renders.length - 1]).toBe(true);
    });
  });
});
