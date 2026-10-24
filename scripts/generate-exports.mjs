#!/usr/bin/env node
/**
 * Generates package.json exports field from dist folder structure.
 * Run after build: node scripts/generate-exports.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PACKAGE_JSON = join(ROOT, "package.json");

// The public surface: folder barrels and the root entry. Nothing else under dist/ is exported.
const PUBLIC_EXPORTS = join(__dirname, "public-exports.json");

function generateExports() {
  const exports = {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    },
    "./styles": "./dist/styles/styles.css",
    "./theme.css": "./dist/css/theme.css",
    "./components.css": "./dist/css/components.css",
    "./package.json": "./package.json",
  };

  for (const barrel of JSON.parse(readFileSync(PUBLIC_EXPORTS, "utf-8")).barrels) {
    const entry = `./dist/${barrel}/index`;
    if (!existsSync(join(ROOT, `${entry}.js`)) || !existsSync(join(ROOT, `${entry}.d.ts`))) {
      throw new Error(`${PUBLIC_EXPORTS} lists "${barrel}", which has no built index.js and index.d.ts`);
    }
    exports[`./${barrel}`] = { types: `${entry}.d.ts`, import: `${entry}.js` };
  }

  return exports;
}

function main() {
  console.log("Generating exports from dist folder...");

  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8"));
  const newExports = generateExports();

  const exportCount = Object.keys(newExports).length;
  console.log(`Generated ${exportCount} export entries`);

  pkg.exports = newExports;

  // Write with sorted keys for consistency
  const sortedExports = Object.fromEntries(
    Object.entries(newExports).sort(([a], [b]) => {
      // Root export first
      if (a === ".") return -1;
      if (b === ".") return 1;
      // Styles second
      if (a === "./styles") return -1;
      if (b === "./styles") return 1;
      // Then alphabetically
      return a.localeCompare(b);
    }),
  );
  pkg.exports = sortedExports;

  // Written only when it changes: a rewrite with identical bytes still moves the mtime, and a
  // repository vendoring lydia as a submodule then sees a stale stat that aborts its checkout.
  const next = JSON.stringify(pkg, null, 2) + "\n";
  if (next === readFileSync(PACKAGE_JSON, "utf-8")) {
    console.log("package.json exports already up to date");
    return;
  }
  writeFileSync(PACKAGE_JSON, next);
  console.log("Updated package.json exports");
}

main();
