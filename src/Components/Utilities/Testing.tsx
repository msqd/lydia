import { render, screen } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { Fragment } from "react";
import { type MockInstance, expect, vi } from "vitest";
import "@testing-library/jest-dom"; // Import jest-dom for the matchers

/**
 * Custom render function that wraps RTL's render
 * This can be extended to add providers, custom queries, etc.
 */
export function customRender(ui: ReactElement, options?: RenderOptions): RenderResult {
  return render(ui, options);
}

/**
 * Stubs the computed style so theme tokens resolve to the given values. jsdom loads no stylesheet and computes no
 * `oklch()`, so a token would otherwise resolve to nothing. The map is read at call time: mutate it to retheme.
 * Undo with `restoreThemeTokens()`, which leaves other mocks alone (`vi.restoreAllMocks()` would also reset a
 * mocked module's implementation).
 */
export function stubThemeTokens(tokens: Record<string, string>) {
  themeSpy?.mockRestore();
  themeSpy = vi.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: (name: string) => tokens[name] ?? "",
  } as unknown as CSSStyleDeclaration);
  return themeSpy;
}

export function restoreThemeTokens() {
  themeSpy?.mockRestore();
  themeSpy = undefined;
}

let themeSpy: MockInstance<typeof window.getComputedStyle> | undefined;

/**
 * Types for common component variants
 */
export type VariantMap<T extends string> = Record<T, string[]>;

/**
 * Test each variant of a component and verify CSS classes
 * @param Component The component to test
 * @param variants Array of variant values to test
 * @param variantProp The name of the variant prop (e.g., 'color', 'size', 'variant')
 * @param classMap A map of variant values to expected CSS classes
 * @param testContent Text content to use for the component
 * @param baseClasses Common classes that should be present regardless of variant
 */
export function testComponentVariants<T extends string>({
  Component,
  variants,
  variantProp,
  classMap,
  testContent = "Test Content",
  baseClasses = [],
  getElement = (content: string) => screen.getByText(content),
}: {
  // Driven by prop names given at runtime, so its props cannot be typed.
  Component: React.ComponentType<any>;
  variants: T[];
  variantProp: string;
  classMap: VariantMap<T>;
  testContent?: string;
  baseClasses?: string[];
  getElement?: (content: string) => HTMLElement;
}): void {
  variants.forEach((variant) => {
    const props = { [variantProp]: variant };
    const { rerender, container } = render(<Component {...props}>{testContent}</Component>);

    const element = getElement(testContent);

    // Check that the element has the variant-specific classes
    classMap[variant].forEach((className) => {
      expect(element).toHaveClass(className);
    });

    // Check that base classes are present
    baseClasses.forEach((className) => {
      expect(element).toHaveClass(className);
    });

    // Snapshot test with a consistent naming pattern
    expect(container).toMatchSnapshot(`Component-${variantProp}-${variant}`);

    // Clean up
    rerender(<Fragment />);
  });
}

/**
 * Test that a component correctly merges custom classNames with its default styles
 * @param Component The component to test
 * @param customClass The custom class to apply
 * @param defaultClasses Default classes that should still be present
 * @param testContent Text content to use for the component
 */
export function testClassNameMerging({
  Component,
  customClass,
  defaultClasses,
  testContent = "Test Content",
  getElement = (content: string) => screen.getByText(content),
}: {
  // Driven by prop names given at runtime, so its props cannot be typed.
  Component: React.ComponentType<any>;
  customClass: string;
  defaultClasses: string[];
  testContent?: string;
  getElement?: (content: string) => HTMLElement;
}): void {
  const { container } = render(<Component className={customClass}>{testContent}</Component>);

  const element = getElement(testContent);

  // Check that the custom class is applied
  expect(element).toHaveClass(customClass);

  // Check that default classes are still present
  defaultClasses.forEach((className) => {
    expect(element).toHaveClass(className);
  });

  // Snapshot test
  expect(container).toMatchSnapshot(`Component-with-custom-class`);
}

/**
 * Test that a component correctly passes additional props to the underlying element
 * @param Component The component to test
 * @param additionalProps Additional props to pass to the component
 * @param testContent Text content to use for the component
 * @param expectations A function to run assertions on the rendered element
 */
export function testAdditionalProps({
  Component,
  additionalProps,
  testContent = "Test Content",
  expectations,
}: {
  // Driven by prop names given at runtime, so its props cannot be typed.
  Component: React.ComponentType<any>;
  // Passed through to a component whose props are unknown here.
  additionalProps: Record<string, any>;
  testContent?: string;
  expectations: (element: HTMLElement) => void;
}): void {
  const { container } = render(<Component {...additionalProps}>{testContent}</Component>);

  // Find the element - this will depend on the additional props
  // If data-testid is provided, use it
  const element = additionalProps["data-testid"]
    ? screen.getByTestId(additionalProps["data-testid"])
    : screen.getByText(testContent);

  // Run custom expectations
  expectations(element);

  // Snapshot test
  expect(container).toMatchSnapshot(`Component-with-additional-props`);
}

/**
 * Test the disabled state of a component
 * @param Component The component to test
 * @param disabledClasses Classes that should be present when disabled
 * @param testContent Text content to use for the component
 */
export function testDisabledState({
  Component,
  disabledClasses = [],
  testContent = "Disabled Component",
  getElement = (content: string) => screen.getByText(content),
}: {
  // Driven by prop names given at runtime, so its props cannot be typed.
  Component: React.ComponentType<any>;
  disabledClasses?: string[];
  testContent?: string;
  getElement?: (content: string) => HTMLElement;
}): void {
  const { container } = render(<Component disabled>{testContent}</Component>);

  const element = getElement(testContent);

  // Check that the element is disabled
  expect(element).toBeDisabled();

  // Check for disabled-specific classes
  disabledClasses.forEach((className) => {
    expect(element).toHaveClass(className);
  });

  // Snapshot test
  expect(container).toMatchSnapshot(`Component-disabled`);
}

/**
 * Provides expectations for checking component with default props
 * @param testContent Text content to use for the component
 * @param defaultClasses Classes that should be present by default
 * @param tagName The expected HTML tag name (optional)
 */
export function expectComponentDefaults({
  element,
  defaultClasses = [],
  tagName,
}: {
  element: HTMLElement;
  defaultClasses?: string[];
  tagName?: string;
}): void {
  // Basic presence check
  expect(element).toBeInTheDocument();

  // Check tag name if provided
  if (tagName) {
    expect(element.tagName).toBe(tagName.toUpperCase());
  }

  // Check default classes
  defaultClasses.forEach((className) => {
    expect(element).toHaveClass(className);
  });
}

// Export screen for convenience
export { screen };
