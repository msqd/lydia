import { BarsArrowUpIcon, EnvelopeIcon, ExclamationCircleIcon, UsersIcon } from "@heroicons/react/16/solid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputAddon } from "../InputAddon";
import { InputButton } from "../InputButton";
import { Input } from "./Input";
import type { InputProps } from "./Input";

const meta = {
  title: "Components/Inputs/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Input fields allow users to enter and edit text.

This component supports various states, including error and help text, leading/trailing elements, and addons.
        `,
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    helpText: { control: "text" },
    errorMessage: { control: "text" },
    cornerHint: { control: "text" },
    disabled: { control: "boolean" },
    leadingElement: { control: false }, // Disable control for ReactNode
    trailingElement: { control: false }, // Disable control for ReactNode
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url", "date"],
    },
    variant: {
      control: { type: "radio" },
      options: ["default", "error", "success"],
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Input Examples

export const Default: Story = {
  args: {
    label: "Full Name",
    placeholder: "Jane Doe",
    id: "full-name",
  },
};

export const EmailInput: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    id: "email",
    name: "email",
  },
  parameters: {
    docs: {
      description: {
        story: "Email input field with appropriate type and placeholder.",
      },
    },
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: "Input without label",
    id: "no-label",
    name: "no-label",
    type: "text",
  },
  parameters: {
    docs: {
      description: {
        story: "Input field without a label, useful for inline forms or when labels are not needed.",
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    label: "Email",
    type: "email",
    defaultValue: "user@example.com",
    id: "email-with-value",
    name: "email",
    placeholder: "you@example.com",
  },
  parameters: {
    docs: {
      description: {
        story: "Input field with a pre-filled value, demonstrating default value handling.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: "Email",
    type: "email",
    defaultValue: "user@example.com",
    disabled: true,
    id: "disabled-email",
    name: "email",
    placeholder: "you@example.com",
  },
  parameters: {
    docs: {
      description: {
        story: "Disabled input field that cannot be interacted with by users.",
      },
    },
  },
};

export const Required: Story = {
  args: {
    label: "Required Input",
    required: true,
    id: "required-input",
    name: "required-input",
    type: "text",
    placeholder: "This field is required",
  },
  parameters: {
    docs: {
      description: {
        story: "Input field marked as required, indicated to the user that this field must be filled.",
      },
    },
  },
};

export const WithHelpText: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    helpText: "We'll only use this for spam.",
    helpTextId: "email-description",
    id: "email-with-help",
    name: "email",
  },
  parameters: {
    docs: {
      description: {
        story: "Input field with additional help text displayed below the input.",
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    defaultValue: "not-an-email",
    variant: "error",
    errorMessage: "Not a valid email address.",
    errorId: "email-error",
    id: "email-with-error",
    name: "email",
  },
  parameters: {
    docs: {
      description: {
        story: "Input field with error state and error message to alert the user of issues with their input.",
      },
    },
  },
};

export const WithCornerHint: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    cornerHint: "Optional",
    cornerHintId: "email-optional",
    id: "email-optional",
    name: "email",
  },
  parameters: {
    docs: {
      description: {
        story: "Input field with a hint in the corner, often used to indicate optional fields.",
      },
    },
  },
};

export const WithLeadingIcon: Story = {
  args: {
    label: "Email",
    id: "email-leading-icon",
    placeholder: "you@example.com",
    leadingIcon: <EnvelopeIcon />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    label: "Search",
    id: "search-trailing-icon",
    placeholder: "Search for anything...",
    trailingIcon: <BarsArrowUpIcon />,
  },
};

export const WithLeadingAndTrailingIcons: Story = {
  args: {
    label: "Account Number",
    id: "account-leading-trailing-icons",
    placeholder: "000-00-0000",
    leadingIcon: <UsersIcon />,
    trailingIcon: <ExclamationCircleIcon />,
  },
};

export const InsetLabel: Story = {
  args: {
    label: "Credit Card Number",
    id: "cc-inset",
    placeholder: "0000 0000 0000 0000",
  },
};

export const OverlappingLabel: Story = {
  args: {
    label: "Your Name",
    id: "name-overlapping",
    placeholder: "e.g. John Doe",
  },
};

export const SharedBordersVertical: Story = {
  args: {},
  render: () => (
    <div className="max-w-md">
      <Input id="sbv-1" placeholder="First Input" />
      <Input id="sbv-2" placeholder="Second Input" />
      <Input id="sbv-3" placeholder="Third Input" />
    </div>
  ),
};

export const SharedBordersHorizontal: Story = {
  args: {},
  render: () => (
    <div className="flex max-w-md">
      <Input id="sbh-1" placeholder="Input 1" />
      <Input id="sbh-2" placeholder="Input 2" />
      <Input id="sbh-3" placeholder="Input 3" />
    </div>
  ),
};

export const WithLeadingAddon: Story = {
  args: {
    id: "addon-leading",
    label: "Website URL",
    placeholder: "example.com",
  },
  render: (args: InputProps) => (
    <div className="max-w-md flex">
      <InputAddon position="leading">https://</InputAddon>
      <Input {...args} className="[&>div:nth-child(2)]:rounded-l-none [&>div:nth-child(2)]:border-l-0" />
    </div>
  ),
};

export const WithTrailingAddon: Story = {
  args: {
    id: "addon-trailing",
    label: "Price",
    placeholder: "0.00",
    type: "number",
  },
  render: (args: InputProps) => (
    <div className="max-w-md flex">
      <Input
        {...args}
        aria-describedby="addon-trailing-currency"
        className="[&>div:nth-child(2)]:rounded-r-none [&>div:nth-child(2)]:border-r-0"
      />
      <InputAddon id="addon-trailing-currency" position="trailing">
        USD
      </InputAddon>
    </div>
  ),
};

export const WithInlineLeadingAddon: Story = {
  args: {
    id: "addon-inline-leading",
    label: "Phone Number",
    placeholder: "555-000-000",
    type: "tel",
  },
  render: (args: InputProps) => (
    <div className="max-w-md">
      <Input
        {...args}
        leadingElement={
          <InputAddon position="leading" inline>
            +1
          </InputAddon>
        }
      />
    </div>
  ),
};

export const WithInlineTrailingAddon: Story = {
  args: {
    id: "addon-inline-trailing",
    label: "Weight",
    placeholder: "0",
    type: "number",
  },
  render: (args: InputProps) => (
    <div className="max-w-md">
      <Input
        {...args}
        aria-describedby="addon-inline-trailing-unit"
        trailingElement={
          <InputAddon id="addon-inline-trailing-unit" position="trailing" inline>
            kg
          </InputAddon>
        }
      />
    </div>
  ),
};

export const WithButtonAddon: Story = {
  args: {
    id: "button-addon",
    label: "Promo Code",
    placeholder: "Enter code",
  },
  render: (args: InputProps) => (
    <div className="max-w-md flex">
      <Input {...args} className="[&>div:nth-child(2)]:rounded-r-none [&>div:nth-child(2)]:border-r-0" />
      <InputButton position="trailing">Apply</InputButton>
    </div>
  ),
};

export const WithIconButtonAddon: Story = {
  args: {
    id: "icon-button-addon",
    label: "Search Users",
    placeholder: "username",
  },
  render: (args: InputProps) => (
    <div className="max-w-md flex">
      <Input {...args} className="[&>div:nth-child(2)]:rounded-r-none [&>div:nth-child(2)]:border-r-0" />
      <InputButton position="trailing" icon={<UsersIcon className="size-4" />}>
        Search
      </InputButton>
    </div>
  ),
};

export const DateInput: Story = {
  args: {
    label: "Birth Date",
    id: "birth-date",
    type: "date",
  },
};

export const SuccessVariant: Story = {
  args: {
    label: "Confirmation Code",
    id: "success-code",
    placeholder: "Enter code",
    variant: "success",
    helpText: "Code accepted!",
  },
};

export const ErrorVariant: Story = {
  args: {
    label: "Security Question",
    id: "error-question",
    placeholder: "Your answer",
    variant: "error",
    errorMessage: "Incorrect answer. Please try again.",
  },
};

export const WithKeyboardShortcut: Story = {
  args: {
    label: "Quick Search",
    id: "keyboard-shortcut",
    placeholder: "Search documentation...",
    keyboardShortcut: "⌘K",
  },
};

export const InputGrid: Story = {
  args: {},
  render: () => (
    <div className="max-w-lg space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Two Column Grid</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input id="grid-fname" label="First Name" placeholder="John" />
          <Input id="grid-lname" label="Last Name" placeholder="Doe" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">Three Column Grid with Spans</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input id="grid-address" label="Address" placeholder="123 Main St" className="col-span-2" />
          <Input id="grid-apt" label="Apt/Suite" placeholder="Apt 4B" />
          <Input id="grid-city" label="City" placeholder="Anytown" />
          <Input id="grid-state" label="State" placeholder="CA" />
          <Input id="grid-zip" label="Zip Code" placeholder="90210" />
        </div>
      </div>
    </div>
  ),
};
