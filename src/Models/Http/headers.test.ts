import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, resolve } from "path";
import { describe, expect, it } from "vitest";
import { type HttpHeader, findHeader } from "./headers";

const headers: HttpHeader[] = [
  { name: "Content-Type", value: "application/pdf" },
  { name: "set-cookie", value: "session=abc" },
  { name: "Set-Cookie", value: "theme=dark" },
  { name: "Content-Length", value: "2048" },
];

describe("findHeader", () => {
  it("finds a header by exact name", () => {
    expect(findHeader(headers, "Content-Length")).toBe("2048");
  });

  it("matches case-insensitively, as HTTP names are", () => {
    expect(findHeader(headers, "content-type")).toBe("application/pdf");
    expect(findHeader(headers, "CONTENT-TYPE")).toBe("application/pdf");
  });

  it("returns the first occurrence when a name repeats", () => {
    expect(findHeader(headers, "Set-Cookie")).toBe("session=abc");
  });

  it("returns undefined when the header is absent", () => {
    expect(findHeader(headers, "Authorization")).toBeUndefined();
  });

  it("returns undefined for no headers at all", () => {
    expect(findHeader([], "Content-Type")).toBeUndefined();
    expect(findHeader(undefined, "Content-Type")).toBeUndefined();
  });
});

const srcPath = resolve(__dirname, "../..");

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "__snapshots__") continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      sourceFiles(fullPath, found);
    } else if (/\.tsx?$/.test(entry) && !/\.(test|stories)\.tsx?$/.test(entry)) {
      found.push(fullPath);
    }
  }
  return found;
}

/** A `headers` property typed as a map: `Record<string, ...>` or a bare index signature. */
const HEADERS_AS_MAP = /\bheaders\??\s*:\s*(Record<\s*string|\{\s*\[\s*\w+\s*:\s*string\s*\])/;

/**
 * The rule #50, #76 and #79 established, in one place so it cannot be reopened quietly.
 *
 * HTTP allows a header name to repeat, and `set-cookie` routinely does. A map collapses those
 * repeats and loses arrival order, so a type that models headers as a map cannot represent a real
 * response. Lookup by name is a different question and belongs in `findHeader`, which normalises
 * case precisely because it is answering about meaning rather than recording what arrived.
 */
describe("header modelling", () => {
  it("models headers as a sequence everywhere, never as a map", () => {
    const offenders = sourceFiles(srcPath)
      .filter((file) => HEADERS_AS_MAP.test(readFileSync(file, "utf-8")))
      .map((file) => relative(srcPath, file));

    expect(offenders).toEqual([]);
  });
});
