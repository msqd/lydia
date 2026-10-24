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

describe("Textarea field ids", () => {
  it("links its label, help text and error without any id passed", () => {
    render(<Textarea label="Notes" helpText="Be brief" errorMessage="Too long" />);
    const textarea = screen.getByLabelText("Notes");

    expect(textarea).toHaveAttribute("aria-describedby", screen.getByText("Too long").id);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("describes the control by its help text and corner hint together", () => {
    render(<Textarea label="Notes" helpText="Be brief" cornerHint="Optional" />);
    const ids = screen.getByLabelText("Notes").getAttribute("aria-describedby")?.split(" ");

    expect(ids).toEqual([screen.getByText("Be brief").id, screen.getByText("Optional").id]);
  });

  it("appends the consumer's aria-describedby", () => {
    render(<Textarea label="Notes" errorMessage="Too long" aria-describedby="external" />);
    const ids = screen.getByLabelText("Notes").getAttribute("aria-describedby")?.split(" ");

    expect(ids).toEqual([screen.getByText("Too long").id, "external"]);
  });

  it("is invalid when the variant is error, without a message", () => {
    render(<Textarea label="Notes" variant="error" />);
    expect(screen.getByLabelText("Notes")).toHaveAttribute("aria-invalid", "true");
  });

  it("gives two fields distinct ids", () => {
    render(
      <>
        <Textarea label="First" />
        <Textarea label="Second" />
      </>,
    );
    expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
  });
});
