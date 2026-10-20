import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useState } from "react";
import { fn } from "storybook/test";
import { ButtonGroup, type ButtonGroupButtons } from "./ButtonGroup";

const defaultButtons: ButtonGroupButtons = [
  { key: "profile", title: "Profile" },
  { key: "settings", title: "Settings" },
  { key: "messages", title: "Messages" },
];

const meta = {
  title: "Components/Buttons/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    buttonProps: {
      control: "object",
      description: "Array of button configurations, each with a `key` and `title`.",
    },
    current: {
      control: "text",
      description: "The key of the currently selected button.",
    },
    setCurrent: {
      action: "setCurrent",
      description: "Callback function invoked when a button is clicked. Passes the key of the clicked button.",
    },
  },
  args: {
    buttonProps: defaultButtons,
    current: defaultButtons[0].key,
    setCurrent: fn(), // Default mock for setCurrent action
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper for render function to keep stories DRY
const InteractiveButtonGroup = (args: ComponentProps<typeof ButtonGroup>) => {
  const [currentUI, setCurrentUI] = useState(args.current);
  return (
    <ButtonGroup
      {...args}
      current={currentUI}
      setCurrent={(newKey) => {
        setCurrentUI(newKey);
        if (args.setCurrent) {
          args.setCurrent(newKey); // Call the Storybook action mock
        }
      }}
    />
  );
};

export const Default: Story = {
  // Args are inherited from meta.args by default
  // If we need to override, we can do it here, e.g.:
  // args: {
  //   current: defaultButtons[1].key,
  // },
  render: InteractiveButtonGroup,
};

export const AnotherSelected: Story = {
  args: {
    current: defaultButtons[1].key, // Override the current selection
  },
  render: InteractiveButtonGroup,
};

export const SingleButton: Story = {
  args: {
    buttonProps: [{ key: "home", title: "Home" }],
    current: "home",
  },
  render: InteractiveButtonGroup,
};

export const MoreButtons: Story = {
  args: {
    buttonProps: [
      { key: "one", title: "Option 1" },
      { key: "two", title: "Option 2" },
      { key: "three", title: "Option 3" },
      { key: "four", title: "Option 4" },
      { key: "five", title: "Option 5" },
    ],
    current: "three",
  },
  render: InteractiveButtonGroup,
};
