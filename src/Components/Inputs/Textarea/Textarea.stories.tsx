import { ExclamationCircleIcon } from "@heroicons/react/16/solid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";
import type { TextareaProps } from "./Textarea";

const meta = {
  title: "Components/Inputs/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible textarea component for multi-line text input with various customization options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      description: "The label text for the textarea",
      control: "text",
    },
    placeholder: {
      description: "Placeholder text for the textarea",
      control: "text",
    },
    value: {
      description: "The current value of the textarea",
      control: "text",
    },
    className: {
      description: "Additional CSS classes for the container",
      control: "text",
    },
    wrapperClassName: {
      description: "Additional CSS classes for the textarea wrapper",
      control: "text",
    },
    labelClassName: {
      description: "Additional CSS classes for the label",
      control: "text",
    },
    disabled: {
      description: "Whether the textarea is disabled",
      control: "boolean",
    },
    required: {
      description: "Whether the textarea is required",
      control: "boolean",
    },
    variant: {
      description: "Visual variant for the textarea",
      control: { type: "select" },
      options: ["default", "error", "success"],
    },
    helpText: {
      description: "Help text displayed below the textarea",
      control: "text",
    },
    errorMessage: {
      description: "Error message displayed below the textarea",
      control: "text",
    },
    cornerHint: {
      description: "Text displayed in the top-right corner",
      control: "text",
    },
    rows: {
      description: "Number of visible text lines",
      control: { type: "number", min: 1 },
    },
  },
  args: {
    placeholder: "Enter text...",
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Textarea Examples

export const Default: Story = {
  args: {
    label: "Description",
    placeholder: "Enter your description",
    id: "description",
    name: "description",
  },
  parameters: {
    docs: {
      description: {
        story: "Basic textarea with label, allowing customization of placeholder and other attributes.",
      },
    },
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: "Textarea without label",
    id: "no-label",
    name: "no-label",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea field without a label, useful for inline forms or when labels are not needed.",
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    label: "Comments",
    defaultValue: "These are some initial comments that were previously saved.",
    id: "comments-with-value",
    name: "comments",
    placeholder: "Enter your comments",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea field with a pre-filled value, demonstrating default value handling.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: "Read-only comments",
    defaultValue: "These comments cannot be edited.",
    disabled: true,
    id: "disabled-comments",
    name: "comments",
    placeholder: "Enter your comments",
  },
  parameters: {
    docs: {
      description: {
        story: "Disabled textarea field that cannot be interacted with by users.",
      },
    },
  },
};

export const Required: Story = {
  args: {
    label: "Required Feedback",
    required: true,
    id: "required-feedback",
    name: "feedback",
    placeholder: "This field is required",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea field marked as required, indicated to the user that this field must be filled.",
      },
    },
  },
};

export const WithHelpText: Story = {
  args: {
    label: "Feedback",
    placeholder: "Tell us what you think",
    helpText: "Your feedback helps us improve our services.",
    helpTextId: "feedback-description",
    id: "feedback-with-help",
    name: "feedback",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea field with additional help text displayed below the input.",
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: "Feedback",
    placeholder: "Tell us what you think",
    defaultValue: "x",
    variant: "error",
    errorMessage: "Feedback must be at least 10 characters long.",
    errorId: "feedback-error",
    id: "feedback-with-error",
    name: "feedback",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea field with error state and error message to alert the user of issues with their input.",
      },
    },
  },
};

export const WithCornerHint: Story = {
  args: {
    label: "Additional Comments",
    placeholder: "Add any other comments",
    cornerHint: "Optional",
    cornerHintId: "comments-optional",
    id: "comments-optional",
    name: "comments",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea field with a hint in the corner, often used to indicate optional fields.",
      },
    },
  },
};

export const WithTrailingIcon: Story = {
  render: (args) => (
    <div className="relative">
      <Textarea {...args} />
      <div className="absolute right-3 top-10 pointer-events-none">
        <ExclamationCircleIcon className="size-5 text-red-500" aria-hidden="true" />
      </div>
    </div>
  ),
  args: {
    label: "Feedback",
    placeholder: "Tell us what you think",
    defaultValue: "Too short",
    variant: "error",
    errorMessage: "Feedback must be at least 10 characters long.",
    errorId: "feedback-error",
    id: "feedback-with-error",
    name: "feedback",
  },
};

export const CustomSizing: Story = {
  args: {
    label: "Large Textarea",
    placeholder: "Enter detailed feedback",
    rows: 8,
    id: "large-textarea",
    name: "large-feedback",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea with custom row count for displaying more visible text lines.",
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    label: "Custom Styled Textarea",
    placeholder: "Enter text with custom styling",
    wrapperClassName: "bg-gray-50",
    labelClassName: "text-primary-600",
    textareaClassName: "font-mono",
    id: "custom-styled",
    name: "custom-styled",
  },
  parameters: {
    docs: {
      description: {
        story: "Textarea with custom styling applied to different parts of the component.",
      },
    },
  },
};

export const WithCustomRows: Story = {
  args: {
    label: "Detailed Feedback",
    placeholder: "Enter your feedback here...",
    id: "custom-rows-feedback",
    rows: 8,
  },
  render: (args: TextareaProps) => <Textarea {...args} />,
};
