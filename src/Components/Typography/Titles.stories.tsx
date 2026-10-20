import type { Meta, StoryObj } from "@storybook/react-vite";
import { H1, H2, H3, H4, H5, H6 } from "./Titles";

const meta = {
  title: "Components/Typography/Titles",
  component: H1, // Using H1 as the primary component
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof H1>;

export default meta;
type Story = StoryObj<typeof H1>;

export const Default: Story = {
  args: {
    children: "This is an H1 Heading",
  },
};

export const AllHeadings = () => (
  <div className="space-y-6">
    <H1>H1: A big title</H1>
    <H2>H2: Still a big title, but not so much</H2>
    <H3>H3: A less pretentious title</H3>
    <H4>H4: Quite an humble title</H4>
    <H5>H5: Getting timid</H5>
    <H6>H6: Or very discret</H6>
  </div>
);
AllHeadings.storyName = "All Headings";
