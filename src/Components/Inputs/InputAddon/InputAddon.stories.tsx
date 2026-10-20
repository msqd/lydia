import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../Input";
import { InputAddon } from "./InputAddon";

const meta: Meta<typeof InputAddon> = {
  title: "Components/Inputs/InputAddon",
  component: InputAddon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Leading or trailing decoration for an input: a protocol prefix, a currency, a unit, a dialling code.

A boxed addon sits beside the input and carries its own outline. An inline addon sits inside the
input's outline, passed through the input's \`leadingElement\` or \`trailingElement\`.

Its content carries meaning, so unlike \`InputIcon\` it stays in the accessibility tree. Give it an
\`id\` and point the input's \`aria-describedby\` at it, so a screen reader announces the unit along
with the field.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "radio",
      options: ["leading", "trailing"],
      description: "Position of the addon relative to the input",
    },
    inline: {
      control: "boolean",
      description: "Render inside the input's outline rather than as a box beside it",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const squareLeadingEdge = "[&>div:nth-child(2)]:rounded-l-none [&>div:nth-child(2)]:border-l-0";
const squareTrailingEdge = "[&>div:nth-child(2)]:rounded-r-none [&>div:nth-child(2)]:border-r-0";

export const Leading: Story = {
  args: {
    position: "leading",
    children: "https://",
  },
  render: (args) => (
    <div className="w-80 flex">
      <InputAddon {...args} />
      <Input id="addon-story-url" label="Website URL" placeholder="example.com" className={squareLeadingEdge} />
    </div>
  ),
};

export const Trailing: Story = {
  args: {
    position: "trailing",
    id: "addon-story-currency",
    children: "USD",
  },
  render: (args) => (
    <div className="w-80 flex">
      <Input
        id="addon-story-price"
        label="Price"
        type="number"
        placeholder="0.00"
        aria-describedby="addon-story-currency"
        className={squareTrailingEdge}
      />
      <InputAddon {...args} />
    </div>
  ),
};

export const InlineLeading: Story = {
  args: {
    position: "leading",
    inline: true,
    children: "+1",
  },
  render: (args) => (
    <div className="w-80">
      <Input
        id="addon-story-phone"
        label="Phone number"
        type="tel"
        placeholder="555-000-000"
        leadingElement={<InputAddon {...args} />}
      />
    </div>
  ),
};

export const InlineTrailing: Story = {
  args: {
    position: "trailing",
    inline: true,
    id: "addon-story-unit",
    children: "kg",
  },
  render: (args) => (
    <div className="w-80">
      <Input
        id="addon-story-weight"
        label="Weight"
        type="number"
        placeholder="0"
        aria-describedby="addon-story-unit"
        trailingElement={<InputAddon {...args} />}
      />
    </div>
  ),
};

export const Both: Story = {
  args: {
    children: "https://",
  },
  render: () => (
    <div className="w-80 flex">
      <InputAddon position="leading">https://</InputAddon>
      <Input
        id="addon-story-domain"
        label="Domain"
        placeholder="example"
        aria-describedby="addon-story-tld"
        className="[&>div:nth-child(2)]:rounded-none [&>div:nth-child(2)]:border-x-0"
      />
      <InputAddon id="addon-story-tld" position="trailing">
        .com
      </InputAddon>
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    position: "leading",
    children: "postgresql://",
  },
  render: (args) => (
    <div className="w-64 flex">
      <InputAddon {...args} />
      <Input id="addon-story-dsn" label="Connection string" placeholder="user@host/db" className={squareLeadingEdge} />
    </div>
  ),
};
