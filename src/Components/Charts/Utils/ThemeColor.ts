/**
 * Theme tokens are `oklch()` custom properties, and ECharts paints on a canvas with a colour parser that does not
 * know `oklch()`. These helpers read a token from the computed style and hand ECharts an `rgb()` it parses.
 */

const OKLCH = /^oklch\(\s*([^\s/)]+)\s+([^\s/)]+)\s+([^\s/)]+)(?:\s*\/\s*([^\s)]+))?\s*\)$/i;
const OKLCH_START = /^oklch\(/i;
/** Colour functions ECharts cannot parse and that are not converted here. */
const UNSUPPORTED = /^(?:color-mix|color|lab|lch|oklab)\(/i;

const NUMBER = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?";
const PLAIN_OR_PERCENT = new RegExp(`^(${NUMBER})(%)?$`, "i");
const ANGLE = new RegExp(`^(${NUMBER})(deg|grad|rad|turn)?$`, "i");
const DEGREES_PER_UNIT = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** A number, a percentage of `percentScale`, or `none` (0), clamped to `[min, max]`; `undefined` if unparseable. */
function parseComponent(raw: string, percentScale: number, min: number, max: number): number | undefined {
  if (raw.toLowerCase() === "none") return clamp(0, min, max);
  const match = PLAIN_OR_PERCENT.exec(raw);
  if (!match) return undefined;
  const value = Number.parseFloat(match[1]);
  return clamp(match[2] ? (value / 100) * percentScale : value, min, max);
}

/** A hue in degrees, from a number (degrees), an angle with its unit, or `none` (0); `undefined` if unparseable. */
function parseHue(raw: string): number | undefined {
  if (raw.toLowerCase() === "none") return 0;
  const match = ANGLE.exec(raw);
  if (!match) return undefined;
  const unit = (match[2]?.toLowerCase() ?? "deg") as keyof typeof DEGREES_PER_UNIT;
  return Number.parseFloat(match[1]) * DEGREES_PER_UNIT[unit];
}

const toGamma = (linear: number): number => {
  const clamped = Math.min(1, Math.max(0, linear));
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
};

/** Out-of-gamut colours are clamped per channel, as browsers do for a canvas fill. */
function oklchToRgb(lightness: number, chroma: number, hueDegrees: number): [number, number, number] {
  const hue = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((channel) => Math.round(toGamma(channel) * 255)) as [number, number, number];
}

/**
 * Converts `oklch()` to `rgb()`/`rgba()`; any other colour ECharts understands is returned untouched. Returns
 * `undefined` for a value ECharts cannot paint (malformed `oklch()`, `color-mix()`, `lab()`, `color()`...), so it
 * keeps its own palette instead of getting `NaN`.
 */
export function toEchartsColor(value: string): string | undefined {
  const color = value.trim();
  if (UNSUPPORTED.test(color)) return undefined;
  if (!OKLCH_START.test(color)) return color;

  const match = OKLCH.exec(color);
  if (!match) return undefined;

  const [, rawLightness, rawChroma, rawHue, rawAlpha] = match;
  const lightness = parseComponent(rawLightness, 1, 0, 1);
  const chroma = parseComponent(rawChroma, 0.4, 0, Number.POSITIVE_INFINITY);
  const hue = parseHue(rawHue);
  const alpha = rawAlpha === undefined ? undefined : parseComponent(rawAlpha, 1, 0, 1);
  if (lightness === undefined || chroma === undefined || hue === undefined) return undefined;
  if (rawAlpha !== undefined && alpha === undefined) return undefined;

  const [r, g, b] = oklchToRgb(lightness, chroma, hue);
  return alpha === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Resolves a theme token (`--color-danger-200`) to a colour ECharts accepts, from the live computed style so a
 * retheme is seen. Returns `undefined` for an undefined token, so ECharts keeps its own palette instead of a
 * guessed colour.
 */
export function resolveThemeColor(token: string, element?: Element): string | undefined {
  const target = element ?? (typeof document === "undefined" ? undefined : document.documentElement);
  if (!target) return undefined;

  const value = window.getComputedStyle(target).getPropertyValue(token).trim();
  return value ? toEchartsColor(value) : undefined;
}

export type ThemeColors<T extends Record<string, string>> = { [K in keyof T]: string | undefined };

/** Resolves a record of tokens, keeping its keys. */
export function resolveThemeColors<T extends Record<string, string>>(tokens: T, element?: Element): ThemeColors<T> {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, token]) => [name, resolveThemeColor(token, element)]),
  ) as ThemeColors<T>;
}
