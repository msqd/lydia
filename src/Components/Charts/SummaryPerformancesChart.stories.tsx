import type { Meta, StoryObj } from "@storybook/react-vite";
import SummaryPerformancesChart from "./SummaryPerformancesChart";

const meta: Meta<typeof SummaryPerformancesChart> = {
  title: "Components/Charts/SummaryPerformancesChart",
  component: SummaryPerformancesChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A line chart displaying TPDEX (Transaction Performance Index) scores over time. The chart uses a color-coded visual map based on the TPDEX scale, from A++ (excellent, teal) to G (poor, red). Hover over data points to see detailed performance ratings.",
      },
    },
  },
  argTypes: {
    data: {
      description: "Array of performance data points with TPDEX values and timestamps",
      control: "object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample data covering the full TPDEX range (A++ to G)
const generateFullRangeData = () => {
  const data = [];
  const now = new Date();

  // Create data that spans from A++ (98+) to G (0-16) over 24 hours
  for (let i = 0; i < 24; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() - 24 + i);

    // Map time to score: start high, gradually decrease with some variation
    const progress = i / 23; // 0 to 1
    const baseScore = 99 - progress * 85; // Start at 99, end around 14
    const noise = (Math.random() - 0.5) * 10; // Add some randomness
    const score = Math.max(5, Math.min(100, baseScore + noise));

    data.push({
      value: Math.round(score),
      datetime: time.toISOString(),
    });
  }
  return data;
};

// Generate data with realistic performance patterns but covering different TPDEX ranges
const generateRangeData = (startRange: [number, number], endRange: [number, number]) => {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() - 24 + i);

    const progress = i / 23;
    const startScore = startRange[0] + Math.random() * (startRange[1] - startRange[0]);
    const endScore = endRange[0] + Math.random() * (endRange[1] - endRange[0]);
    const score = startScore + progress * (endScore - startScore);
    const noise = (Math.random() - 0.5) * 5;

    data.push({
      value: Math.round(Math.max(0, Math.min(100, score + noise))),
      datetime: time.toISOString(),
    });
  }
  return data;
};

export const Default: Story = {
  args: {
    data: generateFullRangeData(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A comprehensive performance chart showing TPDEX scores spanning the full range from A++ (excellent) to G (poor) over 24 hours. All rating levels are visible in the legend.",
      },
    },
  },
};

export const HighToMediumPerformance: Story = {
  args: {
    data: generateRangeData([98, 100], [70, 85]), // A++ to C range
  },
  parameters: {
    docs: {
      description: {
        story: "Performance transition from excellent (A++) to acceptable (C) levels with natural variations.",
      },
    },
  },
};

export const MediumToLowPerformance: Story = {
  args: {
    data: generateRangeData([85, 95], [20, 40]), // A to E/F range
  },
  parameters: {
    docs: {
      description: {
        story: "System experiencing significant performance degradation from good (A) to poor (E/F) levels.",
      },
    },
  },
};

export const VolatilePerformance: Story = {
  args: {
    data: (() => {
      const data = [];
      const now = new Date();

      for (let i = 0; i < 24; i++) {
        const time = new Date(now);
        time.setHours(now.getHours() - 24 + i);

        // Highly volatile performance across all TPDEX ranges
        const score = Math.random() * 100; // Random score from 0-100

        data.push({
          value: Math.round(score),
          datetime: time.toISOString(),
        });
      }
      return data;
    })(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Highly unstable system with performance scores spanning the entire TPDEX scale from A++ to G with extreme volatility.",
      },
    },
  },
};

export const NoData: Story = {
  args: {
    data: [],
  },
};
