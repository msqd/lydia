import { LINEAR_GROWTH_LIMIT, growthRatio } from "@/linearTime.test-utils";
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

  const hostileHeaders = {
    "repeated name without a value": (size: number) => `attachment; ${"filename".repeat(size / 7)}`,
    "repeated quote and escape": (size: number) => `attachment; filename="${'\\"'.repeat(size / 2)}`,
    "repeated separators": (size: number) => `attachment${"; filename".repeat(size / 10)}`,
  };

  it.each(Object.entries(hostileHeaders))("parses a hostile header in linear time (%s)", (_, build) => {
    const ratio = growthRatio((size) => contentDispositionFilename(build(size)), 10_000, 100_000);
    expect(ratio).toBeLessThan(LINEAR_GROWTH_LIMIT);
  });
});
