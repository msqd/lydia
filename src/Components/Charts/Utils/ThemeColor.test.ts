import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveThemeColor, resolveThemeColors, toEchartsColor } from "./ThemeColor";

/** Parses an `rgb()`/`rgba()` string into its channels. */
const channels = (color: string): number[] => (color.match(/[\d.]+/g) ?? []).map(Number);

const expectRgb = (color: string | undefined, expected: [number, number, number]) => {
  const [r, g, b] = channels(color ?? "");
  // Rounding differs by one step between implementations; a visible shift is far above that.
  expect(Math.abs(r - expected[0])).toBeLessThanOrEqual(1);
  expect(Math.abs(g - expected[1])).toBeLessThanOrEqual(1);
  expect(Math.abs(b - expected[2])).toBeLessThanOrEqual(1);
};

describe("toEchartsColor", () => {
  it("converts oklch to rgb, which ECharts parses", () => {
    expect(toEchartsColor("oklch(100% 0 0)")).toBe("rgb(255, 255, 255)");
    expect(toEchartsColor("oklch(0% 0 0)")).toBe("rgb(0, 0, 0)");
  });

  it("matches the reference sRGB values of Tailwind's ramp", () => {
    expectRgb(toEchartsColor("oklch(63.7% 0.237 25.331)"), [251, 44, 54]); // red-500
    expectRgb(toEchartsColor("oklch(72.3% 0.219 149.579)"), [0, 201, 80]); // green-500
    expectRgb(toEchartsColor("oklch(62.8% 0.2577 29.23)"), [255, 0, 0]);
  });

  it("reads fractions, degrees, none and case", () => {
    expect(toEchartsColor("OKLCH(1 0 0)")).toBe("rgb(255, 255, 255)");
    expect(toEchartsColor("oklch(100% 0 none)")).toBe("rgb(255, 255, 255)");
    expectRgb(toEchartsColor("oklch(72.3% 0.219 149.579deg)"), [0, 201, 80]);
  });

  it("keeps the alpha channel", () => {
    expect(toEchartsColor("oklch(100% 0 0 / 50%)")).toBe("rgba(255, 255, 255, 0.5)");
    expect(toEchartsColor("oklch(100% 0 0 / 0.25)")).toBe("rgba(255, 255, 255, 0.25)");
  });

  it("clamps colours outside the sRGB gamut", () => {
    for (const channel of channels(toEchartsColor("oklch(70% 0.4 150)") ?? "")) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });

  it.each([
    ["0.41550turn", "149.58deg"],
    ["2.6107rad", "149.579deg"],
    ["166.2grad", "149.58deg"],
  ])("converts the hue unit %s like %s", (unit, degrees) => {
    expectRgb(
      toEchartsColor(`oklch(72.3% 0.219 ${unit})`),
      channels(toEchartsColor(`oklch(72.3% 0.219 ${degrees})`) ?? "") as [number, number, number],
    );
  });

  it("reads a turn as 360 degrees, not as degrees", () => {
    expect(toEchartsColor("oklch(60% 0.2 1turn)")).toBe(toEchartsColor("oklch(60% 0.2 360)"));
    expect(toEchartsColor("oklch(60% 0.2 0.5turn)")).toBe(toEchartsColor("oklch(60% 0.2 180)"));
    expect(toEchartsColor("oklch(60% 0.2 1rad)")).not.toBe(toEchartsColor("oklch(60% 0.2 1)"));
    expect(toEchartsColor("oklch(60% 0.2 100grad)")).toBe(toEchartsColor("oklch(60% 0.2 90)"));
  });

  it("clamps lightness to 0..1", () => {
    expect(toEchartsColor("oklch(150% 0 0)")).toBe("rgb(255, 255, 255)");
    expect(toEchartsColor("oklch(1.5 0.4 30)")).toBe(toEchartsColor("oklch(1 0.4 30)"));
    expect(toEchartsColor("oklch(-20% 0 30)")).toBe("rgb(0, 0, 0)");
  });

  it("clamps a negative chroma to grey", () => {
    expect(toEchartsColor("oklch(60% -0.2 30)")).toBe(toEchartsColor("oklch(60% 0 30)"));
  });

  it("clamps alpha to 0..1", () => {
    expect(toEchartsColor("oklch(100% 0 0 / 150%)")).toBe("rgba(255, 255, 255, 1)");
    expect(toEchartsColor("oklch(100% 0 0 / -1)")).toBe("rgba(255, 255, 255, 0)");
  });

  it.each([
    "oklch(foo 0 0)",
    "oklch(50% bar 0)",
    "oklch(50% 0.1 baz)",
    "oklch(50% 0.1 30 / nope)",
    "oklch(50% 0.1 30deg30)",
    "oklch(50% 0.1 30px)",
    "oklch(50% 0.1)",
    "oklch(from red l c h)",
    "oklch(50% 0.1 var(--h))",
  ])("gives undefined for the unparseable %s", (value) => {
    expect(toEchartsColor(value)).toBeUndefined();
  });

  it.each([
    "color-mix(in oklch, red 50%, blue)",
    "lab(50% 20 30)",
    "lch(50% 20 30)",
    "oklab(50% 0.1 0.1)",
    "color(display-p3 1 0 0)",
  ])("gives undefined for %s, which ECharts cannot parse", (value) => {
    expect(toEchartsColor(value)).toBeUndefined();
  });

  it("passes colours ECharts already understands through", () => {
    expect(toEchartsColor("#ADD8E6")).toBe("#ADD8E6");
    expect(toEchartsColor("rgb(1, 2, 3)")).toBe("rgb(1, 2, 3)");
    expect(toEchartsColor("  tomato ")).toBe("tomato");
  });
});

describe("resolveThemeColor", () => {
  afterEach(() => vi.restoreAllMocks());

  const stubTokens = (tokens: Record<string, string>) =>
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => tokens[name] ?? "",
    } as CSSStyleDeclaration);

  it("reads the computed token and converts it", () => {
    stubTokens({ "--color-danger-200": " oklch(100% 0 0)" });

    expect(resolveThemeColor("--color-danger-200")).toBe("rgb(255, 255, 255)");
  });

  it("resolves nothing without a DOM, as when rendering on the server", () => {
    vi.stubGlobal("document", undefined);

    try {
      expect(resolveThemeColor("--color-danger-200")).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reads the token from the given element", () => {
    const spy = stubTokens({ "--color-x": "#fff" });
    const element = document.createElement("div");

    resolveThemeColor("--color-x", element);

    expect(spy).toHaveBeenCalledWith(element);
  });

  it("reads the token at call time, so a changed token moves the colour", () => {
    const tokens = { "--color-x": "oklch(100% 0 0)" };
    stubTokens(tokens);
    expect(resolveThemeColor("--color-x")).toBe("rgb(255, 255, 255)");

    tokens["--color-x"] = "oklch(0% 0 0)";

    expect(resolveThemeColor("--color-x")).toBe("rgb(0, 0, 0)");
  });

  it("yields no colour for an undefined token, so ECharts keeps its own palette", () => {
    stubTokens({});

    expect(resolveThemeColor("--color-missing")).toBeUndefined();
  });

  it("resolves a record of tokens", () => {
    stubTokens({ "--a": "#111", "--b": "oklch(100% 0 0)" });

    expect(resolveThemeColors({ first: "--a", second: "--b", third: "--c" })).toEqual({
      first: "#111",
      second: "rgb(255, 255, 255)",
      third: undefined,
    });
  });
});

describe("toEchartsColor on pathological input", () => {
  const digits = "1".repeat(100_000);
  const cases = {
    lightness: `oklch(${digits}x 0 0)`,
    chroma: `oklch(1 ${digits}x 0)`,
    hue: `oklch(1 0 ${digits}x)`,
    alpha: `oklch(1 0 0 / ${digits}x)`,
  };

  it.each(Object.entries(cases))("rejects a long malformed %s in linear time", (_position, input) => {
    const start = performance.now();
    toEchartsColor(input);
    expect(performance.now() - start).toBeLessThan(100);
  });
});
