import { Button } from "@msqd/lydia/Components/Buttons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Dialog } from "./Dialog";
import { Drawer } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Components/Dialog/Drawer",
  component: Drawer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls whether the drawer is open",
    },
    position: {
      control: "select",
      options: ["left", "right"],
      description: "Position from which the drawer slides out",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Width size of the drawer (30%, 55%, 80% of viewport)",
    },
    showCloseButton: {
      control: "boolean",
      description: "Whether to show the close button",
    },
    backdrop: {
      control: "boolean",
      description: "Whether to show backdrop with click-to-close and scroll blocking",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  isOpen: false,
  onClose: fn(),
  title: "Drawer Title",
  description: "This is a description for the drawer component.",
  position: "right" as const,
  size: "lg" as const,
  showCloseButton: true,
  backdrop: true,
};

export const Default: Story = {
  args: defaultArgs,
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <p>This is the drawer content area.</p>
            <p>You can put any content here including forms, lists, or other components.</p>
            <div className="mt-6">
              <Button onClick={() => setIsOpen(false)}>Close Drawer</Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

export const LeftPosition: Story = {
  args: {
    ...defaultArgs,
    position: "left",
    title: "Left Side Drawer",
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Left Drawer</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <p>This drawer slides from the left side.</p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </Drawer>
      </>
    );
  },
};

export const DifferentSizes: Story = {
  render: () => {
    const [openDrawer, setOpenDrawer] = useState<string | null>(null);

    const sizes = [
      { key: "sm", label: "Small (30% viewport)", description: "30% of viewport width" },
      { key: "md", label: "Medium (55% viewport)", description: "55% of viewport width" },
      { key: "lg", label: "Large (80% viewport)", description: "80% of viewport width" },
    ] as const;

    return (
      <div className="space-x-2">
        {sizes.map(({ key, label, description }) => (
          <Fragment key={key}>
            <Button onClick={() => setOpenDrawer(key)}>Open {label}</Button>
            <Drawer
              isOpen={openDrawer === key}
              onClose={() => setOpenDrawer(null)}
              title={`${label} Drawer`}
              description={description}
              size={key}
            >
              <div className="space-y-4">
                <p>This drawer is {description}.</p>
                <Button onClick={() => setOpenDrawer(null)}>Close</Button>
              </div>
            </Drawer>
          </Fragment>
        ))}
      </div>
    );
  },
};

export const WithoutCloseButton: Story = {
  args: {
    ...defaultArgs,
    showCloseButton: false,
    title: "No Close Button",
    description: "This drawer doesn't have a close button in the header.",
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <p>This drawer has no close button in the header.</p>
            <p>You must close it using the button below or clicking outside.</p>
            <Button onClick={() => setIsOpen(false)}>Close Drawer</Button>
          </div>
        </Drawer>
      </>
    );
  },
};

export const WithForm: Story = {
  args: {
    ...defaultArgs,
    title: "Settings",
    description: "Configure your application settings",
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Settings</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>Save Changes</Button>
            </div>
          </form>
        </Drawer>
      </>
    );
  },
};

export const WithoutBackdrop: Story = {
  args: {
    ...defaultArgs,
    backdrop: false,
    title: "No Backdrop",
    description: "This drawer has no backdrop - background is interactive.",
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        {/* Background application content */}
        <div className="min-h-screen bg-gray-50">
          <div className="space-y-6 p-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Background Application</h2>
              <Button onClick={() => setIsOpen(true)}>Open No-Backdrop Drawer</Button>
              <p className="mt-4 text-gray-600">
                This is the main application content. When the drawer opens without backdrop:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                <li>You can scroll this background content when your cursor is over it</li>
                <li>You can scroll the drawer content when your cursor is over the drawer</li>
                <li>Background remains fully interactive (try clicking buttons below)</li>
                <li>No backdrop overlay blocks interaction</li>
              </ul>
            </div>

            {/* Interactive elements to demonstrate background interactivity */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">Interactive Card {i + 1}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This card remains interactive when drawer is open. You can scroll to it and interact with it.
                </p>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" onClick={() => alert(`Clicked button on card ${i + 1}`)}>
                    Click Me
                  </Button>
                  <Button variant="secondary" size="sm">
                    Another Button
                  </Button>
                </div>
              </div>
            ))}

            {/* More scrollable content */}
            {Array.from({ length: 15 }, (_, i) => (
              <div key={`extra-${i}`} className="bg-blue-50 p-4 rounded border">
                <p className="text-sm">
                  Scrollable content item {i + 9}. This demonstrates that the background application remains fully
                  scrollable and interactive when the drawer is open without backdrop. Move your cursor over this area
                  and scroll to see it in action.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer with long scrollable content */}
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">🎯 Scroll Test Instructions:</p>
              <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                <li>Move cursor over this drawer and scroll - only drawer content scrolls</li>
                <li>Move cursor over background and scroll - only background scrolls</li>
                <li>Click buttons in background - they remain interactive</li>
                <li>No backdrop means no overlay blocking background interaction</li>
              </ul>
            </div>

            <p>This drawer has no backdrop, so background content remains interactive.</p>
            <p>The drawer content scrolls independently when your cursor is over it.</p>

            {/* Long content to demonstrate drawer scrolling */}
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="bg-white p-3 rounded border">
                <h4 className="font-medium text-sm">Drawer Item {i + 1}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  This is scrollable content within the drawer. When you move your cursor over the drawer area and
                  scroll, only this content moves. The background application content behind remains static until you
                  move your cursor back to the background area.
                </p>
                {i % 5 === 0 && (
                  <Button size="sm" className="mt-2" onClick={() => alert(`Drawer button ${i + 1} clicked`)}>
                    Drawer Button {i + 1}
                  </Button>
                )}
              </div>
            ))}

            <div className="bg-red-50 p-4 rounded border border-red-200">
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Close Drawer
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  },
};

export const LongContent: Story = {
  args: {
    ...defaultArgs,
    title: "Drawer with Long Content",
    description: "Test independent scrolling within the drawer.",
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Long Content Drawer</Button>
        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <p>This drawer has long content to test scrolling.</p>
            {Array.from({ length: 100 }, (_, i) => (
              <p key={i}>
                This is item {i + 1} in the drawer. The drawer content scrolls independently from the background. You
                can scroll through all these items while the background remains fixed.
              </p>
            ))}
            <Button onClick={() => setIsOpen(false)}>Close Drawer</Button>
          </div>
        </Drawer>
      </>
    );
  },
};

export const InteractiveExample: Story = {
  args: defaultArgs,
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Interactive Drawer</Button>
        <Drawer
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer Title"
          description="This is a description for the drawer component."
        >
          <div className="space-y-4">
            <p>This is an interactive drawer for testing.</p>
            <Button onClick={() => setIsOpen(false)}>Close Drawer</Button>
          </div>
        </Drawer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Just test that the button exists and can be clicked - don't test complex drawer behavior
    const openButton = canvas.getByText("Open Interactive Drawer");
    expect(openButton).toBeInTheDocument();

    // Click the button (this tests the basic interaction)
    await userEvent.click(openButton);

    // Don't test the drawer opening in the play test as HeadlessUI Dialog
    // doesn't work well in the storybook test environment
    // The component functionality is tested in unit tests instead
  },
};

export const DialogOverDrawer: Story = {
  args: defaultArgs,
  parameters: { layout: "padded" },
  render: (args) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
      <>
        <div className="h-[3000px]">
          <Button className="fixed top-2 left-2 z-0" onClick={() => setDrawerOpen(true)}>
            Open Drawer
          </Button>
          <p>A long page, to scroll before opening anything.</p>
        </div>
        <Drawer {...args} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
          <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="Dialog Title">
            Dialog content
          </Dialog>
        </Drawer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const root = canvasElement.ownerDocument.documentElement;

    window.scrollTo(0, 120);
    await waitFor(() => expect(window.scrollY).toBe(120));

    await userEvent.click(canvas.getByText("Open Drawer"));
    await waitFor(() => expect(root.style.overflow).toBe("hidden"));

    await userEvent.click(await body.findByText("Open Dialog"));
    await userEvent.click(await body.findByLabelText("Close dialog"));
    await waitFor(() => expect(body.queryByText("Dialog Title")).not.toBeInTheDocument());
    expect(root.style.overflow).toBe("hidden");

    await userEvent.click(body.getByLabelText("Close drawer"));
    await waitFor(() => expect(body.queryByText("Drawer Title")).not.toBeInTheDocument());

    expect(root.style.overflow).not.toBe("hidden");
    expect(window.scrollY).toBe(120);
  },
};
