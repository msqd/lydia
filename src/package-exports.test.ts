import { execFileSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "fs";
import { isBuiltin } from "module";
import { tmpdir } from "os";
import { join, relative, resolve, sep } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const srcPath = resolve(__dirname, ".");

/** The explicit list read by scripts/generate-exports.mjs. */
const publicSurface: { barrels: string[]; internal: Record<string, string> } = JSON.parse(
  readFileSync(resolve(__dirname, "../scripts/public-exports.json"), "utf-8"),
);
const CSS_ENTRIES = ["styles", "theme.css", "components.css"];

/** Mirrors tsconfig.build.json's exclude list, plus the test helper the exports map drops. */
const NOT_SHIPPED = /\.(stories|test|bench|samples)\.tsx?$|[/\\](Testing|App|main)\.tsx?$/;

/**
 * Anchored to the start of a statement and stopped by the first `;`, so a multi-line import is
 * matched whole while the word `from` inside a string literal further down the file is not.
 */
const IMPORT = /^\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm;

/**
 * Comments are stripped before scanning: prose can contain `from "something"`, and an import
 * regex that tolerates newlines will otherwise pair a real `import` with a quoted word in a
 * comment far below it. The `[^:]` guard keeps `http://` in string literals intact.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function collectSources(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "__snapshots__") continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectSources(fullPath, found);
    } else if (/\.tsx?$/.test(entry)) {
      found.push(fullPath);
    }
  }
  return found;
}

/** `@scope/name/deep/path` and `name/deep/path` both resolve to their package. */
function packageOf(specifier: string): string {
  const segments = specifier.split("/");
  return specifier.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
}

function collectDocs(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectDocs(fullPath, found);
    } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
      found.push(fullPath);
    }
  }
  return found;
}

function collectDirectories(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "__snapshots__") continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      found.push(fullPath);
      collectDirectories(fullPath, found);
    }
  }
  return found;
}

/**
 * Runs without a build, unlike the suite below, so it still guards in CI where dist/ is absent.
 *
 * scripts/generate-exports.mjs maps `Foo/index.js` and a sibling `Foo.js` to the same export key,
 * and the last one written wins. A module beside a directory of the same name therefore shadows
 * that directory's barrel silently: the import resolves, typechecks, and yields nothing.
 */
describe("Source layout", () => {
  it("has no module shadowing a directory barrel of the same name", () => {
    const collisions = collectDirectories(srcPath)
      .filter((dir) => existsSync(`${dir}.ts`) || existsSync(`${dir}.tsx`))
      .map((dir) => relative(srcPath, dir));

    expect(collisions).toEqual([]);
  });

  it("documents only import paths on the public list", () => {
    const docs = collectDocs(resolve(__dirname, ".."));
    const published = new Set([...publicSurface.barrels, ...CSS_ENTRIES]);
    const broken: string[] = [];

    for (const doc of docs) {
      for (const [, path] of readFileSync(doc, "utf-8").matchAll(/from ["']@msqd\/lydia\/([^"']+)["']/g)) {
        if (!published.has(path)) broken.push(`${relative(resolve(__dirname, ".."), doc)}: @msqd/lydia/${path}`);
      }
    }

    expect(broken).toEqual([]);
  });
});

/**
 * Runs without a build. The list in scripts/public-exports.json is the whole public surface: a
 * barrel added under src/ is neither exported nor hidden until someone files it on one side.
 */
describe("Public surface", () => {
  const sourceBarrels = collectDirectories(srcPath)
    .filter((dir) => existsSync(join(dir, "index.ts")) || existsSync(join(dir, "index.tsx")))
    .map((dir) => relative(srcPath, dir).split(sep).join("/"));
  const listed = [...publicSurface.barrels, ...Object.keys(publicSurface.internal)];

  it("files every barrel under src/ as public or internal", () => {
    expect(sourceBarrels.filter((barrel) => !listed.includes(barrel))).toEqual([]);
  });

  it("lists only barrels that exist", () => {
    expect(listed.filter((barrel) => !sourceBarrels.includes(barrel))).toEqual([]);
  });

  it("lists no barrel as both public and internal", () => {
    expect(publicSurface.barrels.filter((barrel) => barrel in publicSurface.internal)).toEqual([]);
  });
});

/** Every package imported, mapped to the files importing it. Shipped files only unless told otherwise. */
function importedPackages(includeTestsAndStories = false): Map<string, string[]> {
  const imported = new Map<string, string[]>();
  for (const file of collectSources(srcPath).filter((file) => includeTestsAndStories || !NOT_SHIPPED.test(file))) {
    const source = stripComments(readFileSync(file, "utf-8"));
    for (const match of source.matchAll(IMPORT)) {
      const specifier = match[1] ?? match[2];
      if (specifier.startsWith(".") || specifier.startsWith("@msqd/lydia/") || specifier === "@msqd/lydia") continue;

      const pkg = packageOf(specifier);
      imported.set(pkg, [...(imported.get(pkg) ?? []), relative(srcPath, file)]);
    }
  }
  return imported;
}

/**
 * Runs without a build, unlike the suite below, so it still guards in CI where dist/ is absent.
 *
 * Both directions of the same property: the manifest describes what the code does. A shipped file
 * importing a devDependency leaves the consumer to supply it, and works only when their package
 * manager happens to hoist it. A dependency nothing imports is installed by every consumer for
 * nothing.
 */
describe("Runtime dependencies", () => {
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));

  it("declares every package that shipped code imports", () => {
    const declared = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);

    const undeclared = new Map([...importedPackages()].filter(([pkg]) => !declared.has(pkg)));

    expect(Object.fromEntries(undeclared)).toEqual({});
  });

  /**
   * `dependencies` only. A peer dependency is a requirement placed on the consumer's tree rather
   * than a package this library loads, so it is legitimately declared without a direct import.
   *
   * `devDependencies` are deliberately out of scope and cannot be checked this way: most are tools
   * invoked by a binary name or read by a config key rather than imported, so an import scan calls
   * biome, playwright and the type packages unused while they are all doing their job. The one
   * devDependency rule that does hold without an allowlist is the `@types/*` one below.
   */
  it("imports every package it declares as a dependency", () => {
    const imported = importedPackages();
    const unused = Object.keys(packageJson.dependencies ?? {}).filter((pkg) => !imported.has(pkg));

    expect(unused).toEqual([]);
  });

  /**
   * A `@types/x` package only earns its place while something imports `x`. Unlike the rest of
   * devDependencies this needs no allowlist, because the package it describes is named in its own
   * name. Tests and stories count here: type packages serve them as much as shipped code.
   *
   * `@types/jest-image-snapshot` outlived `jest-image-snapshot` being used by anything, and this
   * is the rule that would have said so.
   */
  it("declares no @types package for something it does not import", () => {
    const imported = importedPackages(true);
    // @types/node describes the built-ins (`fs`, `node:path`), which no package is named "node" for.
    const usesNodeBuiltin = [...imported.keys()].some((specifier) => isBuiltin(specifier));
    const orphaned = Object.keys(packageJson.devDependencies ?? {})
      .filter((pkg) => pkg.startsWith("@types/"))
      .map((pkg) => ({ types: pkg, describes: pkg.replace("@types/", "").replace("__", "/") }))
      .filter(({ describes }) => !imported.has(describes) && !(describes === "node" && usesNodeBuiltin))
      .map(({ types }) => types);

    expect(orphaned).toEqual([]);
  });
});

// Validates the built dist/ and the generated exports map, so it only runs after a build.
describe.skipIf(!existsSync(resolve(__dirname, "../dist")))("Package Exports", () => {
  const packageJsonPath = resolve(__dirname, "../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const distPath = resolve(__dirname, "../dist");

  it("should have styles export in package.json", () => {
    expect(packageJson.exports).toHaveProperty("./styles");
    expect(packageJson.exports["./styles"]).toBe("./dist/styles/styles.css");
  });

  it("should have main library export", () => {
    expect(packageJson.exports).toHaveProperty(".");
    expect(packageJson.exports["."].import).toBe("./dist/index.js");
    expect(packageJson.exports["."].types).toBe("./dist/index.d.ts");
  });

  it("should have styles file at expected location", () => {
    const stylesPath = resolve(distPath, "styles/styles.css");
    expect(existsSync(stylesPath)).toBe(true);
  });

  it("should have main library files at expected locations", () => {
    expect(existsSync(resolve(distPath, "index.js"))).toBe(true);
    expect(existsSync(resolve(distPath, "index.d.ts"))).toBe(true);
  });

  it("exports the public list and nothing else", () => {
    const expected = [".", "./styles", "./theme.css", "./components.css", "./package.json"].concat(
      publicSurface.barrels.map((barrel) => `./${barrel}`),
    );

    expect(Object.keys(packageJson.exports).sort()).toEqual(expected.sort());
  });

  it("gives every JS entry types, then import, then default", () => {
    const entries = Object.entries(packageJson.exports as Record<string, unknown>).filter(
      ([, entry]) => typeof entry === "object",
    );

    expect(entries.length).toBeGreaterThan(0);
    for (const [, entry] of entries) {
      const conditions = entry as Record<string, string>;
      expect(Object.keys(conditions)).toEqual(["types", "import", "default"]);
      expect(conditions.default).toBe(conditions.import);
    }
  });

  it("describes the package for the registry", () => {
    expect(packageJson.description).toEqual(expect.any(String));
    expect(packageJson.keywords).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(packageJson.author).toBe("Romain Dorgueil <romain@makersquad.fr>");
    expect(packageJson.engines).toEqual({ node: ">=24" });
  });

  it("should include component category exports", () => {
    // Check a few key component exports exist
    expect(packageJson.exports).toHaveProperty("./Components/Badges");
    expect(packageJson.exports).toHaveProperty("./Components/Buttons");
    expect(packageJson.exports).toHaveProperty("./Components/Inputs");

    // Verify the paths point to correct locations
    expect(packageJson.exports["./Components/Badges"].import).toBe("./dist/Components/Badges/index.js");
  });

  it("should have corresponding files for component exports", () => {
    // Test a few key component directories exist
    expect(existsSync(resolve(distPath, "Components/Badges/index.js"))).toBe(true);
    expect(existsSync(resolve(distPath, "Components/Badges/index.d.ts"))).toBe(true);
    expect(existsSync(resolve(distPath, "Components/Buttons/index.js"))).toBe(true);
    expect(existsSync(resolve(distPath, "Components/Inputs/index.js"))).toBe(true);
  });

  it("resolves every directory barrel to that directory's index", () => {
    const barrelExports = Object.entries(packageJson.exports as Record<string, { import?: string }>).filter(
      ([key]) => key.startsWith("./") && existsSync(resolve(distPath, `${key.slice(2)}/index.js`)),
    );

    expect(barrelExports.length).toBeGreaterThan(0);
    for (const [key, entry] of barrelExports) {
      expect(entry.import).toBe(`./dist/${key.slice(2)}/index.js`);
    }
  });

  it("exports the Utilities barrel's contents rather than an empty module", async () => {
    const utilities = await import("./Components/Utilities");

    expect(Object.keys(utilities)).toContain("Foldable");
  });

  it("exports package.json", () => {
    expect(packageJson.exports["./package.json"]).toBe("./package.json");
  });

  it("keeps the MIT notice of the vendored Prism theme in the minified stylesheet", () => {
    const styles = readFileSync(resolve(distPath, "styles/styles.css"), "utf-8");

    expect(styles).toContain("Lea Verou");
    expect(styles).toContain("MIT License");
  });

  it("does not let bundlers drop the CSS imports as side-effect free", () => {
    expect(packageJson.sideEffects).toEqual(["**/*.css"]);
  });

  it("should publish only the dist directory", () => {
    expect(packageJson.files).toEqual(["dist"]);
  });

  it("should have correct main and module fields", () => {
    expect(packageJson.main).toBe("./dist/index.js");
    expect(packageJson.module).toBe("./dist/index.js");
    expect(packageJson.types).toBe("./dist/index.d.ts");
  });
});

/**
 * The build ends by regenerating `exports`. When nothing changed, it must not touch the file at
 * all: a rewrite with identical bytes still moves the mtime, and a repository that vendors lydia
 * as a submodule then sees a stale stat, which aborts its `git checkout` ("not uptodate").
 *
 * The generator resolves `package.json` and `dist/` from its own location, so a copy of it in a
 * temporary directory works on a copied manifest and never on the checkout's own.
 */
describe.skipIf(!existsSync(resolve(__dirname, "../dist")))("Export generation", () => {
  const root = resolve(__dirname, "..");
  let sandbox: string;
  let manifest: string;
  const generate = () => execFileSync("node", [join(sandbox, "scripts/generate-exports.mjs")]);

  beforeEach(() => {
    sandbox = mkdtempSync(join(tmpdir(), "lydia-exports-"));
    manifest = join(sandbox, "package.json");
    mkdirSync(join(sandbox, "scripts"));
    for (const file of ["generate-exports.mjs", "public-exports.json"]) {
      copyFileSync(join(root, "scripts", file), join(sandbox, "scripts", file));
    }
    copyFileSync(join(root, "package.json"), manifest);
    symlinkSync(join(root, "dist"), join(sandbox, "dist"), "junction");
    generate();
  });

  afterEach(() => {
    rmSync(sandbox, { recursive: true, force: true });
  });

  it("leaves package.json untouched when the exports have not changed", () => {
    const bytes = readFileSync(manifest, "utf-8");
    const mtime = statSync(manifest).mtimeMs;

    generate();

    expect(readFileSync(manifest, "utf-8")).toBe(bytes);
    expect(statSync(manifest).mtimeMs).toBe(mtime);
  });

  it("still rewrites package.json when the exports have changed", () => {
    const bytes = readFileSync(manifest, "utf-8");
    const pkg = JSON.parse(bytes);
    delete pkg.exports["./styles"];
    writeFileSync(manifest, JSON.stringify(pkg, null, 2) + "\n");

    generate();

    expect(readFileSync(manifest, "utf-8")).toBe(bytes);
  });
});

/**
 * The suites above, and `styles.test.ts`, skip without a build. That is what `pnpm test:watch`
 * needs, since it has no `pretest` hook to build for it.
 *
 * A skipped suite and a passing one look identical in a run summary, so in CI the skip would be
 * indistinguishable from coverage. The build does happen there today, through three indirections
 * that are invisible from the workflow file: CI runs `make test`, `test` is not a Makefile target
 * so the catch-all forwards it to `pnpm test`, and `pretest` builds. If any of those decays, this
 * assertion is what says so, rather than two suites quietly reporting green.
 *
 * Placed at the end of the file deliberately: several open pull requests add blocks near the top.
 */
describe("Build artifacts", () => {
  it.runIf(process.env.CI)("are present, so the dist-gated suites actually ran", () => {
    expect(existsSync(resolve(__dirname, "../dist"))).toBe(true);
  });
});
