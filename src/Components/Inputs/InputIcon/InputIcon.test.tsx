import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { describe, expect, it } from "vitest";
import { customRender, screen } from "../../Utilities/Testing";
import { InputIcon } from "./InputIcon";

describe("InputIcon", () => {
  it("renders with default props", () => {
    customRender(
      <InputIcon position="leading">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const icon = screen.getByTestId("envelope-icon");
    expect(icon).toBeInTheDocument();
  });

  it("renders in leading position", () => {
    const { container } = customRender(
      <InputIcon position="leading">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass("ml-3");
    expect(iconContainer).not.toHaveClass("justify-self-end");
  });

  it("renders in trailing position", () => {
    const { container } = customRender(
      <InputIcon position="trailing">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass("mr-3", "justify-self-end");
    expect(iconContainer).not.toHaveClass("ml-3");
  });

  it("renders with normal size by default", () => {
    const { container } = customRender(
      <InputIcon position="leading">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass("size-5");
    expect(iconContainer).not.toHaveClass("sm:size-4");
  });

  it("renders with small size when specified", () => {
    const { container } = customRender(
      <InputIcon position="leading" size="small">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass("sm:size-4");
    expect(iconContainer).not.toHaveClass("size-5");
  });

  it("applies custom className", () => {
    const { container } = customRender(
      <InputIcon position="leading" className="custom-class">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass("custom-class");
  });

  it("has correct accessibility attributes", () => {
    const { container } = customRender(
      <InputIcon position="leading">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveAttribute("aria-hidden", "true");
  });

  it("passes through additional props", () => {
    const { container } = customRender(
      <InputIcon position="leading" title="Email icon">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveAttribute("title", "Email icon");
  });

  it("renders with text content", () => {
    customRender(
      <InputIcon position="leading">
        <span>$</span>
      </InputIcon>,
    );
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("has pointer-events-none class to prevent interaction", () => {
    const { container } = customRender(
      <InputIcon position="leading">
        <EnvelopeIcon data-testid="envelope-icon" />
      </InputIcon>,
    );
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass("pointer-events-none");
  });
});
