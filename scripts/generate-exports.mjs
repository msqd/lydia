#!/usr/bin/env node
/**
 * Generates package.json exports field from dist folder structure.
 * Run after build: node scripts/generate-exports.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { basename, dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const PACKAGE_JSON = join(ROOT, "package.json");

// Folders to include in exports (relative to dist)
const INCLUDE_FOLDERS = ["Components", "Elements", "Pages", "Models", "Services", "Config", "Hooks"];

// Files/patterns to exclude from exports
const EXCLUDE_PATTERNS = [
  /\.stories\./,
  /\.test\./,
  /\.samples\./,
  /Testing\./,
  /__snapshots__/,
  /\.css\.js$/,
  /\.svg\.js$/,
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function findJsFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findJsFiles(fullPath, files);
    } else if (entry.endsWith(".js") && !shouldExclude(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

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

  // Find all JS files in included folders
  const allJsFiles = [];
  for (const folder of INCLUDE_FOLDERS) {
    const folderPath = join(DIST, folder);
    findJsFiles(folderPath, allJsFiles);
  }

  // Generate export entries
  for (const jsFile of allJsFiles) {
    const relativePath = relative(DIST, jsFile);
    const withoutExt = relativePath.replace(/\.js$/, "");

    // Check if corresponding .d.ts exists
    const dtsPath = jsFile.replace(/\.js$/, ".d.ts");
    if (!existsSync(dtsPath)) continue;

    const exportEntry = {
      types: `./dist/${withoutExt}.d.ts`,
      import: `./dist/${withoutExt}.js`,
    };

    if (basename(jsFile) === "index.js") {
      // For index.js files, only export the folder path (not folder/index)
      const folderExport = `./${dirname(relativePath)}`;
      if (folderExport !== "./") {
        exports[folderExport] = exportEntry;
      }
    } else {
      // For named files, export with full path
      const exportPath = `./${withoutExt}`;
      exports[exportPath] = exportEntry;
    }
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
