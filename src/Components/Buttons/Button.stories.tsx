import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button";

// Reusable render function for button stories
const renderButtonVariant = (props: ButtonProps) => (
  <div className="flex items-center gap-2">
    <Button {...props} />
    <Button {...props} disabled>
      {props.children} (disabled)
    </Button>
  </div>
);

const meta = {
  title: "Components/Buttons",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
      description: "Button variant",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Button size",
    },
    children: {
      control: "text",
      description: "Button content",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    onClick: {
      action: "clicked",
      description: "Click handler",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  args: {
    variant: "primary",
    size: "md",
    children: "Button",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
  render: renderButtonVariant,
};

export const WithInteractionTest: Story = {
  args: {
    children: "Click Me",
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByText("Click Me");

    // Verify button is in the document
    expect(button).toBeInTheDocument();

    // Click the button
    await userEvent.click(button);

    // Verify onClick was called
    expect(args.onClick).toHaveBeenCalled();
    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
  render: renderButtonVariant,
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
  render: renderButtonVariant,
};

export const Custom: Story = {
  args: {
    children: "Custom",
    className: "px-4 py-2 rounded-full text-xl",
  },
  render: renderButtonVariant,
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
    const variants: ButtonVariant[] = ["primary", "secondary"];
    return (
      <div className="space-y-6">
        {variants.map((variant) => (
          <div key={variant}>
            <h3 className="text-xl font-semibold mb-3 capitalize">{variant} Buttons</h3>
            {sizes.map((size) => (
              <div key={size} className="mb-4">
                <p className="text-md font-medium capitalize mb-1">
                  {size} ({variant})
                </p>
                {renderButtonVariant({
                  variant,
                  size,
                  children: `Button ${size.toUpperCase()}`,
                  onClick: fn(),
                  disabled: false,
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
