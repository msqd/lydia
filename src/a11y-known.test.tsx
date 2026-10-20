import { storyNameFromExport } from "storybook/internal/csf";
import { describe, expect, it } from "vitest";
import { knownViolations } from "../.storybook/a11y-known";

type StoryModule = Record<string, unknown> & { default?: { title?: string } };

/**
 * Every story the known-violations list names exists. An entry left behind when
 * a story is renamed or deleted switches its rules off for nothing, and would
 * silently cover whatever story takes that name next.
 */
describe("the known axe violations", () => {
  const modules = import.meta.glob<StoryModule>("./**/*.stories.tsx", { eager: true });
  const stories = new Set<string>();

  for (const module of Object.values(modules)) {
    const title = module.default?.title;
    if (!title) continue;
    for (const [exported, story] of Object.entries(module)) {
      if (exported === "default" || (typeof story !== "object" && typeof story !== "function") || story === null)
        continue;
      const name =
        (story as { storyName?: string; name?: string }).storyName ??
        (typeof story === "object" ? (story as { name?: string }).name : undefined) ??
        storyNameFromExport(exported);
      stories.add(`${title} > ${name}`);
    }
  }

  it("name only stories that exist", () => {
    const listed = Object.entries(knownViolations).flatMap(([title, byName]) =>
      Object.keys(byName).map((name) => `${title} > ${name}`),
    );

    expect(listed.filter((story) => !stories.has(story))).toEqual([]);
  });
});
