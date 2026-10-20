import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cards } from "./index";

const meta: Meta<typeof Cards.StatCard> = {
  title: "Components/Cards/StatCard",
  component: Cards.StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Total Users",
    value: "1,234",
    unit: "users",
  },
};

export const WithTrendUp: Story = {
  args: {
    title: "Active Users",
    value: "567",
    trend: { value: 10, direction: "up", label: "vs last month" },
  },
};

export const WithTrendDown: Story = {
  args: {
    title: "Inactive Users",
    value: "89",
    trend: { value: 5, direction: "down", label: "vs last month" },
  },
};

export const WithIcon: Story = {
  args: {
    title: "Conversion Rate",
    value: "25",
    unit: "%",
    icon: <span>🚀</span>,
  },
};
