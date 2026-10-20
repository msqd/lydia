import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Inputs/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      description: "The name attribute for the checkbox input",
      control: "text",
    },
    label: {
      description: "The label text or node to display next to the checkbox",
      control: "text",
    },
    checked: {
      description: "Whether the checkbox is checked",
      control: "boolean",
    },
    disabled: {
      description: "Whether the checkbox is disabled",
      control: "boolean",
    },
    containerProps: {
      description: "Props to pass to the container div",
      control: { type: "object" },
    },
    labelProps: {
      description: "Props to pass to the label element",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "default-checkbox",
    label: "Default Checkbox",
  },
};

export const Checked: Story = {
  args: {
    name: "checked-checkbox",
    label: "Checked Checkbox",
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    name: "indeterminate-checkbox",
    label: "Some, not all",
    indeterminate: true,
  },
};

export const Disabled: Story = {
  args: {
    name: "disabled-checkbox",
    label: "Disabled Checkbox",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    name: "disabled-checked-checkbox",
    label: "Disabled Checked Checkbox",
    defaultChecked: true,
    disabled: true,
  },
};

export const WithCustomClassName: Story = {
  args: {
    name: "custom-class-checkbox",
    label: "Custom Class Checkbox",
    className: "accent-primary-500",
  },
};

export const Interactive: Story = {
  args: {
    name: "interactive-checkbox",
    label: "Interactive Checkbox",
  },
  render: (args) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
      <div className="p-4">
        <Checkbox {...args} checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
        <div className="mt-4 text-sm text-gray-500">Current state: {isChecked ? "Checked" : "Unchecked"}</div>
      </div>
    );
  },
};

export const WithInteractionTest: Story = {
  args: {
    name: "test-checkbox",
    label: "Test Checkbox",
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the checkbox input by its label
    const checkbox = canvas.getByLabelText("Test Checkbox");

    // Assert initial state
    expect(checkbox).not.toBeChecked();

    // Click the checkbox
    await userEvent.click(checkbox);

    // Assert the checkbox is now checked
    expect(checkbox).toBeChecked();

    // Verify the onChange handler was called
    expect(args.onChange).toHaveBeenCalled();

    // Click again to uncheck
    await userEvent.click(checkbox);

    // Assert the checkbox is now unchecked
    expect(checkbox).not.toBeChecked();
  },
};
