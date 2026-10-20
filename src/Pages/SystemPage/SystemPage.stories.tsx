import { sampleTopology } from "@msqd/lydia/Elements/System/NetworkMap.samples";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SystemPage } from "./SystemPage";

const meta: Meta<typeof SystemPage> = {
  title: "Pages/SystemPage",
  component: SystemPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    topology: sampleTopology,
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SystemPage>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: "bg-gray-50 p-4",
  },
};
