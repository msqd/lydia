import { EnvelopeIcon, LockClosedIcon, MagnifyingGlassIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputIcon } from "./InputIcon";

const meta: Meta<typeof InputIcon> = {
  title: "Components/Inputs/InputIcon",
  component: InputIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "radio",
      options: ["leading", "trailing"],
      description: "Position of the icon relative to the input",
    },
    size: {
      control: "radio",
      options: ["normal", "small"],
      description: "Size of the icon",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Leading: Story = {
  args: {
    position: "leading",
    children: <EnvelopeIcon />,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4 bg-gray-50">
        <div className="relative grid grid-cols-1">
          <input
            type="text"
            placeholder="Enter email"
            className="col-start-1 row-start-1 pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Trailing: Story = {
  args: {
    position: "trailing",
    children: <MagnifyingGlassIcon />,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4 bg-gray-50">
        <div className="relative grid grid-cols-1">
          <input
            type="text"
            placeholder="Search..."
            className="col-start-1 row-start-1 pr-10 w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const SmallSize: Story = {
  args: {
    position: "leading",
    size: "small",
    children: <UserIcon />,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4 bg-gray-50">
        <div className="relative grid grid-cols-1">
          <input
            type="text"
            placeholder="Username"
            className="col-start-1 row-start-1 pl-8 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const TextIcon: Story = {
  args: {
    position: "leading",
    children: <span className="text-gray-500 font-medium">$</span>,
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-4 bg-gray-50">
        <div className="relative grid grid-cols-1">
          <input
            type="number"
            placeholder="0.00"
            className="col-start-1 row-start-1 pl-8 w-full border border-gray-300 rounded-md px-3 py-2"
          />
          <Story />
        </div>
      </div>
    ),
  ],
};

export const MultipleIcons: Story = {
  render: () => (
    <div className="space-y-4 w-64 p-4 bg-gray-50">
      <div className="relative grid grid-cols-1">
        <input
          type="email"
          placeholder="Email address"
          className="col-start-1 row-start-1 pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <InputIcon position="leading">
          <EnvelopeIcon />
        </InputIcon>
      </div>

      <div className="relative grid grid-cols-1">
        <input
          type="password"
          placeholder="Password"
          className="col-start-1 row-start-1 pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <InputIcon position="leading">
          <LockClosedIcon />
        </InputIcon>
      </div>

      <div className="relative grid grid-cols-1">
        <input
          type="tel"
          placeholder="Phone number"
          className="col-start-1 row-start-1 pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <InputIcon position="leading">
          <PhoneIcon />
        </InputIcon>
      </div>
    </div>
  ),
};
