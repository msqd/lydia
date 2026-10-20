import type { Meta, StoryObj } from "@storybook/react-vite";
import { P } from "./Paragraphs";
import { Section } from "./Section";
import { H2 } from "./Titles";

const meta = {
  title: "Components/Typography/Section",
  component: Section,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    children: "This is a section with default styling.",
  },
};

export const WithHeadingAndParagraphs = () => (
  <Section>
    <H2>Section Title</H2>
    <P>This is a paragraph in a section. Sections are used to group related content.</P>
    <P>Here's another paragraph showing how multiple elements look in a section.</P>
  </Section>
);
WithHeadingAndParagraphs.storyName = "With Heading and Paragraphs";

export const CustomSection: Story = {
  args: {
    children: "This is a section with custom styling.",
    className: "bg-primary-50 p-4 rounded-md border border-primary-200",
  },
};
