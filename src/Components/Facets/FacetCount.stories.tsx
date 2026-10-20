import type { Meta, StoryObj } from "@storybook/react-vite";
import { FacetCount } from "./FacetCount";

const meta = {
  title: "Components/Facets/FacetCount",
  component: FacetCount,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    count: {
      control: "number",
      description: "The count value to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof FacetCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 42,
  },
};

export const Zero: Story = {
  args: {
    count: 0,
  },
};

export const LargeNumber: Story = {
  args: {
    count: 123456,
  },
};

export const WithCustomStyling: Story = {
  args: {
    count: 99,
    className: "ml-4 font-semibold",
  },
};

export const InContext: Story = {
  render: (args) => (
    <div className="bg-white p-4 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between w-64">
        <span className="text-sm text-gray-700">Filter Option</span>
        <FacetCount {...args} />
      </div>
    </div>
  ),
  args: {
    count: 256,
  },
};

export const MultipleInList: Story = {
  args: { count: 1543 },
  render: () => (
    <div className="bg-white p-4 border rounded-lg shadow-sm space-y-2">
      <div className="flex items-center justify-between w-64">
        <span className="text-sm text-gray-700">Success (2xx)</span>
        <FacetCount count={1543} />
      </div>
      <div className="flex items-center justify-between w-64">
        <span className="text-sm text-gray-700">Client Error (4xx)</span>
        <FacetCount count={87} />
      </div>
      <div className="flex items-center justify-between w-64">
        <span className="text-sm text-gray-700">Server Error (5xx)</span>
        <FacetCount count={3} />
      </div>
    </div>
  ),
};
