import { describe, expect, it } from "vitest";
import { contentDispositionFilename } from "./contentDisposition";

describe("contentDispositionFilename", () => {
  it.each([
    ['attachment; filename="report.pdf"', "report.pdf"],
    ["attachment; filename=report.pdf", "report.pdf"],
    ["attachment; FILENAME = report.pdf ; size=3", "report.pdf"],
    ['attachment; filename="semi;colon.txt"; size=3', "semi;colon.txt"],
    ['attachment; filename="a\\"b.exe"', 'a"b.exe'],
    ["attachment; filename*=UTF-8''%E2%82%AC%20rates.html", "€ rates.html"],
    ["attachment; filename*=iso-8859-1'en'%A3%20rates", "£ rates"],
    ["attachment; filename=\"fallback.txt\"; filename*=UTF-8''%E2%82%AC.txt", "€.txt"],
    ["attachment; filename*=UTF-8''%E2%82%AC.txt; filename=\"fallback.txt\"", "€.txt"],
    ["attachment; filename*=UTF-8''%E2%82; filename=fallback.txt", "fallback.txt"],
    ["attachment; filename*=KOI8-R''%C1; filename=fallback.txt", "fallback.txt"],
    ['attachment; filename="../../etc/passwd"', "....etcpasswd"],
    ['attachment; filename="C:\\dir\\a.txt"', "C:dira.txt"],
    ['attachment; filename="a\u0000b\nc.txt"', "abc.txt"],
  ])("parses %j", (header, expected) => {
    expect(contentDispositionFilename(header)).toBe(expected);
  });

  it.each([[""], ["attachment"], ["inline; size=3"], ['attachment; filename=""'], ["attachment; filename=/"]])(
    "returns undefined for %j",
    (header) => {
      expect(contentDispositionFilename(header)).toBeUndefined();
    },
  );

  it("caps the result at 255 characters", () => {
    expect(contentDispositionFilename(`attachment; filename="${"a".repeat(1000)}"`)).toHaveLength(255);
  });

  it.each([
    ["repeated name without a value", `attachment; ${"filename".repeat(15_000)}`],
    ["repeated quote and escape", `attachment; filename="${'\\"'.repeat(50_000)}`],
    ["repeated separators", `attachment${"; filename".repeat(10_000)}`],
  ])("parses a 100 KB hostile header in linear time (%s)", (_, header) => {
    const start = performance.now();
    contentDispositionFilename(header);
    expect(performance.now() - start).toBeLessThan(50);
  });
});
