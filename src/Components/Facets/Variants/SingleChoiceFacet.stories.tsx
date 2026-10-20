import type { FilterMeta } from "@msqd/lydia/Models/Filters";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useFacetState } from "../FacetList";
import { SingleChoiceFacet } from "./SingleChoiceFacet";

const meta: Meta<typeof SingleChoiceFacet> = {
  title: "Components/Facets/Variants/SingleChoiceFacet",
  component: SingleChoiceFacet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const categoryOptions: FilterMeta[] = [
  { name: "electronics", label: "Electronics", count: 23 },
  { name: "clothing", label: "Clothing", count: 18 },
  { name: "books", label: "Books", count: 15 },
  { name: "home", label: "Home & Garden", count: 12 },
];

const defaultArgs = {
  name: "category",
  title: "Category",
  filters: {},
  onFiltersChange: fn(),
  options: categoryOptions,
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

export const WithSelectedValue: Story = {
  args: {
    ...defaultArgs,
    filters: {
      category: "electronics",
    },
  },
};

export const Closed: Story = {
  args: {
    ...defaultArgs,
    defaultOpen: false,
  },
};

export const WithFallbackName: Story = {
  args: {
    ...defaultArgs,
    options: [{ name: "NULL", label: "No Category", count: 5 }, ...categoryOptions],
    fallbackName: "Uncategorized",
  },
};

export const InteractiveExample: Story = {
  render: (args) => {
    const { filters, handleFilterChange } = useFacetState();

    return (
      <div className="w-80">
        <SingleChoiceFacet {...args} filters={filters} onFiltersChange={handleFilterChange} />
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Current filters:</strong>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
      </div>
    );
  },
  args: defaultArgs,
};
