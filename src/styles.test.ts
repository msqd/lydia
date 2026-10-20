import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { beforeAll, describe, expect, it } from "vitest";

// Validates the built CSS bundle in dist/, so it only runs after a build.
describe.skipIf(!existsSync(resolve(__dirname, "../dist")))("CSS Export", () => {
  const distPath = resolve(__dirname, "../dist");
  const cssPath = resolve(distPath, "styles/styles.css");
  const fontsPath = resolve(distPath, "fonts");

  // Cache CSS content to avoid repeated file system access
  let cssContent: string;

  beforeAll(() => {
    // Read CSS file once and reuse across all tests for better performance
    cssContent = readFileSync(cssPath, "utf-8");
  });

  it("should generate CSS file in correct location", () => {
    expect(existsSync(cssPath)).toBe(true);
  });

  it("should include Tailwind CSS base styles", () => {
    // Check for Tailwind CSS presence
    expect(cssContent).toContain("tailwindcss");
    expect(cssContent).toContain("@layer");
  });

  it("should include custom theme variables", () => {
    // Check for Lydia's custom primary colors
    expect(cssContent).toContain("--color-primary-500:#3d5c9e");
    expect(cssContent).toContain("--color-primary-900:#1c2f65");

    // `--font-sans` is the namespace Tailwind 4 reads. Asserting the declared name is not
    // enough: `--font-family-sans` was declared for a long time while every `font-sans`
    // utility resolved to Tailwind's own default, which has no Lato in it.
    expect(cssContent).toContain("--font-sans:Lato");
    expect(cssContent).toContain(".font-sans{font-family:var(--font-sans)}");
  });

  it("should include component-specific styles", () => {
    // Check for Input component styles (minified)
    expect(cssContent).toContain("calendar-icon-right");
    expect(cssContent).toContain("input[type=date]");

    // Check for RangeSlider component styles
    expect(cssContent).toContain("range-slider-input");

    // Check for Prism syntax highlighting styles
    expect(cssContent).toContain("token.comment");
    expect(cssContent).toContain("language-");
  });

  it("should include font definitions", () => {
    // Check for font-face definitions
    expect(cssContent).toContain("@font-face");
    expect(cssContent).toContain("font-family:Lato");
    expect(cssContent).toContain("Lato-Regular.woff2");
    expect(cssContent).toContain("Lato-Bold.woff2");
    expect(cssContent).toContain("Lato-Italic.woff2");
    expect(cssContent).toContain("Lato-BoldItalic.woff2");
  });

  it("should copy font files to correct location", () => {
    expect(existsSync(resolve(fontsPath, "Lato-Regular.woff2"))).toBe(true);
    expect(existsSync(resolve(fontsPath, "Lato-Bold.woff2"))).toBe(true);
    expect(existsSync(resolve(fontsPath, "Lato-Italic.woff2"))).toBe(true);
    expect(existsSync(resolve(fontsPath, "Lato-BoldItalic.woff2"))).toBe(true);
  });

  it("should have predictable CSS file name (no hash)", () => {
    const cssFileName = cssPath.split("/").pop();
    expect(cssFileName).toBe("styles.css");

    // Ensure no hash in filename
    expect(cssFileName).not.toMatch(/-[a-f0-9]{8}/);
  });

  it("should contain utility classes for common patterns", () => {
    // Check for common utility classes that components use
    expect(cssContent).toContain(".flex");
    expect(cssContent).toContain(".text-sm");
    expect(cssContent).toContain(".bg-primary-500");
    expect(cssContent).toContain(".border-gray-200");
    expect(cssContent).toContain(".hover\\:bg-gray-100");
  });
});
