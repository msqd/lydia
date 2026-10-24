import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const distPath = join(root, "dist");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));

/** What a consumer must never receive: tests, stories, snapshots and test helpers. */
const NOT_PUBLISHED = /\.(test|test-d|stories)\.|__snapshots__|(^|\/)Testing\./;

const SAMPLES = /\.samples\.(js|d\.ts)$/;

describe("Package manifest", () => {
  it("is the public scoped package", () => {
    expect(packageJson.name).toBe("@msqd/lydia");
    expect(packageJson.private).toBeUndefined();
    expect(packageJson.publishConfig).toEqual({ access: "public" });
  });

  it("points at its repository", () => {
    expect(packageJson.repository).toEqual({ type: "git", url: "git+https://github.com/msqd/lydia.git" });
    expect(packageJson.homepage).toBe("https://github.com/msqd/lydia#readme");
  });
});

function collect(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) collect(fullPath, found);
    else found.push(fullPath);
  }
  return found;
}

describe.skipIf(!existsSync(distPath))("Published package", () => {
  it("packs no tests, stories, snapshots or source", () => {
    const packed = JSON.parse(execFileSync("pnpm", ["pack", "--dry-run", "--json"], { cwd: root }).toString());
    const paths: string[] = packed.files.map((file: { path: string }) => file.path);

    expect(paths.filter((path) => NOT_PUBLISHED.test(path))).toEqual([]);
    expect(paths.filter((path) => path.startsWith("src/"))).toEqual([]);
    expect(paths).toContain("dist/index.js");

    expect(paths.filter((path) => SAMPLES.test(path))).toEqual([]);
    expect(paths).toContain("dist/css/theme.css");
  });

  it("resolves every export target to a built file", () => {
    const missing = Object.entries(packageJson.exports as Record<string, string | Record<string, string>>).flatMap(
      ([key, entry]) =>
        Object.values(typeof entry === "string" ? { default: entry } : entry)
          .filter((target) => !existsSync(join(root, target)))
          .map((target) => `${key} -> ${target}`),
    );

    expect(missing).toEqual([]);
  });

  it("keeps every package-name import in the declarations resolvable through exports", () => {
    const keys = new Set(Object.keys(packageJson.exports));
    const unresolved: string[] = [];

    for (const file of collect(distPath).filter((file) => file.endsWith(".d.ts"))) {
      for (const [, specifier] of readFileSync(file, "utf-8").matchAll(
        /from ["']((?:@msqd\/)?lydia(?:\/[^"']*)?)["']/g,
      )) {
        const subpath = specifier.replace(/^@msqd\/lydia/, "") || "";
        if (!specifier.startsWith("@msqd/lydia") || !keys.has(subpath ? `.${subpath}` : ".")) {
          unresolved.push(`${file.slice(distPath.length + 1)}: ${specifier}`);
        }
      }
    }

    expect(unresolved).toEqual([]);
  });

  it("imports no stylesheet from a declaration, which a consumer without bundler types cannot resolve", () => {
    const importing = collect(distPath)
      .filter((file) => file.endsWith(".d.ts"))
      .filter((file) => /^\s*import\s+["'][^"']+\.css["']/m.test(readFileSync(file, "utf-8")))
      .map((file) => file.slice(distPath.length + 1));

    expect(importing).toEqual([]);
  });

  describe("import specifiers", () => {
    const specifiers = collect(distPath)
      .filter((file) => file.endsWith(".js"))
      .flatMap((file) =>
        [
          ...readFileSync(file, "utf-8").matchAll(
            /^(?:import|export)\b[^;"']*?\bfrom\s*["']([^"']+)["']|^import\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/gm,
          ),
        ].map(([, from, bare, dynamic]) => ({
          file: file.slice(distPath.length + 1),
          specifier: from ?? bare ?? dynamic,
        })),
      );
    const declared = new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);

    it("has none that leaks a build machine path", () => {
      expect(specifiers.length).toBeGreaterThan(0);
      expect(specifiers.filter(({ specifier }) => specifier.startsWith("/") || /node_modules/.test(specifier))).toEqual(
        [],
      );
    });

    it("only reaches relative files or declared dependencies", () => {
      const undeclared = specifiers.filter(({ specifier }) => {
        if (specifier.startsWith(".") || specifier.startsWith("node:")) return false;
        const [scope, name] = specifier.split("/");
        return !declared.has(scope.startsWith("@") ? `${scope}/${name}` : scope);
      });

      expect(undeclared).toEqual([]);
    });

    it("gives dependencies without an exports map a subpath Node ESM resolves", () => {
      const extensionless = specifiers.filter(({ specifier }) => {
        const [scope, name, ...rest] = specifier.split("/");
        const dependency = scope.startsWith("@") ? `${scope}/${name}` : scope;
        const subpath = scope.startsWith("@") ? rest : [name, ...rest].filter(Boolean);
        if (!declared.has(dependency) || subpath.length === 0) return false;
        const manifest = JSON.parse(readFileSync(join(root, "node_modules", dependency, "package.json"), "utf-8"));
        return !manifest.exports && !/\.[cm]?js(on)?$/.test(specifier);
      });

      expect(extensionless).toEqual([]);
    });
  });

  describe("CSS sources", () => {
    const css = (name: string) => readFileSync(join(distPath, "css", name), "utf-8");

    it("exports the theme and the component styles", () => {
      expect(packageJson.exports["./theme.css"]).toBe("./dist/css/theme.css");
      expect(packageJson.exports["./components.css"]).toBe("./dist/css/components.css");
    });

    it("keeps Tailwind out of the theme, so a consumer's build has a single copy", () => {
      expect(css("theme.css")).not.toMatch(/@import\s+["']tailwindcss["']/);
      expect(css("theme.css")).toContain("@theme");
    });

    it("needs no Tailwind to compile component styles, so no second copy is pulled in", () => {
      const sources = collect(join(distPath, "css")).filter((file) => file.endsWith(".css"));

      expect(sources.length).toBeGreaterThan(2);
      for (const file of sources) {
        const content = readFileSync(file, "utf-8");
        expect(content, file).not.toMatch(/@import\s+["'][^"']*(main\.css|tailwindcss)["']/);
        expect(content, file).not.toMatch(/@apply|@reference/);
      }
    });
  });
});
