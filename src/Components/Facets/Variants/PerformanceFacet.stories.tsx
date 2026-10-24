import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useFacetState } from "../FacetList";
import { PerformanceFacet } from "./PerformanceFacet";

const meta: Meta<typeof PerformanceFacet> = {
  title: "Components/Facets/Variants/PerformanceFacet",
  component: PerformanceFacet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  name: "tpdex",
  title: "Performance Index",
  filters: {},
  onFiltersChange: fn(),
  defaultOpen: true,
};

export const Default: Story = {
  args: defaultArgs,
};

export const WithSelectedRange: Story = {
  args: {
    ...defaultArgs,
    filters: {
      tpdex: { min: 83, max: 96 }, // B to A+ range
    },
  },
};

export const WithThresholdBetweenMarks: Story = {
  args: {
    ...defaultArgs,
    filters: {
      tpdex: { min: 50 },
    },
  },
};

export const InteractiveExample: Story = {
  render: (args) => {
    const { filters, handleFilterChange } = useFacetState();

    return (
      <div className="w-80">
        <PerformanceFacet {...args} filters={filters} onFiltersChange={handleFilterChange} />
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Current filters:</strong>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
      </div>
    );
  },
  args: defaultArgs,
};
