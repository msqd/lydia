import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";

describe("Radio component", () => {
  it("renders correctly with default props", () => {
    const { container } = render(<Radio name="test-radio" />);

    const radio = screen.getByRole("radio");
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute("name", "test-radio");

    const label = screen.getByText("test-radio");
    expect(label).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with custom label", () => {
    render(<Radio name="test" label="Custom Label" />);

    const label = screen.getByText("Custom Label");
    expect(label).toBeInTheDocument();
  });

  it("can be checked", () => {
    const handleChange = vi.fn();
    render(<Radio name="test-radio" onChange={handleChange} />);

    const radio = screen.getByRole("radio");
    expect(radio).not.toBeChecked();

    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalled();
  });

  it("respects the checked prop", () => {
    const handleChange = () => {};
    render(<Radio name="test-radio" checked={true} onChange={handleChange} />);

    const radio = screen.getByRole("radio");
    expect(radio).toBeChecked();
  });

  it("can be disabled", () => {
    render(<Radio name="test-radio" disabled />);

    const radio = screen.getByRole("radio");
    expect(radio).toBeDisabled();
    expect(radio).toHaveClass("opacity-60");

    const label = screen.getByText("test-radio");
    expect(label).toHaveClass("text-gray-400");
  });

  it("merges custom className with default styles", () => {
    render(<Radio name="test-radio" className="custom-class" />);

    const radio = screen.getByRole("radio");
    expect(radio).toHaveClass("h-4", "w-4", "border-gray-300", "text-primary-600", "custom-class");
  });

  it("applies custom container and label props", () => {
    render(
      <Radio
        name="test-radio"
        containerProps={{ className: "container-class" }}
        labelProps={{ className: "label-class" }}
      />,
    );

    const container = screen.getByText("test-radio").closest("div");
    expect(container).toHaveClass("flex", "items-center", "gap-x-3", "container-class");

    const label = screen.getByText("test-radio");
    expect(label).toHaveClass("block", "text-sm", "font-medium", "label-class");
  });

  it("uses provided id for input and label association", () => {
    render(<Radio name="test-radio" id="custom-id" />);

    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("id", "custom-id");

    const label = screen.getByText("test-radio");
    expect(label).toHaveAttribute("for", "custom-id");
  });

  it("keeps hook order when id is passed then cleared", () => {
    const { rerender } = render(<Radio name="r" id="custom" />);
    expect(screen.getByRole("radio")).toHaveAttribute("id", "custom");

    rerender(<Radio name="r" />);
    const radio = screen.getByRole("radio");
    expect(radio.id).not.toBe("");
    expect(radio.id).not.toBe("custom");
    expect(screen.getByText("r")).toHaveAttribute("for", radio.id);

    rerender(<Radio name="r" id="again" />);
    expect(screen.getByRole("radio")).toHaveAttribute("id", "again");
  });

  it("keeps hook order when id is passed after a generated one", () => {
    const { rerender } = render(<Radio name="r" />);
    const generated = screen.getByRole("radio").id;

    rerender(<Radio name="r" id="custom" />);
    expect(screen.getByRole("radio")).toHaveAttribute("id", "custom");

    rerender(<Radio name="r" />);
    expect(screen.getByRole("radio")).toHaveAttribute("id", generated);
  });
});
