import type { Meta, StoryObj } from "@storybook/react-vite";
import ReactEChartsCore from "echarts-for-react/lib/core.js";
import { BarChart } from "echarts/charts";
import { DatasetComponent, GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

import { defaultEchartOptions } from "../../../Settings";
import { ChartBarCalculator } from "../Utils/ChartBarCalculator";
import { ChartTooltipFormatter } from "../Utils/ChartTooltipFormatter";
import { TimeFormatter } from "../Utils/TimeFormatter";
import { createThinBarSeries } from "./ThinBarChart";

// Register the required components
echarts.use([BarChart, CanvasRenderer, GridComponent, TooltipComponent, TitleComponent, DatasetComponent]);

// Sample data for stories
const sampleData = [
  { datetime: "2024-01-01T00:00:00Z", count: 120, errors: 5, cached: 30 },
  { datetime: "2024-01-01T01:00:00Z", count: 150, errors: 8, cached: 40 },
  { datetime: "2024-01-01T02:00:00Z", count: 80, errors: 2, cached: 20 },
  { datetime: "2024-01-01T03:00:00Z", count: 200, errors: 12, cached: 60 },
  { datetime: "2024-01-01T04:00:00Z", count: 90, errors: 3, cached: 25 },
];

// Chart wrapper component for stories
const ThinBarChartStory = ({
  data = sampleData,
  timeRange = "24h",
  containerWidth = 600,
}: {
  data?: typeof sampleData;
  timeRange?: string;
  containerWidth?: number;
}) => {
  const chartAreaWidth = containerWidth - 80;

  const barConfig = ChartBarCalculator.calculateBarConfig({
    dataLength: data.length,
    chartAreaWidth,
    containerWidth,
    // Force thin bars for this story
    wideBarGapWidth: 4,
    thinBarGapWidth: 2,
    minBarWidth: 3,
    maxBarWidth: 20, // Lower max to force thin bars
  });

  const series = createThinBarSeries({ data, barConfig });

  const options = {
    ...defaultEchartOptions,
    xAxis: {
      type: "category",
      data: data.map((x) => TimeFormatter.formatTick(x.datetime, timeRange)),
    },
    yAxis: {
      type: "value",
      min: 0,
    },
    tooltip: {
      ...defaultEchartOptions.tooltip,
      formatter: (params: any[]) => ChartTooltipFormatter.formatUnifiedBarsTooltip(params, data),
    },
    series,
  };

  return (
    <div style={{ width: `${containerWidth}px`, height: "300px", border: "1px solid #e5e7eb" }}>
      <ReactEChartsCore
        echarts={echarts}
        option={options}
        notMerge={true}
        lazyUpdate={true}
        opts={{ height: 300, width: containerWidth }}
      />
    </div>
  );
};

const meta: Meta<typeof ThinBarChartStory> = {
  title: "Components/Charts/ThinBarChart",
  component: ThinBarChartStory,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Thin bar chart component that displays transaction data in a compact stacked format. Used when container width is limited or data density is high.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    containerWidth: {
      control: { type: "range", min: 200, max: 1000, step: 50 },
      description: "Container width for the chart",
    },
    timeRange: {
      control: "select",
      options: ["1h", "24h", "7d", "1m", "1y"],
      description: "Time range for formatting x-axis labels",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    containerWidth: 400,
    timeRange: "24h",
  },
};

export const Narrow: Story = {
  args: {
    containerWidth: 250,
    timeRange: "24h",
  },
  parameters: {
    docs: {
      description: {
        story: "Thin bars in a very narrow container, showing how the component adapts to limited space.",
      },
    },
  },
};

export const HighDensity: Story = {
  args: {
    data: Array.from({ length: 24 }, (_, i) => ({
      datetime: `2024-01-01T${i.toString().padStart(2, "0")}:00:00Z`,
      count: Math.floor(Math.random() * 200) + 50,
      errors: Math.floor(Math.random() * 10),
      cached: Math.floor(Math.random() * 50) + 10,
    })),
    containerWidth: 600,
    timeRange: "24h",
  },
  parameters: {
    docs: {
      description: {
        story: "High density data (24 data points) showing how thin bars handle many data points efficiently.",
      },
    },
  },
};

export const WeeklyData: Story = {
  args: {
    data: Array.from({ length: 7 }, (_, i) => ({
      datetime: `2024-01-0${i + 1}T12:00:00Z`,
      count: Math.floor(Math.random() * 300) + 100,
      errors: Math.floor(Math.random() * 15),
      cached: Math.floor(Math.random() * 80) + 20,
    })),
    containerWidth: 500,
    timeRange: "7d",
  },
  parameters: {
    docs: {
      description: {
        story: "Weekly data with 7d time range formatting.",
      },
    },
  },
};

export const NoErrors: Story = {
  args: {
    data: sampleData.map((d) => ({ ...d, errors: 0 })),
    containerWidth: 400,
    timeRange: "24h",
  },
  parameters: {
    docs: {
      description: {
        story: "Data with no errors, showing only cached and successful transactions.",
      },
    },
  },
};

export const HighErrorRate: Story = {
  args: {
    data: sampleData.map((d) => ({ ...d, errors: Math.floor(d.count * 0.3) })),
    containerWidth: 400,
    timeRange: "24h",
  },
  parameters: {
    docs: {
      description: {
        story: "Data with high error rate (30%) to show error visualization in thin bars.",
      },
    },
  },
};
