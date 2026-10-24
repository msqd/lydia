import { fireEvent } from "@testing-library/react";
import type { SyntheticEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  customRender,
  expectComponentDefaults,
  screen,
  testAdditionalProps,
  testClassNameMerging,
  testComponentVariants,
  testDisabledState,
} from "../Utilities/Testing";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";

describe("Button", () => {
  it("renders with default props (primary variant, md size)", () => {
    const { container } = customRender(<Button>Default Button</Button>);
    const button = screen.getByText("Default Button");

    expectComponentDefaults({
      element: button,
      defaultClasses: [
        "text-white",
        "bg-primary-500",
        "ring-primary-600",
        "rounded-sm",
        "px-2.5",
        "py-1.5",
        "text-sm",
        "font-semibold",
      ],
      tagName: "BUTTON",
    });

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders all variants correctly", () => {
    const variants: ButtonVariant[] = ["primary", "secondary"];

    const variantClassMap: Record<ButtonVariant, string[]> = {
      primary: ["text-white", "bg-primary-500", "ring-primary-600"],
      secondary: ["bg-white", "text-gray-900", "ring-gray-300"],
    };

    testComponentVariants({
      Component: Button,
      variants,
      variantProp: "variant",
      classMap: variantClassMap,
      testContent: "Test Button",
      baseClasses: ["font-semibold", "cursor-pointer", "shadow-xs"],
    });
  });

  it("renders all sizes correctly", () => {
    const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

    const sizeClassMap: Record<ButtonSize, string[]> = {
      xs: ["rounded-sm", "px-2", "py-1", "text-xs"],
      sm: ["rounded-sm", "px-2", "py-1", "text-sm"],
      md: ["rounded-sm", "px-2.5", "py-1.5", "text-sm"],
      lg: ["rounded-sm", "px-3", "py-2", "text-sm"],
      xl: ["rounded-sm", "px-3.5", "py-2.5", "text-sm"],
    };

    testComponentVariants({
      Component: Button,
      variants: sizes,
      variantProp: "size",
      classMap: sizeClassMap,
      testContent: "Test Size Button",
      baseClasses: ["font-semibold", "cursor-pointer", "shadow-xs"],
    });
  });

  it("renders in disabled state", () => {
    testDisabledState({
      Component: Button,
      disabledClasses: ["disabled:cursor-not-allowed", "disabled:text-gray-400"],
      testContent: "Disabled Button",
    });
  });

  it("merges custom className with default styles", () => {
    testClassNameMerging({
      Component: Button,
      customClass: "custom-class",
      defaultClasses: ["bg-primary-500", "px-2.5", "py-1.5", "font-semibold", "shadow-xs"],
      testContent: "Custom Button",
    });
  });

  it("handles onClick events", () => {
    const handleClick = vi.fn();
    customRender(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByText("Click Me");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("doesn't trigger onClick when disabled", () => {
    const handleClick = vi.fn();
    customRender(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>,
    );

    const button = screen.getByText("Click Me");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("passes additional props to the button element", () => {
    testAdditionalProps({
      Component: Button,
      additionalProps: { "data-testid": "button-element", "aria-label": "test button" },
      testContent: "Test Button",
      expectations: (button) => {
        expect(button).toHaveAttribute("aria-label", "test button");
      },
    });
  });

  describe("inside a form", () => {
    it("renders type=button by default", () => {
      customRender(<Button>Cancel</Button>);
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("type", "button");
    });

    it("does not submit the form by default", () => {
      const onSubmit = vi.fn((event: SyntheticEvent) => event.preventDefault());
      customRender(
        <form onSubmit={onSubmit}>
          <Button>Cancel</Button>
        </form>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits the form with type=submit", () => {
      const onSubmit = vi.fn((event: SyntheticEvent) => event.preventDefault());
      customRender(
        <form onSubmit={onSubmit}>
          <Button type="submit">Save</Button>
        </form>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });
});
