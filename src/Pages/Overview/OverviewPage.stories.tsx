import { DefaultLayout } from "@msqd/lydia/Components/Layouts/DefaultLayout";
import { LydiaLogotype, DefaultLogo } from "@msqd/lydia/Components/NavBar/NavBar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OverviewPage } from "./OverviewPage";
import { sampleHistoryData } from "./Sections/HistorySection.samples";
import { sampleSummary } from "./Sections/SummarySection.samples";

// Layout wrapper for consistent page presentation
const LayoutWrapper = (Story: React.ComponentType) => (
  <DefaultLayout
    navBarProps={{
      logo: <DefaultLogo />,
      brand: <LydiaLogotype />,
      // Using default navigation which includes System link
    }}
  >
    <Story />
  </DefaultLayout>
);

const meta = {
  title: "Pages/OverviewPage",
  component: OverviewPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [LayoutWrapper],
} satisfies Meta<typeof OverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// The history section is controlled: the consumer owns the selected range and loads its data.
// This wrapper holds that state and feeds sample data for whichever range is selected.
const OverviewPageDemo = () => {
  const [timeRange, setTimeRange] = useState("7d");
  return (
    <OverviewPage
      summary={sampleSummary}
      history={{ timeRange, onTimeRangeChange: setTimeRange, ...sampleHistoryData(timeRange) }}
    />
  );
};

export const Default: Story = {
  args: {
    summary: sampleSummary,
    history: { timeRange: "7d", onTimeRangeChange: () => {}, ...sampleHistoryData("7d") },
  },
  render: () => <OverviewPageDemo />,
};
