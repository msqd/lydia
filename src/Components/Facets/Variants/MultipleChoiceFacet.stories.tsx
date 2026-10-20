import type { FilterMeta } from "@msqd/lydia/Models/Filters";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useFacetState } from "../FacetList";
import { type FacetOption, MultipleChoiceFacet } from "./MultipleChoiceFacet";

const meta: Meta<typeof MultipleChoiceFacet> = {
  title: "Components/Facets/Variants/MultipleChoiceFacet",
  component: MultipleChoiceFacet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const methodOptions: FilterMeta[] = [
  { name: "GET", label: "GET", count: 543 },
  { name: "POST", label: "POST", count: 234 },
  { name: "PUT", label: "PUT", count: 123 },
  { name: "DELETE", label: "DELETE", count: 45 },
  { name: "PATCH", label: "PATCH", count: 23 },
];

const defaultArgs = {
  name: "method",
  title: "Method",
  filters: {},
  onFiltersChange: fn(),
  options: methodOptions,
  defaultOpen: true,
};

export const Default: Story = {
  args: defaultArgs,
};

/** The counts are of all transactions, and the caption under the heading says so. */
export const CountsCaption: Story = {
  args: defaultArgs,
};

export const CountsCaptionReworded: Story = {
  args: { ...defaultArgs, countsCaption: "Totals for the whole period" },
};

export const WithoutCounts: Story = {
  args: { ...defaultArgs, options: defaultArgs.options.map(({ count: _count, ...option }) => option) },
};

export const WithSelectedValues: Story = {
  args: {
    ...defaultArgs,
    filters: {
      method: ["GET", "POST"],
    },
  },
};

export const WithSingleSelection: Story = {
  args: {
    ...defaultArgs,
    filters: {
      method: ["GET"],
    },
  },
};

export const InteractiveExample: Story = {
  render: (args) => {
    const { filters, handleFilterChange } = useFacetState();

    return (
      <div className="w-80">
        <MultipleChoiceFacet {...args} filters={filters} onFiltersChange={handleFilterChange} />
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Current filters:</strong>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
      </div>
    );
  },
  args: defaultArgs,
};

/**
 * Every "only" button a keyboard reaches is visible while it has focus.
 *
 * The button sits beside each value's checkbox and shows when the row is
 * hovered, which a keyboard never does. It stays in the tab order, so without
 * a reveal on focus, Tab lands on a control nobody can see (WCAG 2.4.7). It
 * only exists while a value is chosen, hence the GET filter.
 * Measured in a browser, from the computed opacity of what holds each button,
 * since jsdom computes no style.
 */
export const OnlyIsVisibleWhenFocused: Story = {
  args: { ...defaultArgs, filters: { method: ["GET"] } },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const buttons = within(canvasElement).getAllByRole("button", { name: "only" });
    const hidden: string[] = [];

    for (const [index, button] of buttons.entries()) {
      while (document.activeElement !== button) {
        await user.tab();
        if (document.activeElement === document.body) throw new Error(`Tab never reached "only" #${index + 1}`);
      }
      // Each ancestor's opacity multiplies, so the button is as visible as the
      // least opaque thing it sits in. waitFor appends the whole DOM to a
      // failure's message, so only its first line is kept.
      await waitFor(() => {
        let seen = 1;
        for (let at: Element | null = button; at && at !== canvasElement; at = at.parentElement) {
          seen *= Number(getComputedStyle(at).opacity);
        }
        if (seen < 1) throw new Error(`only #${index + 1} at opacity ${seen}`);
      }).catch((error: Error) => hidden.push(error.message.split("\n")[0]));
    }

    await expect(hidden).toEqual([]);
  },
};

/**
 * "only" sits right after the value's name, and nothing moves when it comes or goes.
 *
 * The counts form one right-aligned column whether a row offers "only" or not
 * (the selected value does not), and a row's count stays put when "only" is
 * revealed by hovering it. Measured in a browser, since jsdom lays nothing out.
 */
export const OnlyKeepsCountsStill: Story = {
  args: { ...defaultArgs, filters: { method: ["GET"] } },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const rowOf = (name: string) =>
      canvas.getByRole("checkbox", { name: new RegExp(name) }).closest<HTMLElement>("[role=group] > div")!;
    const edges = (row: HTMLElement, name: string, count: number) => ({
      name: within(row).getByText(name).getBoundingClientRect(),
      count: within(row).getByText(String(count)).getBoundingClientRect(),
      only: within(row).queryByRole("button", { name: "only" })?.getBoundingClientRect(),
    });

    const before = methodOptions.map(({ name, count }) => edges(rowOf(name), name, count!));
    await expect(new Set(before.map((row) => row.count.right)).size).toBe(1);

    for (const [index, { name, count }] of methodOptions.entries()) {
      const row = rowOf(name);
      await user.hover(row);
      const shown = edges(row, name, count!);
      await expect(shown.count.right).toBe(before[index].count.right);
      await expect(shown.count.left).toBe(before[index].count.left);
      if (shown.only) {
        await expect(shown.only.left).toBeGreaterThanOrEqual(shown.name.right);
        await expect(shown.only.right).toBeLessThanOrEqual(shown.count.left);
      }
      await user.unhover(row);
    }
  },
};

/** A name too long for the row is cut short; "only" and a 7-digit count keep their place. */
export const LongNameIsTruncated: Story = {
  args: {
    ...defaultArgs,
    filters: { method: ["GET"] },
    options: [
      { name: "long", label: "A value whose name is far too long to fit in a narrow facet", count: 1234567 },
      ...methodOptions,
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole("checkbox", { name: /far too long/ }).closest<HTMLElement>("[role=group] > div")!;
    const name = within(row).getByText(/far too long/);
    const only = within(row).getByRole("button", { name: "only" }).getBoundingClientRect();
    const count = within(row).getByText("1234567").getBoundingClientRect();

    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    await expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(only.left);
    // Touching is not clear of it: a gap keeps "only" from reading as part of the number.
    await expect(only.right + 8).toBeLessThanOrEqual(count.left);
    await expect(count.right).toBeLessThanOrEqual(row.getBoundingClientRect().right);
  },
};

const statusOptions: FacetOption[] = [
  {
    name: "2",
    label: "2xx",
    description: "Success",
    count: 756,
    under: [
      { name: "200", count: 701 },
      { name: "204", count: 55 },
    ],
  },
  {
    name: "4",
    label: "4xx",
    description: "Client Error",
    count: 123,
    under: [
      { name: "400", count: 18 },
      { name: "404", count: 97 },
      { name: "422", count: 8 },
    ],
  },
  {
    name: "5",
    label: "5xx",
    description: "Server Error",
    count: 31,
    under: [
      { name: "500", count: 4 },
      { name: "502", count: 27 },
    ],
  },
  { name: "failure", count: 3 },
];

function NestedFacet({ initial, ...args }: ComponentProps<typeof MultipleChoiceFacet> & { initial?: string[] }) {
  const { filters, handleFilterChange } = useFacetState(initial ? { status: initial } : {});
  return (
    <div className="w-80">
      <MultipleChoiceFacet {...args} filters={filters} onFiltersChange={handleFilterChange} />
      <p className="mt-2 text-xs text-gray-700">
        Filters: <output className="rounded bg-gray-100 px-1 font-mono">{JSON.stringify(filters)}</output>
      </p>
    </div>
  );
}

const nestedArgs = { ...defaultArgs, name: "status", title: "Status", options: statusOptions };

/**
 * Codes nested under their class (ADR 0002). Classes start folded; ticking a class unfolds it. Untick a code of a
 * ticked class to exclude it: the class stays partly ticked and an "except" line shows what is left out.
 */
export const NestedValues: Story = {
  args: nestedArgs,
  render: (args) => <NestedFacet {...args} />,
};

/**
 * A `description` is the long form of a short label: a tooltip on hover, and the checkbox's accessible description
 * for screen readers.
 */
export const WithDescriptions: Story = {
  args: nestedArgs,
  render: (args) => <NestedFacet {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("4xx")).toHaveAttribute("title", "Client Error");
    await expect(canvas.getByRole("checkbox", { name: /^4xx/ })).toHaveAccessibleDescription("Client Error");
  },
};

/** A class holding a selection starts unfolded: class minus codes on 4xx, one code on 5xx, a flat value. */
export const NestedWithSelection: Story = {
  args: nestedArgs,
  render: (args) => <NestedFacet {...args} initial={["4", "-404", "-422", "502", "failure"]} />,
};

/** The interaction table of ADR 0002 in one run. Hidden from the sidebar, run by the story tests. */
export const NestedWalkthrough: Story = {
  tags: ["!dev", "!autodocs"],
  args: nestedArgs,
  render: (args) => <NestedFacet {...args} />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const box = (name: string) => canvas.getByRole("checkbox", { name: new RegExp(`^${name}(\\s|$)`) });
    const expectFilters = async (expected: object) =>
      await expect(canvas.getByRole("status").textContent).toBe(JSON.stringify(expected));
    const rowOf = (name: string) => box(name).closest<HTMLElement>(".group")!;
    const pressOnly = async (name: string) => {
      await user.hover(rowOf(name));
      await user.click(within(rowOf(name)).getByRole("button", { name: "only" }));
    };

    await expectFilters({});
    await expect(canvas.queryByRole("checkbox", { name: /^404/ })).toBeNull();

    await user.click(canvas.getByRole("button", { name: "4xx codes" }));
    await user.click(box("404"));
    await expectFilters({ status: ["404"] });
    await expect(box("4xx")).toBePartiallyChecked();

    await user.click(box("422"));
    await expectFilters({ status: ["404", "422"] });

    await user.click(box("400"));
    await expectFilters({ status: ["4"] });
    await expect(box("4xx")).toBeChecked();

    await user.click(box("404"));
    await expectFilters({ status: ["4", "-404"] });
    await expect(box("4xx")).toHaveAccessibleDescription("Client Error except 404");

    await user.click(box("422"));
    await expectFilters({ status: ["4", "-404", "-422"] });

    await user.click(canvas.getByRole("button", { name: "Include 404 again" }));
    await expectFilters({ status: ["4", "-422"] });

    await user.click(box("422"));
    await expectFilters({ status: ["4"] });

    await user.click(box("4xx"));
    await expectFilters({});
    await expect(canvas.queryByRole("checkbox", { name: /^404/ })).toBeNull();

    await user.click(box("4xx"));
    await expectFilters({ status: ["4"] });
    await expect(box("404")).toBeVisible();

    await user.click(box("failure"));
    await expectFilters({ status: ["4", "failure"] });

    await pressOnly("404");
    await expectFilters({ status: ["404"] });

    await pressOnly("5xx");
    await expectFilters({ status: ["5"] });

    await user.click(canvas.getByRole("link", { name: "Reset Status" }));
    await expectFilters({});
  },
};
