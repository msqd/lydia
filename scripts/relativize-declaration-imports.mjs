#!/usr/bin/env node
/**
 * tsc keeps path aliases (`@msqd/lydia/...`) verbatim in the declarations it emits and leaves relative
 * specifiers extensionless. The first resolves only while the target stays in `package.json#exports`, the
 * second fails under `moduleResolution: "nodenext"` (TS2834). Rewrite both to relative specifiers ending
 * in `.js`, which resolve under every mode without the exports map.
 * Run after tsc: node scripts/relativize-declaration-imports.mjs
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { dirname, join, posix, resolve } from "path";
import { fileURLToPath } from "url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const ALIAS = /^@msqd\/lydia(?:\/(.*))?$/;
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\2/g;

/** Path of the declaration a specifier targets, relative to dist, without extension. */
const targetOf = (specifier, fromDir) => {
  const alias = ALIAS.exec(specifier);
  if (alias) return alias[1] ?? "index";
  if (specifier.startsWith(".")) return posix.normalize(posix.join(fromDir, specifier));
  return null;
};

const withExtension = (target) => {
  if (existsSync(resolve(DIST, `${target}.d.ts`))) return target;
  if (existsSync(resolve(DIST, target, "index.d.ts"))) return `${target}/index`;
  throw new Error(`no declaration in dist for "${target}"`);
};

let rewritten = 0;
for (const file of readdirSync(DIST, { recursive: true }).filter((file) => file.endsWith(".d.ts"))) {
  const path = join(DIST, file);
  const fromDir = dirname(file).split("\\").join("/");
  const source = readFileSync(path, "utf-8");
  const result = source.replace(SPECIFIER, (match, prefix, quote, specifier) => {
    if (specifier.endsWith(".js")) return match;
    const target = targetOf(specifier, fromDir);
    if (target === null) return match;
    let local = posix.relative(fromDir, withExtension(target));
    if (!local.startsWith(".")) local = `./${local}`;
    return `${prefix}${quote}${local}.js${quote}`;
  });
  if (result !== source) {
    writeFileSync(path, result);
    rewritten++;
  }
}
console.log(`Rewrote import specifiers in ${rewritten} declarations`);
