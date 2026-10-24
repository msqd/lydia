import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { toId } from "storybook/internal/csf";
import { describe, expect, it } from "vitest";

/**
 * Documentation link guard.
 *
 * For a design system the documentation is the product's interface to its consumers, so a link
 * that goes nowhere is a defect rather than untidiness: a reader who follows one learns not to
 * trust the rest of the page.
 *
 * Storybook resolves a docs page from the `title` its MDX or story meta declares, so this walks
 * the source tree, derives every page that exists using Storybook's own id function rather than a
 * copy of its rules, and fails if a documentation link points at anything else.
 */

const srcRoot = resolve(__dirname);
const docsRoot = resolve(__dirname, "..", "docs");

function filesUnder(dir: string, matches: (name: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...filesUnder(full, matches));
    } else if (matches(entry)) {
      out.push(full);
    }
  }
  return out;
}

const mdxFiles = filesUnder(srcRoot, (name) => name.endsWith(".mdx"));
const storyFiles = filesUnder(srcRoot, (name) => name.endsWith(".stories.tsx"));

/** Titles declared by `<Meta title="..." />` in MDX and by `title: "..."` in a story meta. */
function declaredTitles(): string[] {
  const titles: string[] = [];

  for (const file of mdxFiles) {
    const match = readFileSync(file, "utf8").match(/<Meta\s+title=["']([^"']+)["']/);
    if (match) {
      titles.push(match[1]);
    }
  }

  for (const file of storyFiles) {
    const match = readFileSync(file, "utf8").match(/^\s*title:\s*["']([^"']+)["']/m);
    if (match) {
      titles.push(match[1]);
    }
  }

  return titles;
}

const documentationPages = new Set(declaredTitles().map((title) => `${toId(title)}--docs`));

/** Every `/docs/...` link written in an MDX file, with the file that wrote it. */
function documentationLinks(): Array<{ file: string; target: string }> {
  return mdxFiles.flatMap((file) => {
    const content = readFileSync(file, "utf8");
    return [...content.matchAll(/\]\(\/docs\/([^)\s]+)\)/g)].map((match) => ({
      file: relative(srcRoot, file),
      target: match[1],
    }));
  });
}

describe("documentation links", () => {
  it("finds the pages it is meant to check", () => {
    // A guard that silently checks nothing is worse than no guard, so prove there is something
    // to check before trusting the assertions below.
    expect(mdxFiles.length).toBeGreaterThan(0);
    expect(documentationPages.size).toBeGreaterThan(10);
  });

  it("resolves every documentation link to a page that exists", () => {
    const dead = documentationLinks()
      .filter(({ target }) => !documentationPages.has(target))
      .map(({ file, target }) => `${file} links to /docs/${target}, which no MDX or story declares`);

    expect(dead).toEqual([]);
  });
});

/**
 * The Markdown under `docs/` and the root README are read on GitHub, which resolves a relative link
 * to a file path. They drifted from the source for long enough to document a build that could not
 * run, so a relative link that resolves to no file fails here.
 */
const repoRoot = resolve(__dirname, "..");

function markdownFiles(): string[] {
  return [...filesUnder(docsRoot, (name) => name.endsWith(".md")), join(repoRoot, "README.md")];
}

function relativeLinks(): Array<{ file: string; target: string; path: string }> {
  return markdownFiles().flatMap((file) => {
    const content = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
    return [...content.matchAll(/\]\(([^)\s]+)\)/g)]
      .map((match) => match[1])
      .filter((target) => !/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target))
      .map((target) => ({
        file: relative(repoRoot, file),
        target,
        path: resolve(dirname(file), decodeURIComponent(target.split("#")[0])),
      }));
  });
}

describe("markdown links", () => {
  it("finds the links it is meant to check", () => {
    expect(relativeLinks().length).toBeGreaterThan(5);
  });

  it("resolves every relative link to a file that exists", () => {
    const dead = relativeLinks()
      .filter(({ path }) => !existsSync(path))
      .map(({ file, target }) => `${file} links to ${target}, which does not exist`);

    expect(dead).toEqual([]);
  });
});
