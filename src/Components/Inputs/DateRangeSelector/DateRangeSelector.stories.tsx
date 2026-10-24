import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateRangeSelector } from "./DateRangeSelector";
import type { DateRange } from "./DateRangeSelector";

const meta = {
  title: "Components/Inputs/DateRangeSelector",
  component: DateRangeSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      description: "The label text for the date range selector",
      control: "text",
    },
    value: {
      description: "The current date range values",
      control: "object",
    },
    startDatePlaceholder: {
      description: "Placeholder text for the start date input",
      control: "text",
    },
    endDatePlaceholder: {
      description: "Placeholder text for the end date input",
      control: "text",
    },
    onChange: {
      description: "Callback when date range changes",
      action: "onChange",
    },
    className: {
      description: "Additional CSS classes",
      control: "text",
    },
  },
  args: {
    label: "Date Range",
    startDatePlaceholder: "Start date",
    endDatePlaceholder: "End date",
  },
} satisfies Meta<typeof DateRangeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInitialValue: Story = {
  args: {
    value: {
      startDate: "2025-05-01",
      endDate: "2025-05-31",
    },
  },
};

export const WithError: Story = {
  args: {
    value: {
      startDate: "2025-05-31",
      endDate: "2025-05-01",
    },
  },
};

export const WithErrorWithoutLabel: Story = {
  args: {
    ...WithError.args,
    label: undefined,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
  },
};

export const WithCustomPlaceholders: Story = {
  args: {
    startDatePlaceholder: "From",
    endDatePlaceholder: "To",
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [dateRange, setDateRange] = useState<DateRange>({
      startDate: "2025-05-01",
      endDate: "2025-05-31",
    });

    return (
      <div className="w-[400px] p-4 flex flex-col gap-4">
        <DateRangeSelector {...args} value={dateRange} onChange={setDateRange} />

        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium mb-2">Selected Date Range:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Start Date</span>
              <span className="font-medium">{dateRange.startDate || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">End Date</span>
              <span className="font-medium">{dateRange.endDate || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive example showing real-time date range selection.",
      },
    },
  },
};

export const UsageExample: Story = {
  render: (args) => {
    const [dateRange, setDateRange] = useState<DateRange>({
      startDate: "",
      endDate: "",
    });
    const [filters, setFilters] = useState({
      today: false,
      thisWeek: false,
      thisMonth: false,
    });

    const handleFilterChange = (key: keyof typeof filters) => {
      // If enabling this filter, clear other filters and date range
      if (!filters[key]) {
        setFilters({
          today: key === "today",
          thisWeek: key === "thisWeek",
          thisMonth: key === "thisMonth",
        });
        setDateRange({ startDate: "", endDate: "" });
      } else {
        // Just disable the active filter
        setFilters({
          ...filters,
          [key]: false,
        });
      }
    };

    const handleRangeChange = (range: DateRange) => {
      setDateRange(range);
      // Clear quick filters when using custom date range
      if (range.startDate || range.endDate) {
        setFilters({ today: false, thisWeek: false, thisMonth: false });
      }
    };

    return (
      <div className="w-[400px] p-4 bg-white rounded-md shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Date</h3>

        <div className="mb-4">
          <DateRangeSelector {...args} label="Custom Date Range" value={dateRange} onChange={handleRangeChange} />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="today"
              checked={filters.today}
              onChange={() => handleFilterChange("today")}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="today" className="text-sm text-gray-700">
              Today only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="this-week"
              checked={filters.thisWeek}
              onChange={() => handleFilterChange("thisWeek")}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="this-week" className="text-sm text-gray-700">
              This week
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="this-month"
              checked={filters.thisMonth}
              onChange={() => handleFilterChange("thisMonth")}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="this-month" className="text-sm text-gray-700">
              This month
            </label>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-2">Active Filter:</h4>
          <div className="text-sm">
            {filters.today && <span className="text-primary-600">Today only</span>}
            {filters.thisWeek && <span className="text-primary-600">This week</span>}
            {filters.thisMonth && <span className="text-primary-600">This month</span>}
            {!filters.today &&
              !filters.thisWeek &&
              !filters.thisMonth &&
              (dateRange.startDate || dateRange.endDate ? (
                <div className="flex flex-col gap-1">
                  <span className="text-primary-600">Custom Range:</span>
                  <div className="flex items-center gap-1 font-medium">
                    <span>{dateRange.startDate || "Any"}</span>
                    <span className="text-gray-500">to</span>
                    <span>{dateRange.endDate || "Any"}</span>
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">No date filter applied</span>
              ))}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Advanced example showing date range filtering with predefined options.",
      },
    },
  },
};
