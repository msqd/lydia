import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeyboardShortcut } from "./KeyboardShortcut";

const meta: Meta<typeof KeyboardShortcut> = {
  title: "Components/Inputs/KeyboardShortcut",
  component: KeyboardShortcut,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    shortcut: {
      control: "text",
      description: "The keyboard shortcut to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    shortcut: "⌘K",
  },
};

export const CtrlKey: Story = {
  args: {
    shortcut: "Ctrl+S",
  },
};

export const Complex: Story = {
  args: {
    shortcut: "⌘⇧P",
  },
};

export const Alt: Story = {
  args: {
    shortcut: "Alt+Tab",
  },
};

export const FunctionKey: Story = {
  args: {
    shortcut: "F1",
  },
};

export const CustomStyling: Story = {
  args: {
    shortcut: "Esc",
    className: "border-blue-300 text-blue-600",
  },
};
