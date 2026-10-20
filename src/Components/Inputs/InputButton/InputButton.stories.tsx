import { ArrowPathIcon, MagnifyingGlassIcon, PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputButton } from "./InputButton";

const meta: Meta<typeof InputButton> = {
  title: "Components/Inputs/InputButton",
  component: InputButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "radio",
      options: ["leading", "trailing"],
      description: "Position of the button relative to the input",
    },
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Button variant style",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Trailing: Story = {
  args: {
    position: "trailing",
    children: "Apply",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-gray-50">
        <div className="flex">
          <input
            type="text"
            placeholder="Enter promo code"
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Leading: Story = {
  args: {
    position: "leading",
    children: "Search",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-gray-50">
        <div className="flex">
          <Story />
          <input
            type="text"
            placeholder="Enter search term"
            className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 border-l-0"
          />
        </div>
      </div>
    ),
  ],
};

export const WithIcon: Story = {
  args: {
    position: "trailing",
    icon: <MagnifyingGlassIcon className="h-4 w-4" />,
    children: "Search",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-gray-50">
        <div className="flex">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const IconOnly: Story = {
  args: {
    position: "trailing",
    icon: <PaperAirplaneIcon className="h-4 w-4" />,
    "aria-label": "Send message",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-gray-50">
        <div className="flex">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Primary: Story = {
  args: {
    position: "trailing",
    variant: "primary",
    children: "Submit",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-gray-50">
        <div className="flex">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    position: "trailing",
    children: "Submit",
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-gray-50">
        <div className="flex">
          <input
            type="text"
            placeholder="Required field"
            disabled
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0 bg-gray-50"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const MultipleButtons: Story = {
  render: () => (
    <div className="space-y-4 w-80 p-4 bg-gray-50">
      {/* Search input with trailing button */}
      <div className="flex">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
        />
        <InputButton position="trailing" icon={<MagnifyingGlassIcon className="h-4 w-4" />}>
          Search
        </InputButton>
      </div>

      {/* Email input with leading and trailing buttons */}
      <div className="flex">
        <InputButton position="leading" icon={<PlusIcon className="h-4 w-4" />} aria-label="Add recipient" />
        <input
          type="email"
          placeholder="recipient@example.com"
          className="flex-1 border border-gray-300 px-3 py-2 border-l-0 border-r-0"
        />
        <InputButton position="trailing" variant="primary" icon={<PaperAirplaneIcon className="h-4 w-4" />}>
          Send
        </InputButton>
      </div>

      {/* URL input with refresh button */}
      <div className="flex">
        <input
          type="url"
          placeholder="https://example.com"
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
        />
        <InputButton position="trailing" icon={<ArrowPathIcon className="h-4 w-4" />} aria-label="Refresh" />
      </div>
    </div>
  ),
};
