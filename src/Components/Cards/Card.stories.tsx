import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Cards/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: "This is a card with default settings",
  },
};

export const WithoutPadding: Story = {
  args: {
    hasDefaultPadding: false,
    children: "This is a card without padding",
  },
};

export const WithoutShadowAndRounding: Story = {
  args: {
    hasDefaultShadowAndRounding: false,
    children: "This is a card without shadow and rounding",
  },
};

export const WithoutPaddingAndShadowAndRounding: Story = {
  args: {
    hasDefaultPadding: false,
    hasDefaultShadowAndRounding: false,
    children: "This is a card without padding, shadow, and rounding",
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "bg-yellow-100",
    children: "This is a card with custom background color",
  },
};

export const WithHeader: Story = {
  args: {
    header: "Card Header",
    children: "This is a card with a header",
  },
};

export const WithFooter: Story = {
  args: {
    children: "This is a card with a footer",
    footer: "Card Footer",
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    header: "Card Header",
    children: "This is a card with a header and footer",
    footer: "Card Footer",
  },
};

export const WithCustomHeaderAndFooterStyles: Story = {
  args: {
    header: "Custom Header",
    headerClassName: "bg-blue-50 font-semibold",
    children: "Card with custom header and footer styles",
    footer: "Custom Footer",
    footerClassName: "bg-gray-50 text-sm text-gray-500",
  },
};

export const WithComplexContent: Story = {
  args: {
    header: (
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dashboard Overview</h3>
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
      </div>
    ),
    children: (
      <div className="space-y-4">
        <p>This card demonstrates more complex content structure.</p>
        <div className="flex justify-between">
          <span>Metric 1</span>
          <span className="font-medium">85%</span>
        </div>
        <div className="flex justify-between">
          <span>Metric 2</span>
          <span className="font-medium">12,345</span>
        </div>
      </div>
    ),
    footer: (
      <div className="flex justify-end">
        <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
      </div>
    ),
  },
};
