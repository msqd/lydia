#!/usr/bin/env node
/**
 * Copies the CSS a consumer's own Tailwind 4 build needs into dist/css/, keeping the layout under
 * src/ so the relative `@import` and `url()` paths between the files stay valid: the stylesheets,
 * the fonts they load and the font licence.
 *
 * Tailwind resolves an `@source` from the stylesheet that holds it, imported ones included, so the
 * copy of `components.css` points at the compiled components next to it and a consumer writes none.
 * Run after build: node scripts/copy-css-sources.mjs
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist", "css");

const ENTRIES = ["theme.css", "components.css"];
const LICENCES = ["fonts/OFL.txt"];

/** Compiled JavaScript only: dist also holds declarations, fonts and a stylesheet full of class-like text. */
const COMPILED_COMPONENTS = `@source "../**/*.js";\n`;

function* referencedFiles(file) {
  const references = readFileSync(join(SRC, file), "utf-8").matchAll(/(?:@import\s+|url\()["'](\.[^"']+)["']/g);
  for (const [, path] of references) {
    yield resolve(dirname(join(SRC, file)), path).slice(SRC.length + 1);
  }
}

function* withReferences(file) {
  yield file;
  if (file.endsWith(".css")) {
    for (const reference of referencedFiles(file)) yield* withReferences(reference);
  }
}

for (const file of new Set([...ENTRIES, ...LICENCES].flatMap((entry) => [...withReferences(entry)]))) {
  mkdirSync(dirname(join(OUT, file)), { recursive: true });
  copyFileSync(join(SRC, file), join(OUT, file));
}

const components = join(OUT, "components.css");
writeFileSync(components, `${readFileSync(components, "utf-8")}\n${COMPILED_COMPONENTS}`);
console.log(`Copied CSS sources to dist/css`);
