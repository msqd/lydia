import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { customRender, expectComponentDefaults, screen } from "../../../Components/Utilities/Testing";
import { Checkbox } from "./Checkbox";

describe("Checkbox component", () => {
  it("renders correctly with default props", () => {
    const { container } = customRender(<Checkbox name="test-checkbox" />);

    const checkbox = screen.getByRole("checkbox");
    expectComponentDefaults({
      element: checkbox,
      defaultClasses: ["h-4", "w-4", "border-gray-300", "text-primary-600"],
    });
    expect(checkbox).toHaveAttribute("name", "test-checkbox");

    const label = screen.getByText("test-checkbox");
    expect(label).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with custom label", () => {
    customRender(<Checkbox name="test" label="Custom Label" />);

    const label = screen.getByText("Custom Label");
    expect(label).toBeInTheDocument();
  });

  it("can be checked and unchecked", () => {
    customRender(<Checkbox name="test-checkbox" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("respects the checked prop", () => {
    const handleChange = () => {};

    customRender(<Checkbox name="test-checkbox" checked={true} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("can be disabled", () => {
    customRender(<Checkbox name="test-checkbox" disabled />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("clicking the container triggers the checkbox", () => {
    customRender(<Checkbox name="test-checkbox" />);

    const container = screen.getByText("test-checkbox").closest("div")!.parentElement;
    expect(container).not.toBeNull();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(container!);
    expect(checkbox).toBeChecked();
  });

  it("has appropriate click handlers", () => {
    customRender(<Checkbox name="test-checkbox" />);

    // Vérifions que le label est un élément dans le DOM
    const label = screen.getByText("test-checkbox");
    expectComponentDefaults({
      element: label,
      tagName: "LABEL",
    });

    // Vérifions que le container a un comportement de clic
    const container = label.closest("div")?.parentElement;
    expect(container).toHaveClass("cursor-pointer");
  });

  it("merges custom className with default styles", () => {
    customRender(<Checkbox name="test-checkbox" className="custom-class" />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("h-4", "w-4", "border-gray-300", "text-primary-600", "custom-class");
  });

  it("applies custom container and label props", () => {
    customRender(
      <Checkbox
        name="test-checkbox"
        containerProps={{ className: "container-class" }}
        labelProps={{ className: "label-class" }}
      />,
    );

    // Sélectionnons autrement que par data-testid
    const container = screen.getByText("test-checkbox").closest("div")?.parentElement;
    expectComponentDefaults({
      element: container as HTMLElement,
      defaultClasses: ["relative", "flex", "gap-x-3", "select-none", "container-class"],
    });

    const label = screen.getByText("test-checkbox");
    expectComponentDefaults({
      element: label,
      defaultClasses: ["font-medium", "text-gray-900", "cursor-pointer", "label-class"],
    });
  });
});

describe("Checkbox indeterminate", () => {
  it("draws a partial tick when indeterminate", () => {
    customRender(<Checkbox name="partial" indeterminate />);

    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
  });

  it("is not partial by default", () => {
    customRender(<Checkbox name="plain" />);

    expect(screen.getByRole("checkbox")).not.toBePartiallyChecked();
  });

  it("follows the prop as it changes", () => {
    const { rerender } = customRender(<Checkbox name="partial" indeterminate />);

    rerender(<Checkbox name="partial" />);
    expect(screen.getByRole("checkbox")).not.toBePartiallyChecked();
  });
});
