import type { Meta, StoryObj } from "@storybook/react-vite";
import SummaryRateChart from "./SummaryRateChart";

const meta: Meta<typeof SummaryRateChart> = {
  title: "Components/Charts/SummaryRateChart",
  component: SummaryRateChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A bar chart displaying rate values over time. The chart can be customized with different colors to represent different metrics or states.",
      },
    },
  },
  argTypes: {
    data: {
      description: "Array of rate data points with values and timestamps",
      control: "object",
    },
    color: {
      description: "Optional custom color for the bars",
      control: "color",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample data for the last 24 hours
const generateSampleData = () => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() - 24 + i);

    // Generate a random value between 10 and 100
    const value = Math.floor(Math.random() * 90) + 10;

    data.push({
      value,
      datetime: time.toISOString(),
    });
  }
  return data;
};

export const Default: Story = {
  args: {
    data: generateSampleData(),
  },
};

export const WithCustomColor: Story = {
  args: {
    data: generateSampleData(),
    color: "#3b82f6",
  },
};

export const HighValues: Story = {
  args: {
    data: generateSampleData().map((item) => ({ ...item, value: Math.floor(Math.random() * 20) + 80 })),
    color: "#10b981",
  },
};

export const LowValues: Story = {
  args: {
    data: generateSampleData().map((item) => ({ ...item, value: Math.floor(Math.random() * 20) + 10 })),
    color: "#ef4444",
  },
};

export const NoData: Story = {
  args: {
    data: [],
  },
};
