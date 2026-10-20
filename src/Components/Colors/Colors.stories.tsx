import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider } from "../Toast";
import { Colors } from "./Colors";

const meta: Meta<typeof Colors> = {
  title: "Components/Colors",
  component: Colors,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A component that displays color palettes in a table layout. By default it documents the theme's own ramps, brand and status, from darkest (900) to lightest (50): these are the colors a consumer can retheme in `@theme`. Tailwind's stock palette is deliberately absent. The hex codes are extracted dynamically from the computed background colors. Click on any color to copy its hex code to the clipboard.",
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  argTypes: {
    palettes: {
      description: "Array of color palette objects with name and variants",
      control: "object",
    },
    className: {
      description: "Additional CSS classes to apply",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "The theme's four ramps: `primary` for the brand, then `success`, `warning` and `danger` for status. Colors are arranged from darkest (900) to lightest (50). The hex values are dynamically extracted from the actual computed background colors, so this table is what the theme currently resolves to rather than a copy of it. Click on any color cell to copy its hex code.",
      },
    },
  },
};
