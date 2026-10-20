import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProportionBar } from "./ProportionBar";

/**
 * The bar is `aria-hidden`, so it is deliberately unreachable through a role.
 * `data-testid` is the handle, and the width is read off the style attribute
 * because that is the only place the proportion exists.
 */
const fill = () => screen.getByTestId("proportion-bar").firstElementChild as HTMLElement;

describe("ProportionBar", () => {
  const draw = (props: Partial<React.ComponentProps<typeof ProportionBar>> = {}) =>
    render(<ProportionBar data-testid="proportion-bar" value={50} max={100} {...props} />);

  it("renders correctly", () => {
    const { container } = draw();
    expect(container).toMatchSnapshot();
  });

  it("draws a value as its share of the largest", () => {
    draw({ value: 25, max: 100 });
    expect(fill()).toHaveStyle({ width: "25%" });
  });

  /**
   * A bar of no width says "nothing" by being invisible, which is a different
   * claim from "very little". The floor keeps the smallest measurement a mark.
   */
  it("keeps the shortest bar a mark rather than nothing", () => {
    draw({ value: 1, max: 1000 });
    expect(fill()).toHaveStyle({ width: "2%" });
  });

  /**
   * One value is not a distribution. A full-width bar on the only row there is
   * would say "large" about a number it has nothing to compare with, so with no
   * scale to draw against nothing is drawn.
   */
  it("draws nothing when there is nothing to compare against", () => {
    draw({ value: 12, max: 0 });
    expect(fill()).toHaveStyle({ width: "0%" });
  });

  /** A bar wider than its own track is a bug rather than a large value. */
  it("does not overflow its track when the value passes the maximum", () => {
    draw({ value: 300, max: 100 });
    expect(fill()).toHaveStyle({ width: "100%" });
  });

  /**
   * The two hues are pinned rather than left to taste, because they were
   * chosen by measurement against the `gray-100` track they sit on:
   * `amber-700` is 4.57:1 and `gray-500` 4.39:1, over the 3:1 a mark carrying
   * meaning owes. `amber-600` is 2.91:1 there, and the theme's `warning-600`
   * was refused on its meaning as much as on its contrast.
   *
   * jsdom computes no colour, so nothing here can re-measure it: the
   * `MarksStandOut` story does, in a browser. This makes a change of hue a
   * deliberate act rather than a silent one.
   */
  it("marks the one the others are measured against", () => {
    draw({ value: 100, max: 100, peak: true });
    expect(fill()).toHaveClass("bg-amber-700");
  });

  it("draws every other bar in the quieter of the two", () => {
    draw({ value: 40, max: 100 });
    expect(fill()).toHaveClass("bg-gray-500");
  });

  /**
   * The bar says nothing the number beside it does not, so announcing it reads
   * the row twice. It is hidden rather than labelled, and that is the whole of
   * its accessibility contract: a consumer with no number to put beside it
   * wants something else.
   */
  it("is hidden from assistive technology", () => {
    draw();
    expect(screen.getByTestId("proportion-bar")).toHaveAttribute("aria-hidden", "true");
  });

  /**
   * The type omits `aria-hidden`, so this is a caller who got past it -- plain
   * JavaScript, or a cast. What makes it hold anyway is the prop order, and
   * that is the half worth asserting here: the type is a warning, this is the
   * behaviour.
   */
  it("cannot be un-hidden by a caller who gets past the type", () => {
    draw({ "aria-hidden": false } as Partial<React.ComponentProps<typeof ProportionBar>>);

    expect(screen.getByTestId("proportion-bar")).toHaveAttribute("aria-hidden", "true");
  });

  it("takes a caller's classes without dropping its own layout", () => {
    draw({ className: "h-1" });
    const track = screen.getByTestId("proportion-bar");

    expect(track).toHaveClass("h-1");
    expect(track).toHaveClass("w-full");
    // twMerge, so the caller's height wins rather than fighting.
    expect(track).not.toHaveClass("h-0.5");
  });
});
