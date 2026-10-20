import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { describe, expect, it, vi } from "vitest";
import { customRender, expectComponentDefaults, screen } from "../../Utilities/Testing";
import { InputButton } from "./InputButton";

describe("InputButton", () => {
  it("renders with default props", () => {
    customRender(<InputButton>Search</InputButton>);
    const button = screen.getByRole("button", { name: "Search" });
    expectComponentDefaults({
      element: button,
      tagName: "button",
    });
  });

  it("renders in trailing position by default", () => {
    customRender(<InputButton>Apply</InputButton>);
    const button = screen.getByRole("button", { name: "Apply" });
    expect(button).toHaveClass("rounded-l-none");
    expect(button).not.toHaveClass("rounded-r-none");
  });

  it("renders in leading position", () => {
    customRender(<InputButton position="leading">Search</InputButton>);
    const button = screen.getByRole("button", { name: "Search" });
    expect(button).toHaveClass("rounded-r-none");
    expect(button).not.toHaveClass("rounded-l-none");
  });

  it("renders with icon", () => {
    customRender(<InputButton icon={<MagnifyingGlassIcon data-testid="search-icon" />}>Search</InputButton>);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("renders with icon only", () => {
    customRender(<InputButton icon={<MagnifyingGlassIcon data-testid="search-icon" />} aria-label="Search" />);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("uses secondary variant by default", () => {
    customRender(<InputButton>Apply</InputButton>);
    const button = screen.getByRole("button", { name: "Apply" });
    // Check for secondary button styles
    expect(button).toHaveClass("bg-white", "text-gray-900");
  });

  it("can use primary variant", () => {
    customRender(<InputButton variant="primary">Submit</InputButton>);
    const button = screen.getByRole("button", { name: "Submit" });
    // Check for primary button styles
    expect(button).toHaveClass("bg-primary-500", "text-white");
  });

  it("applies custom className", () => {
    customRender(<InputButton className="custom-class">Button</InputButton>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button).toHaveClass("custom-class");
  });

  it("has correct height for input alignment", () => {
    customRender(<InputButton>Submit</InputButton>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveClass("h-[38px]");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    customRender(<InputButton onClick={handleClick}>Click me</InputButton>);
    const button = screen.getByRole("button", { name: "Click me" });
    button.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("can be disabled", () => {
    customRender(<InputButton disabled>Disabled</InputButton>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
  });

  it("passes through additional button props", () => {
    customRender(<InputButton title="Submit form">Submit</InputButton>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("title", "Submit form");
  });

  it("has button type by default", () => {
    customRender(<InputButton>Button</InputButton>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("can override button type", () => {
    customRender(<InputButton type="submit">Submit</InputButton>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");
  });
});
