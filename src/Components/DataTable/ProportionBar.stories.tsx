import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { contrast } from "../../../.storybook/contrast";
import { ProportionBar } from "./ProportionBar";

/**
 * A value drawn against the largest one beside it.
 *
 * `1.2 s` means nothing until something else on the page is `3 ms`. One bar on
 * its own is very nearly pointless, so every story below draws a column of
 * them: the comparison is the component, and a single instance cannot show it.
 */
const meta = {
  title: "Components/DataTable/ProportionBar",
  component: ProportionBar,
  args: { value: 40, max: 100, peak: false },
  argTypes: {
    value: { description: "What this row measures", control: { type: "number" } },
    max: { description: "What the largest bar beside it measures", control: { type: "number" } },
    peak: { description: "Whether this is the one the others are measured against" },
  },
  decorators: [(Story) => <div className="w-64">{Story()}</div>],
} satisfies Meta<typeof ProportionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One bar, which is the control surface rather than the use. */
export const Default: Story = {};

const latencies = [3400, 850, 410, 120, 44, 3];

/**
 * What the bar is for: a column of numbers read as a distribution.
 *
 * The scale is the largest value in view rather than a fixed ceiling — what
 * counts as slow is a property of the traffic being looked at. Only the top
 * one is coloured; the rest are there to be compared against it.
 */
export const AColumnOfThem: Story = {
  render: () => {
    const largest = Math.max(...latencies);

    return (
      <table className="w-full text-sm">
        <tbody>
          {latencies.map((ms) => (
            <tr key={ms}>
              <td className="py-2 pr-4 text-right tabular-nums">{ms} ms</td>
              <td className="w-full py-2">
                <ProportionBar value={ms} max={largest} peak={ms === largest} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

/**
 * The smallest measurement is still a mark.
 *
 * 3 of 3400 rounds to 0%, and a bar of no width says "nothing" by being
 * invisible — a different claim from "very little". The floor is 2%.
 */
export const TheSmallestMeasurement: Story = { args: { value: 3, max: 3400 } };

/**
 * Nothing to compare against, so nothing drawn.
 *
 * One value is not a distribution: a full-width bar on the only row there is
 * would say "large" about a number that has nothing beside it. Pass `max={0}`
 * for that case rather than passing the value as its own maximum.
 */
export const NothingToCompareWith: Story = { args: { value: 1200, max: 0 } };

/**
 * A caller's own dimensions, merged rather than replacing the layout.
 *
 * The track is `h-0.5` by default, which is a mark beside a number in a dense
 * row. A taller bar is a different weight of statement and is the caller's to
 * ask for.
 */
export const Thicker: Story = { args: { value: 70, max: 100, className: "h-2 rounded-full" } };

/**
 * Both fills hold 3:1 against the track they sit on, which WCAG 1.4.11 asks of
 * a mark carrying meaning.
 *
 * Against the track and not against the page: the fill never touches the page.
 * Against white, `amber-600` passed at 3.20:1; on the `gray-100` track it is
 * 2.91:1.
 */
export const MarksStandOut: Story = {
  render: () => (
    <div className="space-y-2">
      <ProportionBar data-testid="peak" value={100} max={100} peak />
      <ProportionBar data-testid="plain" value={40} max={100} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const which of ["peak", "plain"]) {
      const track = canvasElement.querySelector(`[data-testid="${which}"]`);
      const fill = track?.firstElementChild;
      if (!track || !fill) throw new Error(`no ${which} bar drawn`);
      const ratio = contrast(getComputedStyle(fill).backgroundColor, getComputedStyle(track).backgroundColor);
      await expect(ratio, `${which} fill on its track: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    }
  },
};
