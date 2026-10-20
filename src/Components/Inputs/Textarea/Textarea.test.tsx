import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea Component", () => {
  it("renders with basic props", () => {
    render(<Textarea label="Description" id="desc" placeholder="Enter description" />);

    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument();
  });

  it("displays the required indicator when required prop is true", () => {
    render(<Textarea label="Required Field" id="required-field" required />);

    const label = screen.getByText("Required Field");
    expect(label.parentElement).toHaveTextContent("*");
  });

  it("renders help text when provided", () => {
    const helpText = "Enter a detailed description";
    render(<Textarea label="Description" id="desc" helpText={helpText} helpTextId="desc-help" />);

    expect(screen.getByText(helpText)).toBeInTheDocument();
  });

  it("renders error message when in error state", () => {
    const errorMessage = "Description is required";
    render(<Textarea label="Description" id="desc" variant="error" errorMessage={errorMessage} errorId="desc-error" />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renders with corner hint", () => {
    const cornerHint = "Optional";
    render(<Textarea label="Description" id="desc" cornerHint={cornerHint} cornerHintId="desc-hint" />);

    expect(screen.getByText(cornerHint)).toBeInTheDocument();
  });

  it("calls onChange handler when text is entered", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea label="Description" id="desc" onChange={handleChange} />);

    const textarea = screen.getByLabelText("Description");
    await user.type(textarea, "Test input");

    expect(handleChange).toHaveBeenCalled();
  });

  it("applies custom class names", () => {
    render(
      <Textarea
        label="Description"
        id="desc"
        className="custom-container"
        wrapperClassName="custom-wrapper"
        labelClassName="custom-label"
        textareaClassName="custom-textarea"
      />,
    );

    const container = screen.getByLabelText("Description").closest(".custom-container");
    expect(container).toBeInTheDocument();

    const wrapper = screen.getByLabelText("Description").closest(".custom-wrapper");
    expect(wrapper).toBeInTheDocument();

    const label = screen.getByText("Description");
    expect(label).toHaveClass("custom-label");

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveClass("custom-textarea");
  });

  it("can be disabled", () => {
    render(<Textarea label="Description" id="desc" disabled />);

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toBeDisabled();
  });
});
