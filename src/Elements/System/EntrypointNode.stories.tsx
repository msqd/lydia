import type { Meta, StoryObj } from "@storybook/react-vite";
import { EntrypointNode } from "./EntrypointNode";

const meta: Meta<typeof EntrypointNode> = {
  title: "Elements/System/EntrypointNode",
  component: EntrypointNode,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EntrypointNode>;

export const Payments: Story = {
  args: {
    entrypoint: {
      id: "ep-payments",
      name: "payments",
      port: 8080,
      path: "/api/payments",
    },
  },
};

export const Admin: Story = {
  args: {
    entrypoint: {
      id: "ep-admin",
      name: "admin",
      port: 9000,
      path: "/admin",
    },
  },
};

export const LongNames: Story = {
  args: {
    entrypoint: {
      id: "ep-long",
      name: "very-long-service-name",
      port: 8080,
      path: "/api/very/long/path/structure",
    },
  },
};
