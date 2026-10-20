#!/usr/bin/env node
/**
 * Copies the CSS sources a consumer's own Tailwind 4 build needs into dist/css/, keeping the
 * layout under src/ so the relative `@import` and `@reference` paths between them stay valid.
 * Run after build: node scripts/copy-css-sources.mjs
 */

import { copyFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist", "css");

const ENTRIES = ["theme.css", "components.css"];

function* importedFiles(file) {
  for (const [, path] of readFileSync(join(SRC, file), "utf-8").matchAll(/@import\s+["'](\.[^"']+)["']/g)) {
    yield resolve(dirname(join(SRC, file)), path).slice(SRC.length + 1);
  }
}

for (const file of new Set([...ENTRIES, ...ENTRIES.flatMap((entry) => [...importedFiles(entry)])])) {
  mkdirSync(dirname(join(OUT, file)), { recursive: true });
  copyFileSync(join(SRC, file), join(OUT, file));
}
console.log(`Copied CSS sources to dist/css`);
