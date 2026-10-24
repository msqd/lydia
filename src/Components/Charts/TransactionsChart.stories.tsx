import type { Meta, StoryObj } from "@storybook/react-vite";
import type { OverviewTransaction } from "../../Models";
import { TransactionsChart } from "./TransactionsChart";

const meta: Meta<typeof TransactionsChart> = {
  title: "Components/Charts/TransactionsChart",
  component: TransactionsChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A responsive bar chart displaying transaction metrics over time with intelligent display adaptation. When bars are wide enough, it shows split bars with transaction count labels and separate error/cached indicators. When bars are too narrow (high data density), it merges into unified stacked bars for better readability. The time format automatically adapts to the provided time range (1h: minutes, 24h: hours, 7d/1m: days).",
      },
    },
  },
  argTypes: {
    data: {
      description: "Array of transaction data points with count, errors, cached values, and timestamps",
      control: "object",
    },
    timeRange: {
      description: "Time range to display (1h, 24h, 7d, 1m, 1y) - affects the date/time formatting",
      control: "select",
      options: ["1h", "24h", "7d", "1m", "1y"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate time-aware sample data that respects user perspective
const generateSampleData = (timeRange: string): OverviewTransaction[] => {
  const data: OverviewTransaction[] = [];
  const now = new Date();

  switch (timeRange) {
    case "1h": {
      // Last hour, minute by minute (60 data points)
      const startTime = new Date(now);
      startTime.setMinutes(now.getMinutes() - 59, 0, 0);

      for (let i = 0; i < 60; i++) {
        const time = new Date(startTime);
        time.setMinutes(startTime.getMinutes() + i);

        const count = Math.floor(Math.random() * 50) + 10;
        const errors = Math.floor(Math.random() * Math.floor(count * 0.15));
        const cached = Math.floor(Math.random() * Math.floor((count - errors) * 0.3));

        data.push({
          datetime: time.toISOString(),
          count,
          errors,
          cached: Math.min(cached, count - errors),
        });
      }
      break;
    }

    case "24h": {
      // Last 24 hours, hour by hour (24 data points)
      const startTime = new Date(now);
      startTime.setHours(now.getHours() - 23, 0, 0, 0);

      for (let i = 0; i < 24; i++) {
        const time = new Date(startTime);
        time.setHours(startTime.getHours() + i);

        const count = Math.floor(Math.random() * 200) + 50;
        const errors = Math.floor(Math.random() * Math.floor(count * 0.15));
        const cached = Math.floor(Math.random() * Math.floor((count - errors) * 0.3));

        data.push({
          datetime: time.toISOString(),
          count,
          errors,
          cached: Math.min(cached, count - errors),
        });
      }
      break;
    }

    case "7d": {
      // Last 7 days, day by day (7 data points)
      const startTime = new Date(now);
      startTime.setDate(now.getDate() - 6);
      startTime.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const time = new Date(startTime);
        time.setDate(startTime.getDate() + i);

        const count = Math.floor(Math.random() * 2000) + 500;
        const errors = Math.floor(Math.random() * Math.floor(count * 0.15));
        const cached = Math.floor(Math.random() * Math.floor((count - errors) * 0.3));

        data.push({
          datetime: time.toISOString(),
          count,
          errors,
          cached: Math.min(cached, count - errors),
        });
      }
      break;
    }

    case "1m": {
      // Last 30 days, day by day (30 data points)
      const startTime = new Date(now);
      startTime.setDate(now.getDate() - 29);
      startTime.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const time = new Date(startTime);
        time.setDate(startTime.getDate() + i);

        const count = Math.floor(Math.random() * 3000) + 1000;
        const errors = Math.floor(Math.random() * Math.floor(count * 0.15));
        const cached = Math.floor(Math.random() * Math.floor((count - errors) * 0.3));

        data.push({
          datetime: time.toISOString(),
          count,
          errors,
          cached: Math.min(cached, count - errors),
        });
      }
      break;
    }

    default:
      return generateSampleData("24h");
  }

  return data;
};

export const Default: Story = {
  args: {
    data: generateSampleData("24h"),
    timeRange: "24h",
  },
  parameters: {
    docs: {
      description: {
        story:
          "24-hour view with hourly data points. Shows split bars with transaction labels when bars are wide enough.",
      },
    },
  },
};

export const HourlyData: Story = {
  args: {
    data: generateSampleData("1h"),
    timeRange: "1h",
  },
  parameters: {
    docs: {
      description: {
        story:
          "1-hour view with minute-by-minute data (60 data points). Demonstrates responsive behavior with thin bars that merge errors/cached into single stacked bars with consistent ordering: errors (bottom), cached (middle), successful (top).",
      },
    },
  },
};

export const WeeklyData: Story = {
  args: {
    data: generateSampleData("7d"),
    timeRange: "7d",
  },
  parameters: {
    docs: {
      description: {
        story: "7-day view with daily data points. Wide bars show split display with transaction count labels.",
      },
    },
  },
};

export const MonthlyData: Story = {
  args: {
    data: generateSampleData("1m"),
    timeRange: "1m",
  },
  parameters: {
    docs: {
      description: {
        story: "30-day view with daily data points. Shows how the chart adapts to moderate data density.",
      },
    },
  },
};

export const ResponsiveComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Few Data Points (Wide Bars)</h3>
        <div className="border p-4 rounded">
          <TransactionsChart data={generateSampleData("7d")} timeRange="7d" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Many Data Points (Thin Bars)</h3>
        <div className="border p-4 rounded">
          <TransactionsChart data={generateSampleData("1h")} timeRange="1h" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Comparison showing how the chart adapts its display based on bar width. Wide bars show split display with labels, thin bars show unified stacked display with consistent color ordering (errors at bottom, cached in middle, successful at top).",
      },
    },
  },
};

export const NoData: Story = {
  args: {
    data: [],
  },
};
