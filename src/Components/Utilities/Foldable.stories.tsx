import { Badge } from "@msqd/lydia/Components/Badges";
import { Button } from "@msqd/lydia/Components/Buttons";
import { Card } from "@msqd/lydia/Components/Cards";
import { P } from "@msqd/lydia/Components/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Foldable } from "./Foldable";

const meta: Meta<typeof Foldable> = {
  title: "Components/Utilities/Foldable",
  component: Foldable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Whether the foldable is open by default",
    },
    title: {
      control: "text",
      description: "Title of the foldable section",
    },
    subtitle: {
      control: "text",
      description: "Optional subtitle below the title",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the container",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Section Title",
    defaultOpen: true,
    children: (
      <div className="space-y-2">
        <P>This is some content inside the foldable section.</P>
        <P>You can put any content here that should be collapsible.</P>
      </div>
    ),
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Configuration",
    subtitle: "Manage your application settings",
    defaultOpen: true,
    children: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Enable notifications</span>
          <Badge color="green">Enabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Auto-save</span>
          <Badge color="default">Disabled</Badge>
        </div>
      </div>
    ),
  },
};

export const InitiallyClosed: Story = {
  args: {
    title: "Advanced Options",
    subtitle: "Additional configuration options",
    defaultOpen: false,
    children: (
      <div className="space-y-2">
        <P>These are advanced options that are hidden by default.</P>
        <Button size="sm">Configure Advanced Settings</Button>
      </div>
    ),
  },
};

export const NoContent: Story = {
  args: {
    title: "Empty Section",
    subtitle: "This section has no expandable content",
  },
};

export const CardWithFoldableSections: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Card className="divide-y divide-gray-200">
        <Foldable title="Account Information" subtitle="View and edit your account details" defaultOpen={true}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <P className="mt-1">John Doe</P>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <P className="mt-1">john.doe@example.com</P>
              </div>
            </div>
            <Button size="sm">Edit Profile</Button>
          </div>
        </Foldable>

        <Foldable title="Security Settings" subtitle="Manage your security preferences" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Two-factor authentication</span>
              <Badge color="green">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Login notifications</span>
              <Badge color="green">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Session timeout</span>
              <span className="text-sm text-gray-500">30 minutes</span>
            </div>
            <Button size="sm" variant="secondary">
              Manage Security
            </Button>
          </div>
        </Foldable>

        <Foldable title="API Access" subtitle="Manage your API keys and access tokens" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">ak_live_...</span>
                <Badge color="green">Active</Badge>
              </div>
              <P className="text-xs text-gray-500 mt-1">Created 2 days ago</P>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">ak_test_...</span>
                <Badge color="yellow">Test</Badge>
              </div>
              <P className="text-xs text-gray-500 mt-1">Created 1 week ago</P>
            </div>
            <Button size="sm" variant="secondary">
              Generate New Key
            </Button>
          </div>
        </Foldable>

        <Foldable title="Billing" subtitle="View your current plan and usage" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Current plan</span>
              <Badge color="primary">Pro</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Next billing date</span>
              <span className="text-sm text-gray-500">June 15, 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Monthly usage</span>
              <span className="text-sm text-gray-500">2,450 / 10,000 requests</span>
            </div>
            <Button size="sm" variant="secondary">
              Manage Billing
            </Button>
          </div>
        </Foldable>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example of using multiple Foldable components within a Card to create an organized settings panel.",
      },
    },
  },
};

export const InteractiveTest: Story = {
  args: {
    title: "Click to Toggle",
    subtitle: "This section can be expanded and collapsed",
    defaultOpen: true,
    children: (
      <div className="space-y-2">
        <P>Content is visible when expanded.</P>
        <P>Click the title to toggle visibility.</P>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // Verify content is initially visible
    expect(canvas.getByText("Content is visible when expanded.")).toBeInTheDocument();

    // Click to collapse
    await userEvent.click(button);

    // Verify content is hidden
    expect(canvas.queryByText("Content is visible when expanded.")).not.toBeInTheDocument();

    // Click to expand again
    await userEvent.click(button);

    // Verify content is visible again
    expect(canvas.getByText("Content is visible when expanded.")).toBeInTheDocument();
  },
};
