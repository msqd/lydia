#!/usr/bin/env node
/**
 * Installs the packed tarball into a fresh Vite + React 19 + Tailwind 4 app and checks what a
 * consumer gets: the declarations type-check, a lydia component renders, its classes and theme
 * land in the CSS, the install holds a single React, every JS export imports under plain Node ESM
 * (the build tree's own node_modules is not reachable from the temporary directory), and the root
 * entry and every chart render under vitest + jsdom and under Node ESM (SSR), and the README examples
 * compile against the declarations with `skipLibCheck` off.
 *
 * Needs a built dist/. Run from the repository root: node test/consumer/check.mjs
 */

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const fixture = dirname(fileURLToPath(import.meta.url));
const root = join(fixture, "..", "..");
const work = mkdtempSync(join(tmpdir(), "lydia-consumer-"));
const app = join(work, "app");

const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });

/**
 * Writes the README's code examples into the fixture so tsc checks them: a `jsx` block is one program,
 * a `js` block is a list of independent import snippets separated by blank lines. Side-effect CSS
 * imports are dropped: typing an asset import is the bundler's job, not the package's.
 */
const writeReadmeExamples = (outDir) => {
  mkdirSync(outDir, { recursive: true });
  const readme = readFileSync(join(root, "README.md"), "utf-8");
  const examples = [...readme.matchAll(/^```(jsx|js)\n([\s\S]*?)^```/gm)].flatMap(([, lang, code]) =>
    lang === "jsx" ? [code] : code.split(/\n\s*\n/),
  );
  examples.forEach((code, index) => {
    const source = code.replace(/^import\s+["'][^"']*(?:\.css|\/styles)["'];?.*$/gm, "");
    writeFileSync(join(outDir, `example-${index}.tsx`), `${source}\nexport {};\n`);
  });
  assert.ok(examples.length >= 4, "the README holds code examples");
};

try {
  run("pnpm", ["pack", "--pack-destination", work], root);
  const tarball = readdirSync(work).find((file) => file.endsWith(".tgz"));
  assert.ok(tarball, "pnpm pack produced no tarball");

  cpSync(fixture, app, { recursive: true, filter: (path) => !/node_modules|check\.mjs$/.test(path) });
  run("pnpm", ["install"], app);
  run("pnpm", ["add", join(work, tarball)], app);

  const installed = join(app, "node_modules", "@msqd", "lydia");
  const exportTargets = Object.entries(JSON.parse(readFileSync(join(installed, "package.json"), "utf-8")).exports)
    .map(([key, entry]) => [key, entry.import])
    .filter(([, target]) => target?.endsWith(".js"))
    .map(([key]) => join("@msqd/lydia", key));
  assert.ok(exportTargets.length > 100, "the package exports its JS entries");

  // A build-machine path still resolves on this machine, so it has to be caught by what it looks like.
  const absoluteImports = readdirSync(join(installed, "dist"), { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .filter((file) => /^(?:import|export)\b[^;"']*?["']\//m.test(readFileSync(join(installed, "dist", file), "utf-8")));
  assert.deepEqual(absoluteImports, [], "no packed file imports an absolute path");

  run(
    "node",
    [
      "--input-type=module",
      "-e",
      `const failures = [];
       for (const entry of ${JSON.stringify(exportTargets)}) {
         try { await import(entry); } catch (error) { failures.push(entry + ": " + error.message.split("\\n")[0]); }
       }
       if (failures.length) { console.error(failures.join("\\n")); process.exit(1); }`,
    ],
    app,
  );

  writeReadmeExamples(join(app, "src", "readme"));
  run("pnpm", ["exec", "vitest", "run"], app);
  run("pnpm", ["exec", "tsc"], app);
  run("pnpm", ["exec", "vite", "build"], app);
  run("pnpm", ["exec", "vite", "build", "--ssr", "src/ssr.tsx", "--outDir", "dist-ssr"], app);

  const { html, chartHtml } = await import(pathToFileURL(join(app, "dist-ssr", "ssr.js")).href);
  assert.match(html, /Healthy/);
  assert.match(html, /bg-success-50/);
  for (const name of ["TransactionsChart", "SummaryRateChart", "SummaryPerformancesChart"]) {
    assert.match(chartHtml[name], /<div/, `${name} renders under Node ESM`);
  }

  const assets = join(app, "dist", "assets");
  const css = readFileSync(join(assets, readdirSync(assets).find((file) => file.endsWith(".css"))), "utf-8");
  assert.match(css, /\.bg-success-50/, "lydia's classes are scanned from its dist");
  assert.match(css, /--color-success-50:/, "lydia's theme is applied");
  assert.match(css, /\.range-slider-input/, "lydia's component styles are included");
  assert.equal(css.match(/tailwindcss v\d/g)?.length, 1, "one Tailwind in the output");

  const reactCopies = readdirSync(join(app, "node_modules", ".pnpm")).filter((dir) => /^react@/.test(dir));
  assert.equal(reactCopies.length, 1, `one React copy, found ${reactCopies}`);

  const precompiled = join(app, "node_modules", "@msqd", "lydia", "dist", "styles", "styles.css");
  assert.ok(existsSync(precompiled), "the precompiled stylesheet is packed");
  console.log("Consumer check passed");
} finally {
  rmSync(work, { recursive: true, force: true });
}
