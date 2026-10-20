#!/usr/bin/env node
/**
 * tsc keeps side-effect imports such as `import "./Input.css"` in the declarations it emits, while the
 * bundled JS has none. A consumer without bundler types (`vite/client`) then fails with TS2882 on them.
 * Run after tsc: node scripts/strip-css-imports-from-declarations.mjs
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const CSS_IMPORT = /^import\s+["'][^"']+\.css["'];?\r?\n/gm;

let stripped = 0;
for (const file of readdirSync(DIST, { recursive: true }).filter((file) => file.endsWith(".d.ts"))) {
  const path = join(DIST, file);
  const source = readFileSync(path, "utf-8");
  const cleaned = source.replace(CSS_IMPORT, "");
  if (cleaned !== source) {
    writeFileSync(path, cleaned);
    stripped++;
  }
}
console.log(`Stripped CSS imports from ${stripped} declarations`);
