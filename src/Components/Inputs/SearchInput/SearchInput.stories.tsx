import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SearchInput, type SearchInputProps } from "./SearchInput";

const meta = {
  title: "Components/Inputs/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Optional label text for the search input",
    },
    placeHolder: {
      control: "text",
      description: "Placeholder text for the search input",
    },
    search: {
      control: "text",
      description: "Initial search value",
    },
    setSearch: {
      action: "search submitted",
      description: "Function called when search is submitted",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Search",
    placeHolder: "Type to search...",
    setSearch: fn(),
  },
} satisfies Meta<SearchInputProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px]">
      <div>
        <h3 className="text-sm font-medium mb-2">With Label:</h3>
        <SearchInput label="Search" placeHolder="Type to search..." />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Without Label:</h3>
        <SearchInput placeHolder="Type to search..." />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">With Initial Value:</h3>
        <SearchInput label="Search" search="Initial search query" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">With Focus (click to try):</h3>
        <SearchInput label="Search" placeHolder="Notice the primary focus ring on container" autoFocus />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different variants of the SearchInput component.",
      },
    },
  },
};

export const UsageExample: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4 w-[400px]">
      <SearchInput {...args} label="Search Products" placeHolder="Product name, SKU..." className="max-w-md" />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Example of how to use the SearchInput in a product search context with custom styling.",
      },
    },
  },
};
