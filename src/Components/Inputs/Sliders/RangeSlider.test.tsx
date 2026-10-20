import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RangeSlider } from "./RangeSlider";

// Helper function to query the input elements
const getInputs = () => {
  const inputs = screen.getAllByRole("slider");
  return {
    minInput: inputs[0],
    maxInput: inputs[1],
  };
};

// Helper function to get thumbs (visual controls)
const getControls = (container: HTMLElement) => {
  const controls = container.querySelectorAll(
    ".absolute.rounded-full.bg-primary-900.top-1\\/2.-translate-x-1\\/2.-translate-y-1\\/2.ring-1.ring-white",
  );
  return {
    minControl: controls[0] as HTMLElement,
    maxControl: controls[1] as HTMLElement,
  };
};

describe("RangeSlider", () => {
  it("renders with default props", () => {
    const { container } = render(<RangeSlider />);

    // Check existence of range inputs
    const { minInput, maxInput } = getInputs();
    expect(minInput).toBeInTheDocument();
    expect(maxInput).toBeInTheDocument();

    // Check if inputs have correct min, max and values
    expect(minInput).toHaveAttribute("min", "0");
    expect(minInput).toHaveAttribute("max", "10");
    expect(minInput).toHaveAttribute("value", "0");

    expect(maxInput).toHaveAttribute("min", "0");
    expect(maxInput).toHaveAttribute("max", "10");
    expect(maxInput).toHaveAttribute("value", "10");

    // Check if the controls are positioned correctly
    const { minControl, maxControl } = getControls(container);
    expect(minControl).toHaveStyle("left: 0%");
    expect(maxControl).toHaveStyle("left: 100%");

    // Verify rail element
    const rail = container.querySelector(
      ".absolute.w-full.top-1\\/2.-translate-y-1\\/2.h-\\[6px\\].rounded-\\[3px\\].bg-gray-200",
    );
    expect(rail).toBeInTheDocument();

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with custom min, max and default values", () => {
    const { container } = render(<RangeSlider min={10} max={100} defaultValue={{ min: 25, max: 75 }} />);

    const { minInput, maxInput } = getInputs();

    // Check if inputs have correct custom min, max and values
    expect(minInput).toHaveAttribute("min", "10");
    expect(minInput).toHaveAttribute("max", "100");
    expect(minInput).toHaveAttribute("value", "25");

    expect(maxInput).toHaveAttribute("min", "10");
    expect(maxInput).toHaveAttribute("max", "100");
    expect(maxInput).toHaveAttribute("value", "75");

    // Check controls position based on percentage calculation
    const { minControl, maxControl } = getControls(container);
    expect(minControl).toHaveStyle("left: 16.666666666666664%"); // (25-10)/(100-10) * 100
    expect(maxControl).toHaveStyle("left: 72.22222222222221%"); // (75-10)/(100-10) * 100
  });

  it("renders with custom thumbSize", () => {
    const { container } = render(<RangeSlider thumbSize="24px" />);

    // Check if thumbSize is applied to wrapper and controls
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle("height: calc(24px + 1.6rem)");

    const { minControl, maxControl } = getControls(container);
    expect(minControl).toHaveStyle("width: 24px");
    expect(minControl).toHaveStyle("height: 24px");
    expect(maxControl).toHaveStyle("width: 24px");
    expect(maxControl).toHaveStyle("height: 24px");

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with marks", () => {
    const marks = [
      { value: 0, label: "0" },
      { value: 50, label: "50" },
      { value: 100, label: "100" },
    ];

    const { container } = render(<RangeSlider min={0} max={100} marks={marks} />);

    // Check if marks are rendered
    const markElements = container.querySelectorAll(
      ".absolute.top-1\\/2.-translate-x-1\\/2.-translate-y-1\\/2.rounded-full.bg-primary-200",
    );
    expect(markElements).toHaveLength(3);

    // Check if labels are rendered
    const labelElements = container.querySelectorAll(
      ".absolute.top-full.-translate-x-1\\/2.mt-\\[8px\\].text-\\[10px\\].font-medium.whitespace-nowrap.select-none",
    );
    expect(labelElements).toHaveLength(3);
    expect(labelElements[0]).toHaveTextContent("0");
    expect(labelElements[1]).toHaveTextContent("50");
    expect(labelElements[2]).toHaveTextContent("100");

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("calls onChange when inputs change", () => {
    const handleChange = vi.fn();
    render(<RangeSlider onChange={handleChange} />);

    const { minInput, maxInput } = getInputs();

    // Change min value
    fireEvent.change(minInput, { target: { value: "3" } });
    expect(handleChange).toHaveBeenCalledWith({ min: 3, max: 10 });

    // Change max value
    fireEvent.change(maxInput, { target: { value: "7" } });
    expect(handleChange).toHaveBeenCalledWith({ min: 3, max: 7 });
  });

  it("calls onPointerUp when pointer is released", () => {
    const handlePointerUp = vi.fn();
    render(<RangeSlider onPointerUp={handlePointerUp} />);

    const { minInput, maxInput } = getInputs();

    // Trigger pointer up on min input
    fireEvent.pointerUp(minInput);
    expect(handlePointerUp).toHaveBeenCalledWith({ min: 0, max: 10 });

    // Trigger pointer up on max input
    fireEvent.pointerUp(maxInput);
    expect(handlePointerUp).toHaveBeenCalledWith({ min: 0, max: 10 });
  });

  it("respects min/max constraints when setting values", () => {
    const handleChange = vi.fn();
    render(<RangeSlider min={0} max={100} step={10} defaultValue={{ min: 30, max: 70 }} onChange={handleChange} />);

    const { minInput, maxInput } = getInputs();

    // Clear previous calls
    handleChange.mockClear();

    // Try to set min value higher than max - step
    fireEvent.change(minInput, { target: { value: "80" } });
    // Value is capped at max - step
    expect(handleChange).toHaveBeenCalledWith({ min: 60, max: 70 });

    handleChange.mockClear();

    // Try to set max value lower than min + step
    fireEvent.change(maxInput, { target: { value: "20" } });
    // Value is capped at min + step
    expect(handleChange).toHaveBeenCalledWith({ min: 60, max: 70 });
  });

  describe("uncontrolled mode", () => {
    /** A caller that re-renders and passes a fresh `defaultValue` literal, the ordinary way to write it. */
    function Host({ min = 0, max = 100 }: { min?: number; max?: number }) {
      const [, setTick] = useState(0);
      return (
        <div>
          <button type="button" onClick={() => setTick((t) => t + 1)}>
            rerender
          </button>
          <RangeSlider min={min} max={max} defaultValue={{ min: 10, max: 90 }} />
        </div>
      );
    }

    it("keeps a dragged value across an unrelated parent re-render", () => {
      const { container } = render(<Host />);
      const [minInput] = Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];

      fireEvent.change(minInput, { target: { value: "40" } });
      expect(minInput.value).toBe("40");

      fireEvent.click(screen.getByRole("button", { name: "rerender" }));

      expect(minInput.value).toBe("40");
    });

    it("ignores a later change to defaultValue, as an uncontrolled input does", () => {
      const { container, rerender } = render(<RangeSlider min={0} max={100} defaultValue={{ min: 10, max: 90 }} />);
      const [minInput] = Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];

      fireEvent.change(minInput, { target: { value: "40" } });
      rerender(<RangeSlider min={0} max={100} defaultValue={{ min: 25, max: 75 }} />);

      expect(minInput.value).toBe("40");
    });
  });

  describe("controlled mode", () => {
    it("follows the value prop", () => {
      const { container, rerender } = render(<RangeSlider min={0} max={100} value={{ min: 20, max: 80 }} />);
      const [minInput] = Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
      expect(minInput.value).toBe("20");

      rerender(<RangeSlider min={0} max={100} value={{ min: 35, max: 80 }} />);

      expect(minInput.value).toBe("35");
    });

    it("does not move on its own when the parent re-renders", () => {
      const { container } = render(<RangeSlider min={0} max={100} value={{ min: 20, max: 80 }} />);
      const [minInput] = Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];

      fireEvent.change(minInput, { target: { value: "40" } });

      expect(minInput.value).toBe("20");
    });
  });

  it("clamps the rendered value when min and max change at runtime", () => {
    const { container, rerender } = render(<RangeSlider min={0} max={100} defaultValue={{ min: 10, max: 90 }} />);
    const [minInput, maxInput] = Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];

    rerender(<RangeSlider min={30} max={60} defaultValue={{ min: 10, max: 90 }} />);

    expect(Number(minInput.value)).toBeGreaterThanOrEqual(30);
    expect(Number(maxInput.value)).toBeLessThanOrEqual(60);
  });

  /**
   * Two thumbs, two inputs, and a screen reader has to be able to tell them
   * apart: unnamed, each was announced as "slider" alone (axe `label`).
   */
  describe("names", () => {
    it("calls its two thumbs the minimum and the maximum", () => {
      render(<RangeSlider min={0} max={100} />);

      expect(screen.getByRole("slider", { name: "Minimum" })).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Maximum" })).toBeInTheDocument();
    });

    it("says what is being bounded, when told", () => {
      render(<RangeSlider min={0} max={100} label="Response time" />);

      expect(screen.getByRole("slider", { name: "Response time, minimum" })).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Response time, maximum" })).toBeInTheDocument();
    });
  });
});
