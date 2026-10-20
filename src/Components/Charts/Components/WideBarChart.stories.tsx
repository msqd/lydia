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
import { createWideBarSeries } from "./WideBarChart";

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

const labelOption = {
  show: true,
  rotate: 90,
  formatter: "{c}",
  fontSize: 12,
  color: "#065f9f",
  rich: {
    name: {},
  },
};

// Chart wrapper component for stories
const WideBarChartStory = ({
  data = sampleData,
  timeRange = "24h",
  containerWidth = 800,
  showLabels = true,
}: {
  data?: typeof sampleData;
  timeRange?: string;
  containerWidth?: number;
  showLabels?: boolean;
}) => {
  const chartAreaWidth = containerWidth - 80;

  const barConfig = ChartBarCalculator.calculateBarConfig({
    dataLength: data.length,
    chartAreaWidth,
    containerWidth,
    // Force wide bars for this story
    minBarWidth: 20,
    maxBarWidth: 60,
  });

  // Force wide bars for stories
  const wideBarConfig = {
    ...barConfig,
    useSplitBars: true,
    showLabels: showLabels && barConfig.showLabels,
  };

  const series = createWideBarSeries({
    data,
    barConfig: wideBarConfig,
    labelOption: showLabels ? labelOption : undefined,
  });

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
      formatter: ChartTooltipFormatter.formatSplitBarsTooltip,
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

const meta: Meta<typeof WideBarChartStory> = {
  title: "Components/Charts/WideBarChart",
  component: WideBarChartStory,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Wide bar chart component that displays transaction data with separate bars for main transactions and detail bars for errors/cached data. Used when container width allows for detailed visualization.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    containerWidth: {
      control: { type: "range", min: 400, max: 1200, step: 50 },
      description: "Container width for the chart",
    },
    timeRange: {
      control: "select",
      options: ["1h", "24h", "7d", "1m", "1y"],
      description: "Time range for formatting x-axis labels",
    },
    showLabels: {
      control: "boolean",
      description: "Whether to show value labels on bars",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    containerWidth: 800,
    timeRange: "24h",
    showLabels: true,
  },
};

export const WithoutLabels: Story = {
  args: {
    containerWidth: 800,
    timeRange: "24h",
    showLabels: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Wide bars without value labels for cleaner appearance.",
      },
    },
  },
};

export const Wide: Story = {
  args: {
    containerWidth: 1000,
    timeRange: "24h",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Wide bars in a large container with plenty of space for detailed visualization.",
      },
    },
  },
};

export const FewDataPoints: Story = {
  args: {
    data: sampleData.slice(0, 3),
    containerWidth: 600,
    timeRange: "24h",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Wide bars with few data points, showing how bars expand to fill available space.",
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
    containerWidth: 800,
    timeRange: "7d",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Weekly data with 7d time range formatting and wide bar display.",
      },
    },
  },
};

export const HighErrorRate: Story = {
  args: {
    data: sampleData.map((d) => ({
      ...d,
      errors: Math.floor(d.count * 0.25),
      cached: Math.floor(d.count * 0.4),
    })),
    containerWidth: 800,
    timeRange: "24h",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Data with high error and cache rates to demonstrate the split bar visualization clearly.",
      },
    },
  },
};

export const VaryingLoad: Story = {
  args: {
    data: [
      { datetime: "2024-01-01T00:00:00Z", count: 50, errors: 1, cached: 10 },
      { datetime: "2024-01-01T01:00:00Z", count: 300, errors: 20, cached: 100 },
      { datetime: "2024-01-01T02:00:00Z", count: 25, errors: 0, cached: 5 },
      { datetime: "2024-01-01T03:00:00Z", count: 450, errors: 35, cached: 150 },
      { datetime: "2024-01-01T04:00:00Z", count: 150, errors: 8, cached: 45 },
    ],
    containerWidth: 800,
    timeRange: "24h",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Data with varying load levels to show how wide bars handle different scales.",
      },
    },
  },
};
