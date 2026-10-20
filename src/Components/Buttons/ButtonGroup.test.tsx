import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup, type ButtonGroupButtons } from "./ButtonGroup";

describe("ButtonGroup", () => {
  const mockSetCurrent = vi.fn();
  const defaultButtonProps: ButtonGroupButtons = [
    { key: "btn1", title: "Button 1" },
    { key: "btn2", title: "Button 2" },
    { key: "btn3", title: "Button 3" },
  ];

  beforeEach(() => {
    mockSetCurrent.mockClear();
  });

  it("renders correctly with multiple buttons", () => {
    const { container } = render(
      <ButtonGroup buttonProps={defaultButtonProps} current="btn1" setCurrent={mockSetCurrent} />,
    );

    const wrapper = screen.getByRole("group"); // Now explicitly added to the span
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("isolate", "inline-flex", "rounded-md", "shadow-xs");

    expect(screen.getByText("Button 1")).toBeInTheDocument();
    expect(screen.getByText("Button 2")).toBeInTheDocument();
    expect(screen.getByText("Button 3")).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("calls setCurrent with the correct key when a button is clicked", () => {
    render(<ButtonGroup buttonProps={defaultButtonProps} current="btn1" setCurrent={mockSetCurrent} />);

    const button2 = screen.getByText("Button 2");
    fireEvent.click(button2);
    expect(mockSetCurrent).toHaveBeenCalledTimes(1);
    expect(mockSetCurrent).toHaveBeenCalledWith("btn2");
  });

  it("applies correct styles to the selected (current) button", () => {
    render(
      <ButtonGroup
        buttonProps={defaultButtonProps}
        current="btn2" // Button 2 is current
        setCurrent={mockSetCurrent}
      />,
    );

    const selectedButton = screen.getByText("Button 2");
    // From Button primary variant (via StyledButton's variant prop)
    expect(selectedButton).toHaveClass("text-white", "bg-blue-600");
    // From StyledButton's currentSpecificClasses (static hover, specific ring)
    expect(selectedButton).toHaveClass("hover:bg-blue-600", "ring-blue-700");
    expect(selectedButton).toHaveClass("ring-1", "ring-inset");
    // From StyledButton's baseStyling (padding, focus)
    expect(selectedButton).toHaveClass("px-3", "py-2", "focus:z-10");
  });

  it("applies correct styles to non-selected buttons", () => {
    render(
      <ButtonGroup
        buttonProps={defaultButtonProps}
        current="btn2" // Button 2 is current
        setCurrent={mockSetCurrent}
      />,
    );

    const nonSelectedButton1 = screen.getByText("Button 1");
    // From Button secondary variant
    expect(nonSelectedButton1).toHaveClass("bg-white", "text-gray-900", "hover:bg-gray-50");
    expect(nonSelectedButton1).toHaveClass("ring-gray-300");
    // From StyledButton's baseStyling (padding)
    expect(nonSelectedButton1).toHaveClass("px-3", "py-2");
  });

  it("applies correct positional styling for a group of three buttons", () => {
    render(<ButtonGroup buttonProps={defaultButtonProps} current="btn1" setCurrent={mockSetCurrent} />);

    const button1 = screen.getByText("Button 1");
    const button2 = screen.getByText("Button 2");
    const button3 = screen.getByText("Button 3");

    // First button
    expect(button1).toHaveClass("rounded-l-sm");
    expect(button1).not.toHaveClass("-ml-px"); // First button should not have negative margin

    // Middle button
    expect(button2).toHaveClass("-ml-px");
    expect(button2).toHaveClass("rounded-none"); // Explicitly rounded-none, not inheriting from Button
    expect(button2).not.toHaveClass("rounded-sm"); // Should not have Button's default rounded-sm
    expect(button2).not.toHaveClass("rounded-l-sm");
    expect(button2).not.toHaveClass("rounded-r-sm");

    // Last button
    expect(button3).toHaveClass("-ml-px", "rounded-r-sm");
  });

  it("applies correct positional styling for a single button", () => {
    const singleButtonProps: ButtonGroupButtons = [{ key: "single", title: "Single" }];
    render(<ButtonGroup buttonProps={singleButtonProps} current="single" setCurrent={mockSetCurrent} />);

    const singleButton = screen.getByText("Single");
    // Un bouton unique doit avoir des arrondis à la fois à gauche et à droite
    expect(singleButton).toHaveClass("rounded-none"); // Commence avec cette classe
    expect(singleButton).toHaveClass("rounded-l-sm"); // Arrondi à gauche car c'est le premier
    expect(singleButton).toHaveClass("rounded-r-sm"); // Arrondi à droite car c'est aussi le dernier
    expect(singleButton).not.toHaveClass("-ml-px"); // Pas de marge négative car c'est le premier
  });

  it("merges custom className with wrapper span styles", () => {
    render(
      <ButtonGroup
        buttonProps={defaultButtonProps}
        current="btn1"
        setCurrent={mockSetCurrent}
        className="custom-group-class"
      />,
    );
    const wrapper = screen.getByRole("group");
    expect(wrapper).toHaveClass("shadow-xs", "custom-group-class");
  });
});
