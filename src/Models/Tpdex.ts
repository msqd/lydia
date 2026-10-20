/**
 * TPDEX (Transaction Performance Index) — the canonical performance scale and scoring.
 *
 * Converts a response time in milliseconds to a 0–100 performance score, and maps a score to a
 * rating (label + colour token). This is domain data/logic (no JSX); presentation components import it.
 */

export interface TpdexRating {
  label: string;
  /** Lower bound of the rating; the last rating (G) has none. */
  threshold?: number;
  /**
   * Tailwind background class, `bg-` plus the token's name. It repeats `token` because Tailwind finds a class by
   * scanning for its literal text, so it cannot be built from `token` at runtime; a test keeps the two in step.
   */
  className: string;
  /**
   * Tailwind text class for a label drawn on `className`, read through
   * `getTpdexTextClassName`. Omitted, the label is dark, which holds 4.5:1 on
   * every fill of the scale but G's; G sets white.
   */
  textClassName?: string;
  /**
   * Theme token carrying the rating's colour, e.g. "--color-tpdex-a". Canvas renderers read it from the computed
   * style (`resolveThemeColor`), so the badge and the chart follow the same retheme.
   */
  token: string;
}

export const tpdexScale: TpdexRating[] = [
  { label: "A++", threshold: 98, className: "bg-tpdex-a-plus-plus", token: "--color-tpdex-a-plus-plus" },
  { label: "A+", threshold: 96, className: "bg-tpdex-a-plus", token: "--color-tpdex-a-plus" },
  { label: "A", threshold: 93, className: "bg-tpdex-a", token: "--color-tpdex-a" },
  { label: "B", threshold: 83, className: "bg-tpdex-b", token: "--color-tpdex-b" },
  { label: "C", threshold: 69, className: "bg-tpdex-c", token: "--color-tpdex-c" },
  { label: "D", threshold: 49, className: "bg-tpdex-d", token: "--color-tpdex-d" },
  { label: "E", threshold: 31, className: "bg-tpdex-e", token: "--color-tpdex-e" },
  { label: "F", threshold: 17, className: "bg-tpdex-f", token: "--color-tpdex-f" },
  { label: "G", className: "bg-tpdex-g", token: "--color-tpdex-g", textClassName: "text-white" },
];

/** Map a 0–100 TPDEX score to its rating. */
export function getTpdexRating(score: number): TpdexRating {
  for (const rating of tpdexScale) {
    if (rating.threshold === undefined || score >= rating.threshold) {
      return rating;
    }
  }

  throw new Error("Invalid score (but that should not happen).");
}

/** Tailwind text class for a label drawn on the rating's fill. */
export function getTpdexTextClassName(rating: TpdexRating): string {
  return rating.textClassName ?? "text-gray-950";
}

/**
 * Internal: TPDEX score as a decimal (0.0–1.0) from a response time in ms.
 *
 * This formula looks like a mess, but it was carefully tuned. Do not change it unless you are
 * aware of the previous work and the impact it has.
 */
function _tpdex(n: number): number {
  if (n < 1328) {
    return Math.min(1 - 7.22e-4 * n + 2.44e-7 * n ** 2 - 3e-11 * n ** 3, 1);
  }
  return Math.max(-0.42115982438869104 * Math.log(Math.sqrt(n) + 1) + 1.9270515661020815, 0);
}

/** TPDEX score (0–100) for a single response time in ms. */
export function calculateTpdexScore(responseTime: number): number {
  return Math.trunc(_tpdex(responseTime) * 100);
}

/** Average TPDEX score (0–100) across multiple response times in ms. */
export function calculateAggregateTpdexScore(responseTimes: number[]): number {
  if (responseTimes.length === 0) return 0;

  const scores = responseTimes.map((time) => calculateTpdexScore(time));
  const sum = scores.reduce((acc, score) => acc + score, 0);

  return Math.trunc(sum / scores.length);
}
