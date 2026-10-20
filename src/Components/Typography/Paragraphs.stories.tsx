import type { Meta, StoryObj } from "@storybook/react-vite";
import { P } from "./Paragraphs";

const meta = {
  title: "Components/Typography/Paragraph",
  component: P,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof P>;

export default meta;
type Story = StoryObj<typeof P>;

export const Default: Story = {
  args: {
    children: "This is a paragraph component styled with TailwindCSS.",
  },
};

export const CustomParagraph: Story = {
  args: {
    children: "This is a custom paragraph with additional classes.",
    className: "italic text-primary-700 font-semibold",
  },
};
