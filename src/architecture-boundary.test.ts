import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Presentation boundary guard.
 *
 * Lydia is a pure presentation library: its components render from their props and hold no
 * data-fetching or application logic. The data layer — HTTP services, query/cache wiring,
 * routing — lives in the consuming application, never here. If a component needs remote data,
 * it takes it as a prop; the consumer fetches and passes it in.
 *
 * This guard scans the whole shipped source tree and fails the build if a logic import or an
 * HTTP call reappears, so the boundary cannot silently rot back.
 */

/** Import specifiers / calls that mark data or application logic, forbidden anywhere in the library. */
const FORBIDDEN = [
  { pattern: /@tanstack\/react-query/, why: "data fetching (react-query) — pass data via props instead" },
  { pattern: /from\s+["'][^"']*Services[/"']/, why: "imports a data layer (Services/*)" },
  { pattern: /\bfetch\s*\(/, why: "performs an HTTP call — data must come from props" },
];

const srcRoot = resolve(__dirname);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
      continue;
    }
    // Only shipped source: skip tests (incl. this guard) and stories (dev-only artifacts).
    if (/\.(test|stories)\.[cm]?tsx?$/.test(entry)) continue;
    if (/\.[cm]?tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

describe("presentation boundary", () => {
  it("the library source holds no data or application logic", () => {
    const violations: string[] = [];
    for (const file of sourceFiles(srcRoot)) {
      const code = readFileSync(file, "utf8");
      for (const { pattern, why } of FORBIDDEN) {
        if (pattern.test(code)) {
          violations.push(`${file.slice(srcRoot.length + 1)}: ${why}`);
        }
      }
    }
    expect(violations, `presentation layer must stay logic-free:\n${violations.join("\n")}`).toEqual([]);
  });
});
