import { DefaultLayout } from "@msqd/lydia/Components/Layouts/DefaultLayout";
import type { LinkComponentType } from "@msqd/lydia/Components/NavBar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { action } from "storybook/actions";
import { expect, fn } from "storybook/test";
import { OverviewPage } from "./OverviewPage";
import { sampleHistoryData } from "./Sections/HistorySection.samples";
import { sampleSummary } from "./Sections/SummarySection.samples";

const navigation = ["Overview", "Journal", "Explorer", "Alerts"].map((name) => ({
  name,
  href: "#",
  current: name === "Overview",
}));

// Layout wrapper for consistent page presentation
const LayoutWrapper = (Story: React.ComponentType) => (
  <DefaultLayout navBarProps={{ navigation }}>
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

// Spies on the logged action: the click shows in the Actions panel and the play function can assert it.
const onRoute = fn(action("route"));

// Stands in for the consumer's router link: it takes over the navigation instead of the browser.
const RoutedLink: LinkComponentType = ({ href, onClick, ...props }) => (
  <a
    href={href}
    onClick={(event) => {
      event.preventDefault();
      onClick?.(event);
      onRoute(href);
    }}
    {...props}
  />
);

export const RoutedLinks: Story = {
  args: {
    summary: {
      ...sampleSummary,
      links: { performance: "/transactions", transactions: "/transactions", errors: "/transactions?status=failure" },
      linkComponent: RoutedLink,
      windowLabel: "24h",
    },
    history: { timeRange: "7d", onTimeRangeChange: () => {}, ...sampleHistoryData("7d") },
  },
  play: async ({ canvas, userEvent }) => {
    const links = await canvas.findAllByRole("link", { name: /details/ });
    await userEvent.click(links[2]);
    await expect(onRoute).toHaveBeenCalledWith("/transactions?status=failure");
  },
  parameters: {
    docs: {
      description: {
        story:
          "The consumer owns the links and the window label: `links` gives each pane's target, `linkComponent` renders them through its router, `windowLabel` names the period the data covers. Without `links`, no link renders.",
      },
    },
  },
};
