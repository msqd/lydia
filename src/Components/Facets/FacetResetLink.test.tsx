import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacetResetLink } from "./FacetResetLink";

describe("FacetResetLink", () => {
  it("renders with correct text and icon", () => {
    const onReset = vi.fn();
    const { container } = render(
      <FacetResetLink title="Test Filter" onReset={onReset}>
        reset
      </FacetResetLink>,
    );

    const link = screen.getByRole("link", { name: /reset test filter/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("reset");

    // Check for icon
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-2.5", "w-2.5");
  });

  it("calls onReset when clicked", () => {
    const onReset = vi.fn();
    render(
      <FacetResetLink title="Test Filter" onReset={onReset}>
        reset
      </FacetResetLink>,
    );

    const link = screen.getByRole("link");
    fireEvent.click(link);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("prevents default link behavior", () => {
    const onReset = vi.fn();
    render(
      <FacetResetLink title="Test Filter" onReset={onReset}>
        reset
      </FacetResetLink>,
    );

    const link = screen.getByRole("link");
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefault = vi.spyOn(clickEvent, "preventDefault");

    fireEvent(link, clickEvent);

    expect(preventDefault).toHaveBeenCalled();
  });

  it("has correct styling classes", () => {
    const onReset = vi.fn();
    render(
      <FacetResetLink title="Test Filter" onReset={onReset}>
        reset
      </FacetResetLink>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-gray-500", "font-normal", "text-[11px]", "hover:text-gray-700", "transition-colors");
  });

  it("has correct aria-label", () => {
    const onReset = vi.fn();
    render(
      <FacetResetLink title="Status" onReset={onReset}>
        reset
      </FacetResetLink>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Reset Status");
  });

  it("renders custom children text", () => {
    const onReset = vi.fn();
    render(
      <FacetResetLink title="Filters" onReset={onReset}>
        reset all
      </FacetResetLink>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("reset all");
  });
});
