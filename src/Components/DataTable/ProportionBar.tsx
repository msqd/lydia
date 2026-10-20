import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface ProportionBarProps extends Omit<ComponentProps<"div">, "children" | "aria-hidden"> {
  /** What this row measures. */
  value: number;
  /** What the largest bar drawn beside it measures. */
  max: number;
  /**
   * Whether this is the one the others are being measured against.
   *
   * Drawn in a second colour, so the scale has a visible top. Without it a
   * reader has to find the longest bar to know what "long" means here.
   */
  peak?: boolean;
}

/**
 * How wide to draw, as a percentage of the largest beside it.
 *
 * A floor of 2%, so the smallest measurement is still a mark: a bar of no
 * width says "nothing" by being invisible, which is a different claim from
 * "very little". A ceiling of 100%, because a bar wider than its own track is
 * a bug rather than a large value. And nothing at all when there is no scale
 * to draw against -- one value is not a distribution, and a full-width bar on
 * the only row there is says "large" about a number it has nothing to compare
 * with.
 */
function share(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(2, Math.round((value / max) * 100)));
}

/**
 * A value drawn against the largest one beside it, for a dense column of them.
 *
 * `1.2 s` means nothing until something else on the page is `3 ms`. This is the
 * comparison, drawn: a thin track per row and a fill scaled to the largest
 * value in view, so a column of numbers reads as a distribution at a glance
 * rather than one number at a time.
 *
 * **Scaled to what is on screen rather than to a fixed ceiling.** What counts
 * as large is a property of the data being looked at, and a fixed scale is
 * wrong for every dataset but one. The caller computes the maximum, because
 * only the caller knows what "beside it" means -- the visible page, the whole
 * result set, or a window.
 *
 * **It is decorative, and hidden from assistive technology.** It says nothing
 * the number beside it does not, so announcing it reads the row twice. That is
 * the whole of its accessibility contract and it is not configurable: a
 * consumer with no number to put beside it wants a labelled `meter`, which is
 * a different component and not this one.
 *
 * **The two colours are the component's own**, rather than the theme's status
 * presets. A peak is not a verdict -- the longest bar is not a failure, a
 * warning or a success -- so `warning` would be saying something untrue about
 * it. These two clear the 3:1 a mark carrying meaning owes, measured against
 * the `gray-100` track rather than the page, since the fill never touches the
 * page: `amber-700` 4.57:1, `gray-500` 4.39:1. `amber-600` is 2.91:1 there.
 *
 * ```tsx
 * const largest = Math.max(...rows.map((row) => row.elapsedMs));
 *
 * <ProportionBar value={row.elapsedMs} max={rows.length > 1 ? largest : 0} peak={row.elapsedMs === largest} />
 * ```
 */
export function ProportionBar({ value, max, peak = false, className, ...rest }: ProportionBarProps) {
  return (
    /*
      The caller's attributes first, then what this component owns.

      `aria-hidden` is last and is refused by the type, for the reason above:
      un-hiding it produces an unnamed graphic that repeats the number beside
      it, which is the failure this component exists to have already decided.
    */
    <div {...rest} className={twMerge("h-0.5 w-full bg-gray-100", className)} aria-hidden="true">
      <div className={peak ? "h-full bg-amber-700" : "h-full bg-gray-500"} style={{ width: `${share(value, max)}%` }} />
    </div>
  );
}
