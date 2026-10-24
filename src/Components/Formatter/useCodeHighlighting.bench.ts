import { renderHook } from "@testing-library/react";
import { bench, describe } from "vitest";
import { useCodeHighlighting } from "./useCodeHighlighting";

const oneLineHtml = (size: number) => `<div class="row"><a href="/p/1">link</a></div>`.repeat(Math.ceil(size / 42));

/** Cost of opening a one-line HTML body: past the highlight cap it must stay flat. */
describe("useCodeHighlighting, one-line HTML", () => {
  for (const [label, size] of [
    ["1 MB", 1024 * 1024],
    ["5 MB", 5 * 1024 * 1024],
  ] as const) {
    const body = oneLineHtml(size);
    bench(label, () => {
      const { result, unmount } = renderHook(() => useCodeHighlighting(body, "html"));
      for (const line of result.current.lines) result.current.highlightLine(line);
      unmount();
    });
  }
});
