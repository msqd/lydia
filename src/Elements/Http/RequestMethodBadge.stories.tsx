import { RequestMethodBadge } from "@msqd/lydia/Elements/Http/RequestMethodBadge";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Elements/Http/RequestMethod",
  component: RequestMethodBadge,
  tags: ["autodocs"],
  argTypes: {
    method: {
      control: "select",
      options: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      description: "HTTP method",
    },
  },
  args: {
    method: "GET",
  },
} satisfies Meta<typeof RequestMethodBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    method: "GET",
  },
};

export const All: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-wrap flex-col gap-2 items-center">
      <div className="flex flex-wrap gap-2">
        <RequestMethodBadge method="GET" />
        <RequestMethodBadge method="POST" />
        <RequestMethodBadge method="PUT" />
        <RequestMethodBadge method="PATCH" />
        <RequestMethodBadge method="DELETE" />
        <RequestMethodBadge method="OPTIONS" />
      </div>
      <div className="flex flex-wrap gap-2">
        <RequestMethodBadge method="HEAD" />
        <RequestMethodBadge method="TRACE" />
        <RequestMethodBadge method="CONNECT" />
        <RequestMethodBadge method="CUSTOM" />
        <RequestMethodBadge method="UNKNOWN" />
        <RequestMethodBadge method="FOO" />
      </div>
    </div>
  ),
};
