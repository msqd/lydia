import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourcesIn = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourcesIn(path);
    return /\.tsx?$/.test(entry) && !/\.(test|stories)\./.test(entry) ? [path] : [];
  });

/** Static, side-effect and dynamic imports, in either quote style. */
const importsHigherLayer = (source: string) =>
  /\b(?:from|import)\s*\(?\s*["'][^"']*\/(?:Components|Elements|Pages)\//.test(source);

describe("importsHigherLayer", () => {
  it.each([
    'import { A } from "@msqd/lydia/Components/Badges";',
    "import { A } from '@msqd/lydia/Elements/Http';",
    'import "@msqd/lydia/Components/Buttons/Button";',
    "import '../../Pages/Alerts';",
    'const m = await import("@msqd/lydia/Components/Badges");',
    'export * from "@msqd/lydia/Pages/Alerts";',
  ])("catches %s", (source) => {
    expect(importsHigherLayer(source)).toBe(true);
  });

  it("lets a Models import through", () => {
    expect(importsHigherLayer('import type { A } from "@msqd/lydia/Models/Http/body";')).toBe(false);
  });
});

describe("Models layer", () => {
  it.each(sourcesIn(__dirname))("%s imports nothing from a higher layer", (path) => {
    expect(importsHigherLayer(readFileSync(path, "utf8"))).toBe(false);
  });
});
