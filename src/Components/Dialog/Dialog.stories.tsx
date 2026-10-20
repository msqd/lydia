import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../Buttons/Button";
import { Dialog, DialogDescription, DialogTitle } from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

// Simple story with controlled dialog
export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Example Dialog"
          description="This is a basic dialog with title and description."
        >
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Confirm</Button>
          </div>
        </Dialog>
      </>
    );
  },
};

// Dialog with different sizes
export const Sizes: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState<Record<string, boolean>>({
      sm: false,
      md: false,
      lg: false,
    });

    const toggleDialog = (size: string) => {
      setIsOpen((prev) => ({
        ...prev,
        [size]: !prev[size],
      }));
    };

    const sizeDescriptions = {
      sm: "Small (30% viewport width)",
      md: "Medium (55% viewport width)",
      lg: "Large (80% viewport width)",
    };

    return (
      <div className="flex flex-wrap gap-2">
        {Object.keys(isOpen).map((size) => (
          <div key={size}>
            <Button onClick={() => toggleDialog(size)}>{size.toUpperCase()} Dialog</Button>

            <Dialog
              isOpen={isOpen[size]}
              onClose={() => toggleDialog(size)}
              title={`${size.toUpperCase()} Dialog`}
              description={sizeDescriptions[size as keyof typeof sizeDescriptions]}
              size={size as "sm" | "md" | "lg"}
            >
              <div className="mt-6 flex justify-end">
                <Button onClick={() => toggleDialog(size)}>Close</Button>
              </div>
            </Dialog>
          </div>
        ))}
      </div>
    );
  },
};

// Dialog with custom content
export const CustomContent: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Custom Dialog</Button>

        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="text-center">
            <DialogTitle className="text-xl font-bold text-primary-600">Custom Dialog Title</DialogTitle>

            <DialogDescription className="mt-2 text-gray-600">
              This dialog uses DialogTitle and DialogDescription components for more customization.
            </DialogDescription>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">You can add any content here, such as forms, tables, images, etc.</p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-4 rounded">Panel 1</div>
                <div className="bg-green-100 p-4 rounded">Panel 2</div>
                <div className="bg-yellow-100 p-4 rounded">Panel 3</div>
                <div className="bg-red-100 p-4 rounded">Panel 4</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setIsOpen(false)}>Save Changes</Button>
            </div>
          </div>
        </Dialog>
      </>
    );
  },
};

// Dialog with form content
export const FormDialog: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Form Dialog</Button>

        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New User"
          description="Fill in the information below to create a new user account."
        >
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsOpen(false);
              // Handle form submission
            }}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </Dialog>
      </>
    );
  },
};

// Dialog with confirmation
export const ConfirmationDialog: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleConfirm = () => {
      setIsConfirmed(true);
      setIsOpen(false);
    };

    const handleReset = () => {
      setIsConfirmed(false);
      setIsOpen(true);
    };

    return (
      <>
        {isConfirmed ? (
          <div className="text-center">
            <p className="mb-4 text-green-600 font-medium">Action confirmed successfully!</p>
            <Button onClick={handleReset}>Reset Example</Button>
          </div>
        ) : (
          <Button onClick={() => setIsOpen(true)}>Delete Item</Button>
        )}

        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Deletion"
          description="Are you sure you want to delete this item? This action cannot be undone."
          size="sm"
        >
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Delete</Button>
          </div>
        </Dialog>
      </>
    );
  },
};
