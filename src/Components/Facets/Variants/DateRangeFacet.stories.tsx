import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useFacetState } from "../FacetList";
import { DateRangeFacet } from "./DateRangeFacet";

const meta: Meta<typeof DateRangeFacet> = {
  title: "Components/Facets/Variants/DateRangeFacet",
  component: DateRangeFacet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  name: "dateRange",
  title: "Date Range",
  filters: {},
  onFiltersChange: fn(),
  defaultOpen: true,
  startDatePlaceholder: "Start date",
  endDatePlaceholder: "End date",
};

export const Default: Story = {
  args: defaultArgs,
};

export const WithPreselectedDates: Story = {
  args: {
    ...defaultArgs,
    filters: {
      dateRange: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    },
  },
};

export const StartAfterEnd: Story = {
  args: {
    ...defaultArgs,
    filters: {
      dateRange: {
        startDate: "2024-02-01",
        endDate: "2024-01-01",
      },
    },
  },
};

export const Closed: Story = {
  args: {
    ...defaultArgs,
    defaultOpen: false,
  },
};

export const CustomPlaceholders: Story = {
  args: {
    ...defaultArgs,
    startDatePlaceholder: "From",
    endDatePlaceholder: "To",
    title: "Filter by Date",
  },
};

export const InteractiveExample: Story = {
  render: (args) => {
    const { filters, handleFilterChange } = useFacetState();

    return (
      <div className="w-80">
        <DateRangeFacet {...args} filters={filters} onFiltersChange={handleFilterChange} />
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
          <strong>Current filters:</strong>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
      </div>
    );
  },
  args: defaultArgs,
};
