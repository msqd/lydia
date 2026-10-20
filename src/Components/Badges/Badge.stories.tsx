import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badges/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: [
        "default",
        "primary",
        "success",
        "warning",
        "danger",
        "green",
        "yellow",
        "orange",
        "red",
        "blue",
        "purple",
      ],
      description: "Status preset (success, warning, danger) or palette preset (a fixed hue)",
    },
    size: {
      control: "select",
      options: ["default", "jumbo"],
      description: "Size: inline pill (default) or hero number (jumbo)",
    },
    children: {
      control: "text",
      description: "Content",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  args: {
    color: "default",
    children: "Lorem ipsum",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Default badge",
  },
};

export const Custom: Story = {
  args: {
    children: "Custom badge",
    className: "px-4 py-2 text-sm",
  },
};

export const StatusPresets: Story = {
  name: "Status presets (reach for these first)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Say what a thing means. These follow the theme's status tokens, so retheming `danger` moves every failure badge in the product at once.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="success">Healthy</Badge>
      <Badge color="warning">Degraded</Badge>
      <Badge color="danger">Unhealthy</Badge>
      <Badge color="primary">Primary</Badge>
      <Badge>Default</Badge>
    </div>
  ),
};

export const PalettePresets: Story = {
  name: "Palette presets (identity only)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Say what a thing is. Fixed hues that carry no judgement, for categories a product colour-codes by convention. `RequestMethodBadge` uses them: GET is green because it is GET, not because it succeeded. Never use one to express a status, or retheming will leave it behind.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="green">GET</Badge>
      <Badge color="orange">POST</Badge>
      <Badge color="yellow">PUT</Badge>
      <Badge color="red">DELETE</Badge>
      <Badge color="purple">PATCH</Badge>
      <Badge color="blue">OPTIONS</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge size="default">Default</Badge>
      <Badge size="jumbo" className="bg-white ring-1 text-black">
        1234 <span className="font-light">/min</span>
      </Badge>
    </div>
  ),
};
