import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FacetResetLink } from "./FacetResetLink";

const meta = {
  title: "Components/Facets/FacetResetLink",
  component: FacetResetLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onReset: fn() },
  argTypes: {
    title: {
      control: "text",
      description: "Title/label for the facet being reset",
    },
    onReset: {
      action: "reset",
      description: "Click handler for reset action",
    },
  },
} satisfies Meta<typeof FacetResetLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Status",
  },
};

export const LongTitle: Story = {
  args: {
    title: "Performance Index Range Filter",
  },
};

export const InContext: Story = {
  render: (args) => (
    <div className="bg-white p-4 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filter Name</h3>
        <FacetResetLink {...args} />
      </div>
    </div>
  ),
  args: {
    title: "Filter Name",
  },
};
