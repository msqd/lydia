import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Inputs/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      description: "The name attribute for the radio input",
      control: "text",
    },
    label: {
      description: "The label text or node to display next to the radio button",
      control: "text",
    },
    checked: {
      description: "Whether the radio button is checked",
      control: "boolean",
    },
    disabled: {
      description: "Whether the radio button is disabled",
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
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "default-radio",
    label: "Default Radio",
  },
};

export const Checked: Story = {
  args: {
    name: "checked-radio",
    label: "Checked Radio",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    name: "disabled-radio",
    label: "Disabled Radio",
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    name: "disabled-checked-radio",
    label: "Disabled Checked Radio",
    defaultChecked: true,
    disabled: true,
  },
};

export const WithCustomClassName: Story = {
  args: {
    name: "custom-class-radio",
    label: "Custom Class Radio",
    className: "accent-primary-500",
  },
};

export const RadioGroup: Story = {
  args: {
    name: "fruit",
    label: "Radio Group Option",
  },
  render: (args) => {
    const [selected, setSelected] = useState("apple");

    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="text-lg font-medium">Favorite Fruit</div>

        <Radio
          {...args}
          value="apple"
          label="Apple"
          checked={selected === "apple"}
          onChange={(e) => e.target.checked && setSelected("apple")}
        />

        <Radio
          {...args}
          value="banana"
          label="Banana"
          checked={selected === "banana"}
          onChange={(e) => e.target.checked && setSelected("banana")}
        />

        <Radio
          {...args}
          value="cherry"
          label="Cherry"
          checked={selected === "cherry"}
          onChange={(e) => e.target.checked && setSelected("cherry")}
        />

        <div className="mt-4 text-sm text-gray-500">Selected: {selected}</div>
      </div>
    );
  },
};
