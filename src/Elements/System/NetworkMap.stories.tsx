import type { Meta, StoryObj } from "@storybook/react-vite";
import { NetworkMap } from "./NetworkMap";
import { sampleTopology } from "./NetworkMap.samples";

const meta: Meta<typeof NetworkMap> = {
  title: "Elements/System/NetworkMap",
  component: NetworkMap,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    topology: sampleTopology,
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NetworkMap>;

export const Default: Story = {
  args: {},
};

export const FullWidth: Story = {
  args: {},
  parameters: {
    layout: "fullscreen",
  },
};

export const Constrained: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "800px", margin: "20px auto" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};
