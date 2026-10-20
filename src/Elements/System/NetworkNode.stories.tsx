import { Badge } from "@msqd/lydia/Components/Badges";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EndpointNode } from "./EndpointNode";
import { EntrypointNode } from "./EntrypointNode";
import { NetworkNode, NetworkNodeDetail } from "./NetworkNode";
import { ProxyNode } from "./ProxyNode";

const meta: Meta<typeof NetworkNode> = {
  title: "Elements/System/NetworkNode",
  component: NetworkNode,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "The shell every node in the network map is drawn in: box, border, radius, height and title row.",
          "",
          "The three node kinds differ in what they show, not in how they are framed. Reach for `NetworkNode`",
          "when adding a fourth, rather than copying one of the three, so the map keeps one frame.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    tone: { control: "radio", options: ["blue", "green", "purple"] },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tone: "blue",
    title: "public-api",
    action: (
      <Badge color="blue" className="text-xs px-1 py-0">
        8080
      </Badge>
    ),
    children: <NetworkNodeDetail>/v1</NetworkNodeDetail>,
  },
};

export const Tones: Story = {
  args: { tone: "blue", title: "node" },
  render: () => (
    <div className="space-y-2">
      <NetworkNode tone="blue" title="entrypoint" />
      <NetworkNode tone="green" title="endpoint" />
      <NetworkNode tone="purple" title="proxy" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "One tone per kind of node. The tone is the only thing the frame varies.",
      },
    },
  },
};

export const TheThreeNodes: Story = {
  args: { tone: "blue", title: "node" },
  render: () => (
    <div className="space-y-2">
      <EntrypointNode entrypoint={{ id: "e1", name: "public-api", port: 8080, path: "/v1" }} />
      <ProxyNode proxy={{ id: "p1", name: "edge", implementation: "harp" }} />
      <EndpointNode endpoint={{ id: "n1", name: "users-api", url: "https://users.internal/v1", health: "healthy" }} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The three kinds as the map draws them, all on this shell. Same frame, different content: one has a port, one a health badge on the title row, one its badge in the body.",
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    tone: "green",
    title: "an endpoint whose name is far longer than the box that holds it",
    action: (
      <Badge color="success" className="text-xs px-1 py-0">
        healthy
      </Badge>
    ),
    children: <NetworkNodeDetail>https://a.very.long.internal.hostname.example/v1/some/deep/path</NetworkNodeDetail>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A node has a fixed height in the map, so the title and the detail line truncate rather than wrap, and the action keeps its space.",
      },
    },
  },
};
