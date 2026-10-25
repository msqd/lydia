#!/usr/bin/env node
/**
 * Installs the packed tarball into a fresh Vite + React 19 + Tailwind 4 app and checks what a
 * consumer gets: the declarations type-check, a lydia component renders, its classes and theme
 * land in the CSS, the install holds a single React, Headless UI and ECharts, every JS export imports under plain Node ESM
 * (the build tree's own node_modules is not reachable from the temporary directory), and the root
 * entry and every chart render under vitest + jsdom and under Node ESM (SSR), and the README examples
 * compile against the declarations with `skipLibCheck` off, under `bundler` and `nodenext` resolution.
 * The declarations import each other by relative `.js` specifiers that resolve inside dist.
 *
 * Needs a built dist/. Run from the repository root: node test/consumer/check.mjs
 *
 * The install is frozen on test/consumer/pnpm-lock.yaml, so only the lockfile's versions are tested; the
 * packed tarball is the one entry that changes, installed from a fixed `file:` path whose integrity line is
 * regenerated here. Modes, all unlocked except the default:
 * - LYDIA_REGISTRY_VERSION=<version>: installs that version from the npm registry instead of packing.
 * - LYDIA_CONSUMER_LATEST=1: resolves the fixture's newest ranges (the weekly run).
 * - LYDIA_CONSUMER_UPDATE_LOCK=1: same, then writes the resulting lockfile back to test/consumer.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const fixture = dirname(fileURLToPath(import.meta.url));
const root = join(fixture, "..", "..");
const work = mkdtempSync(join(tmpdir(), "lydia-consumer-"));
const app = join(work, "app");

const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });

// The fixture depends on the packed tarball through this fixed path, so its lockfile entry never moves.
const tarballName = "lydia.tgz";

const setLydiaSpec = (spec) => {
  const manifestPath = join(app, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  manifest.dependencies["@msqd/lydia"] = spec;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

/**
 * Points the committed lockfile at the freshly packed tarball: pnpm records the tarball's integrity, which
 * changes with every pack, and its version, which changes with every release. The lockfile also lists the
 * tarball's own dependencies, which a frozen install does not re-read from the tarball, so a mismatch fails
 * here rather than testing stale versions.
 */
const pinTarball = (tarballPath, lockPath) => {
  const integrity = `sha512-${createHash("sha512").update(readFileSync(tarballPath)).digest("base64")}`;
  const packed = JSON.parse(execFileSync("tar", ["-xzOf", tarballPath, "package/package.json"], { encoding: "utf-8" }));
  const entry = /('@msqd\/lydia@file:[^']*':\n\s+resolution: \{integrity: )sha512-[^,}]+(.*\n\s+version: ).+/;
  const initial = readFileSync(lockPath, "utf-8");
  assert.match(initial, entry, "the fixture lockfile has an entry for the packed tarball");
  const lock = initial.replace(entry, `$1${integrity}$2${packed.version}`);
  writeFileSync(lockPath, lock);

  const snapshot = lock.match(/^ {2}'@msqd\/lydia@file:[^']*\(.*\)':\n {4}dependencies:\n((?: {6}.+\n)+)/m)?.[1] ?? "";
  const locked = snapshot.split("\n").filter(Boolean).map((line) => line.trim().replace(/^'?([^':]+)'?:.*$/, "$1"));
  assert.deepEqual(
    locked.sort(),
    Object.keys({ ...packed.dependencies, ...packed.peerDependencies }).sort(),
    "the lockfile lists the dependencies of the packed package: regenerate it with LYDIA_CONSUMER_UPDATE_LOCK=1",
  );
};

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
  const registryVersion = process.env.LYDIA_REGISTRY_VERSION;
  const updateLock = Boolean(process.env.LYDIA_CONSUMER_UPDATE_LOCK);
  const locked = !registryVersion && !updateLock && !process.env.LYDIA_CONSUMER_LATEST;
  const tarballPath = join(app, tarballName);

  cpSync(fixture, app, { recursive: true, filter: (path) => !/node_modules|check\.mjs$/.test(path) });
  if (registryVersion) {
    setLydiaSpec(registryVersion);
  } else {
    run("pnpm", ["pack", "--pack-destination", work], root);
    const tarball = readdirSync(work).find((file) => file.endsWith(".tgz"));
    assert.ok(tarball, "pnpm pack produced no tarball");
    copyFileSync(join(work, tarball), tarballPath);
  }

  if (locked) {
    pinTarball(tarballPath, join(app, "pnpm-lock.yaml"));
    run("pnpm", ["install", "--frozen-lockfile"], app);
  } else {
    rmSync(join(app, "pnpm-lock.yaml"), { force: true });
    run("pnpm", ["install"], app);
    if (updateLock) copyFileSync(join(app, "pnpm-lock.yaml"), join(fixture, "pnpm-lock.yaml"));
  }

  const installed = join(app, "node_modules", "@msqd", "lydia");
  const exportTargets = Object.entries(JSON.parse(readFileSync(join(installed, "package.json"), "utf-8")).exports)
    .map(([key, entry]) => [key, entry.import])
    .filter(([, target]) => target?.endsWith(".js"))
    .map(([key]) => join("@msqd/lydia", key));
  const { barrels } = JSON.parse(readFileSync(join(root, "scripts", "public-exports.json"), "utf-8"));
  assert.deepEqual(
    exportTargets.sort(),
    ["@msqd/lydia", ...barrels.map((barrel) => `@msqd/lydia/${barrel}`)].sort(),
    "the package exports its root and the listed barrels, nothing else",
  );

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

  // require.resolve matches `default`, never `import`: it fails on an entry without that condition.
  const requireFromApp = createRequire(join(app, "package.json"));
  for (const entry of ["@msqd/lydia", "@msqd/lydia/Components/Badges"]) {
    assert.ok(requireFromApp.resolve(entry).endsWith(".js"), `${entry} resolves through the default condition`);
  }

  const dist = join(installed, "dist");
  const unresolved = readdirSync(dist, { recursive: true })
    .filter((file) => file.endsWith(".d.ts"))
    .flatMap((file) => {
      const source = readFileSync(join(dist, file), "utf-8");
      return [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\1/g)]
        .map(([, , specifier]) => specifier)
        .filter((specifier) => /^(?:@msqd\/lydia|@\/|\.)/.test(specifier))
        .filter((specifier) => !/^\.\.?\/.*\.js$/.test(specifier) || !existsSync(resolve(dist, dirname(file), specifier.replace(/\.js$/, ".d.ts"))))
        .map((specifier) => `${file}: ${specifier}`);
    });
  assert.deepEqual(unresolved, [], "declarations import each other by relative .js specifiers that exist in dist");

  const guideSetup = readFileSync(join(root, "docs", "integration.md"), "utf-8").match(/^```ts\n\/\/ vitest\.setup\.ts\n([\s\S]*?)^```/m)?.[1];
  assert.equal(guideSetup, readFileSync(join(fixture, "vitest.setup.ts"), "utf-8"), "the guide's vitest.setup.ts is the fixture's");

  writeReadmeExamples(join(app, "src", "readme"));
  run("pnpm", ["exec", "vitest", "run"], app);
  run("pnpm", ["exec", "tsc"], app);
  run("pnpm", ["exec", "tsc", "-p", "tsconfig.nodenext.json"], app);
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
  assert.match(css, /\.bg-success-50/, "lydia's classes are scanned from its dist, with no @source in the app");
  assert.doesNotMatch(readFileSync(join(app, "src", "index.css"), "utf-8"), /@source/, "the app writes no @source");
  const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(([, url]) => url).filter((url) => !url.startsWith("data:"));
  assert.ok(urls.length >= 4, "lydia's fonts are emitted as files");
  for (const url of urls) assert.ok(existsSync(url.startsWith("/") ? join(app, "dist", url) : resolve(assets, url)), `url(${url}) resolves to an emitted file`);
  assert.match(css, /--color-success-50:/, "lydia's theme is applied");
  assert.match(css, /\.range-slider-input/, "lydia's component styles are included");
  assert.equal(css.match(/tailwindcss v\d/g)?.length, 1, "one Tailwind in the output");

  const stored = readdirSync(join(app, "node_modules", ".pnpm"));
  for (const [name, pattern] of [["React", /^react@/], ["Headless UI", /^@headlessui\+react@/], ["ECharts", /^echarts@/]]) {
    const copies = stored.filter((dir) => pattern.test(dir));
    assert.equal(copies.length, 1, `one ${name} copy, found ${copies}`);
  }

  const precompiled = join(app, "node_modules", "@msqd", "lydia", "dist", "styles", "styles.css");
  assert.ok(existsSync(precompiled), "the precompiled stylesheet is packed");
  console.log("Consumer check passed");
} finally {
  rmSync(work, { recursive: true, force: true });
}
