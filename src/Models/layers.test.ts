import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourcesIn = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourcesIn(path);
    return /\.tsx?$/.test(entry) && !/\.(test|stories)\./.test(entry) ? [path] : [];
  });

describe("Models layer", () => {
  it.each(sourcesIn(__dirname))("%s imports nothing from a higher layer", (path) => {
    expect(readFileSync(path, "utf8")).not.toMatch(/from "[^"]*(Components|Elements|Pages)\//);
  });
});
