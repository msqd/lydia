import { HeadingLevel } from "@msqd/lydia/Components/Typography/HeadingLevel";
import type { FilterMeta, Filters } from "@msqd/lydia/Models/Filters";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MultipleChoiceFacet, PerformanceFacet, SingleChoiceFacet } from "./Variants";
import { FacetListCard, useFacetState } from "./index";

const meta: Meta<typeof FacetListCard> = {
  title: "Components/Facets/FacetListCard",
  component: FacetListCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    filters: {
      description: "Current filter state using unified Filters type",
    },
    title: {
      control: "text",
      description: "Custom title for the card",
    },
    showDefaultHeader: {
      control: "boolean",
      description: "Whether to show the default header",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample filter options
const statusOptions: FilterMeta[] = [
  { name: "active", label: "Active", count: 45 },
  { name: "pending", label: "Pending", count: 12 },
  { name: "inactive", label: "Inactive", count: 8 },
];

const categoryOptions: FilterMeta[] = [
  { name: "electronics", label: "Electronics", count: 23 },
  { name: "clothing", label: "Clothing", count: 18 },
  { name: "books", label: "Books", count: 15 },
];

/**
 * The facets inside the card each take their own change handler; the card never did. Kept beside
 * the args rather than in them, so spreading the args onto the card cannot pass it something it
 * does not declare.
 */
const onFiltersChange = fn();

const defaultArgs = {
  filters: {} as Filters,
  onResetFilters: fn(),
  title: "Filters",
  showDefaultHeader: true,
};

export const Default: Story = {
  args: defaultArgs,
  render: (args) => (
    <FacetListCard {...args}>
      <MultipleChoiceFacet
        name="status"
        title="Status"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
        options={statusOptions}
      />
      <SingleChoiceFacet
        name="category"
        title="Category"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
        options={categoryOptions}
      />
    </FacetListCard>
  ),
};

export const WithRangeFilter: Story = {
  args: defaultArgs,
  render: (args) => (
    <FacetListCard {...args}>
      <MultipleChoiceFacet
        name="status"
        title="Status"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
        options={statusOptions}
      />
      <PerformanceFacet
        name="tpdex"
        title="Performance Index"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
      />
    </FacetListCard>
  ),
};

export const WithFiltersApplied: Story = {
  args: {
    ...defaultArgs,
    filters: {
      status: ["active", "pending"],
      category: "electronics",
      tpdex: { min: 50, max: 85 },
    },
  },
  render: (args) => (
    <FacetListCard {...args}>
      <MultipleChoiceFacet
        name="status"
        title="Status"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
        options={statusOptions}
      />
      <SingleChoiceFacet
        name="category"
        title="Category"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
        options={categoryOptions}
      />
      <PerformanceFacet
        name="tpdex"
        title="Performance Index"
        filters={args.filters}
        onFiltersChange={onFiltersChange}
      />
    </FacetListCard>
  ),
};

export const CustomHeader: Story = {
  args: {
    ...defaultArgs,
    showDefaultHeader: false,
    headerContent: (
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary-900">Product Filters</h3>
        <span className="text-sm text-primary-600">3 applied</span>
      </div>
    ),
  },
  // A custom header draws its own heading, so the card cannot know its level:
  // the consumer says it, and the facets head one level below.
  render: (args) => (
    <FacetListCard {...args}>
      <HeadingLevel level={3}>
        <MultipleChoiceFacet
          name="status"
          title="Status"
          filters={args.filters}
          onFiltersChange={onFiltersChange}
          options={statusOptions}
        />
        <SingleChoiceFacet
          name="category"
          title="Category"
          filters={args.filters}
          onFiltersChange={onFiltersChange}
          options={categoryOptions}
        />
      </HeadingLevel>
    </FacetListCard>
  ),
};

export const InteractiveExample: Story = {
  args: defaultArgs,
  render: (args) => {
    const { filters, handleFilterChange, resetFilters } = useFacetState();

    return (
      <FacetListCard {...args} filters={filters} onResetFilters={resetFilters}>
        <MultipleChoiceFacet
          name="status"
          title="Status"
          filters={filters}
          onFiltersChange={handleFilterChange}
          options={statusOptions}
        />
        <SingleChoiceFacet
          name="category"
          title="Category"
          filters={filters}
          onFiltersChange={handleFilterChange}
          options={categoryOptions}
        />
        <PerformanceFacet
          name="tpdex"
          title="Performance Index"
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
      </FacetListCard>
    );
  },
};
