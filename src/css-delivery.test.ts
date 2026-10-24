import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Components/Inputs/Checkbox";
import { Input } from "./Components/Inputs/Input";
import { Radio } from "./Components/Inputs/Radio";
import { SearchInput } from "./Components/Inputs/SearchInput";
import { RangeSlider } from "./Components/Inputs/Sliders";

const srcRoot = resolve(__dirname);

const read = (...path: string[]) => readFileSync(join(srcRoot, ...path), "utf-8");
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("importable styles", () => {
  it("imports no stylesheet from TypeScript, so declarations carry no CSS import", () => {
    const importing = (readdirSync(srcRoot, { recursive: true }) as string[])
      .filter((file) => /\.tsx?$/.test(file))
      .filter((file) => /^import\s+["'][^"']+\.css["']/m.test(read(file)));

    expect(importing).toEqual([]);
  });

  it("keeps the build free of the script that stripped those imports", () => {
    expect(existsSync(resolve(srcRoot, "../scripts/strip-css-imports-from-declarations.mjs"))).toBe(false);
    expect(read("../package.json")).not.toContain("strip-css-imports");
  });

  it("points every font at a file shipped with the stylesheet", () => {
    const urls = [...read("theme.css").matchAll(/url\(["']([^"']+)["']\)/g)].map(([, url]) => url);

    expect(urls).toHaveLength(4);
    for (const url of urls) {
      expect(url).toMatch(/^\.\//);
      expect(existsSync(join(srcRoot, url)), url).toBe(true);
    }
  });

  describe("Input.css", () => {
    const css = withoutComments(read("Components", "Inputs", "Input", "Input.css"));

    it("sits entirely in the components layer", () => {
      expect(css.trim()).toMatch(/^@layer components \{[\s\S]*\}$/);
    });

    it("never wins by force", () => {
      expect(css).not.toContain("!important");
    });

    it("selects only Lydia's own inputs, never an element of the host application", () => {
      const selectors = [...css.matchAll(/([^{}]+)\{/g)]
        .map(([, selector]) => selector.trim())
        .filter((selector) => !selector.startsWith("@layer"))
        .flatMap((selector) => selector.split(","));

      expect(selectors.length).toBeGreaterThan(0);
      for (const selector of selectors) {
        expect(selector, selector).toMatch(/\.(calendar-icon-right|lydia-input)\b/);
      }
    });
  });

  it.each([
    ["Input", createElement(Input, { disabled: true, label: "a", id: "a" })],
    ["date Input", createElement(Input, { type: "date", id: "a" })],
    ["Checkbox", createElement(Checkbox, { id: "a", name: "a", label: "a", disabled: true })],
    ["Radio", createElement(Radio, { id: "a", name: "a", label: "a", disabled: true })],
    ["SearchInput", createElement(SearchInput, { disabled: true })],
    ["RangeSlider", createElement(RangeSlider, { defaultValue: { min: 2, max: 8 } })],
  ])("marks the %s inputs as Lydia's, which scopes their disabled styles", (_name, element) => {
    const { container } = render(element);

    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) expect(input).toHaveClass("lydia-input");
  });
});
