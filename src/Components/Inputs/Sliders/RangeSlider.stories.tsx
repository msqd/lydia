import { Button } from "@msqd/lydia/Components/Buttons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { RangeSlider } from "./RangeSlider";

/**
 * RangeSlider component for selecting minimum and maximum values within a range.
 * This component offers dual-thumb functionality for defining ranges.
 */
const meta = {
  title: "Components/Inputs/Sliders/RangeSlider",
  component: RangeSlider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    min: {
      control: { type: "number" },
      description: "Minimum value of the slider range",
    },
    max: {
      control: { type: "number" },
      description: "Maximum value of the slider range",
    },
    step: {
      control: { type: "number" },
      description: "Increment step between values",
    },
    defaultValue: {
      control: "object",
      description: "Initial values for the slider",
    },
    thumbSize: {
      control: { type: "text" },
      description: "Size of the thumb controls (CSS dimension)",
    },
    onChange: {
      action: "onChange",
      description: "Callback fired when slider value changes",
    },
    onPointerUp: {
      action: "onPointerUp",
      description: "Callback fired when pointer is released from slider",
    },
    marks: {
      control: "object",
      description: "Array of marks to display on the slider",
    },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    thumbSize: "16px",
    onChange: fn(),
    onPointerUp: fn(),
  },
} satisfies Meta<typeof RangeSlider>;

export default meta;

/**
 * Interactive example that showcases the RangeSlider with state management
 */
export const Default = () => {
  const [value, setValue] = useState<{ min?: number; max?: number }>({ min: 25, max: 75 });

  return (
    <div className="w-96 flex flex-col gap-6">
      <RangeSlider min={0} max={100} step={5} value={value} onChange={setValue} />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col items-center p-3 bg-gray-100 rounded-md">
          <span className="font-medium">Min Value</span>
          <span className="text-2xl text-primary-600">{value.min}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-100 rounded-md">
          <span className="font-medium">Max Value</span>
          <span className="text-2xl text-primary-600">{value.max}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * RangeSlider with marks at specific intervals, each with a label.
 * This example shows how to add visual guides at regular intervals to help users select precise values.
 */
export const WithMarks = () => {
  const [value, setValue] = useState<{ min?: number; max?: number }>({ min: 10, max: 50 });

  const marks = [
    { value: 0, label: "0" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 30, label: "30" },
    { value: 40, label: "40" },
    { value: 50, label: "50" },
    { value: 60, label: "60" },
    { value: 70, label: "70" },
    { value: 80, label: "80" },
    { value: 90, label: "90" },
    { value: 100, label: "100" },
  ];

  // We don't use these values, but they could be useful for more advanced displays
  // that would show specifically selected marks

  return (
    <div className="w-96 flex flex-col gap-6">
      {/* Title */}
      <div className="text-lg font-medium">Range with Markers</div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        Markers help users easily select precise values. Steps are set to 10 units to facilitate selection.
      </p>

      {/* Slider container with shadow effect */}
      <div className="p-4 bg-white shadow-md rounded-md border border-gray-100">
        <RangeSlider min={0} max={100} step={10} value={value} onChange={setValue} marks={marks} />
      </div>

      {/* Value display */}
      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <div className="flex flex-col items-center p-3 bg-gray-100 rounded-md">
          <span className="font-medium">Min Value</span>
          <span className="text-2xl text-primary-600">{value.min}</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-100 rounded-md">
          <span className="font-medium">Max Value</span>
          <span className="text-2xl text-primary-600">{value.max}</span>
        </div>
      </div>

      {/* Selected range display */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="font-medium text-sm mb-2">Selected Range</h3>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg text-primary-700 font-semibold">{value.min}</span>
          <span className="text-gray-500">to</span>
          <span className="text-lg text-primary-700 font-semibold">{value.max}</span>
        </div>
      </div>

      {/* Usage hint */}
      <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-700">
        <p>
          <strong>Tip:</strong> Try clicking on the markers to position the handles directly. You can also use keyboard
          arrow keys for precise adjustments.
        </p>
      </div>
    </div>
  );
};

/**
 * RangeSlider with custom marks styling
 */
export const CustomMarks = () => {
  const [value, setValue] = useState<{ min?: number; max?: number }>({ min: 20, max: 80 });

  const marks = [
    { value: 0, label: "Min", className: "bg-gray-400" },
    { value: 20, label: "Low", className: "bg-blue-400" },
    { value: 40, label: "Medium", className: "bg-green-400" },
    { value: 60, label: "High", className: "bg-orange-400" },
    { value: 80, label: "Very High", className: "bg-red-400" },
    { value: 100, label: "Max", className: "bg-red-600" },
  ];

  return (
    <div className="w-96 flex flex-col gap-6">
      <div className="p-4 bg-white shadow-sm rounded-md">
        <h3 className="font-medium mb-4">Risk Level Selector</h3>

        <RangeSlider min={0} max={100} step={20} value={value} onChange={setValue} marks={marks} />

        <div className="mt-6 p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Selected Risk Level:</span>
            {marks.map((mark) => {
              if (typeof mark !== "number" && mark.value === value.min) {
                return (
                  <span
                    key={mark.value}
                    className="text-sm font-semibold"
                    style={{
                      color:
                        mark.className?.replace("bg-", "") === "gray-400"
                          ? "#4B5563"
                          : mark.className?.replace("bg-", "") === "blue-400"
                            ? "#1D4ED8"
                            : mark.className?.replace("bg-", "") === "green-400"
                              ? "#047857"
                              : mark.className?.replace("bg-", "") === "orange-400"
                                ? "#C2410C"
                                : mark.className?.replace("bg-", "") === "red-400"
                                  ? "#B91C1C"
                                  : mark.className?.replace("bg-", "") === "red-600"
                                    ? "#DC2626"
                                    : "",
                    }}
                  >
                    {mark.label}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Demonstrates different thumb sizes
 */
export const ThumbSizes = () => {
  const [smallValue, setSmallValue] = useState<{ min?: number; max?: number }>({ min: 20, max: 80 });
  const [defaultValue, setDefaultValue] = useState<{ min?: number; max?: number }>({ min: 20, max: 80 });
  const [largeValue, setLargeValue] = useState<{ min?: number; max?: number }>({ min: 20, max: 80 });
  const [xlValue, setXlValue] = useState<{ min?: number; max?: number }>({ min: 20, max: 80 });

  return (
    <div className="w-96 flex flex-col gap-12 pb-16">
      <div className="bg-white p-3 rounded-md shadow-sm">
        <h3 className="font-medium mb-3">Available Thumb Sizes</h3>
        <p className="text-xs text-gray-500 mb-4">Select a size that suits your interface needs.</p>

        <div className="flex flex-col gap-8 mt-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Small (12px)</span>
            <div className="p-2">
              <RangeSlider min={0} max={100} thumbSize="12px" value={smallValue} onChange={setSmallValue} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Default (16px)</span>
            <div className="p-2">
              <RangeSlider min={0} max={100} thumbSize="16px" value={defaultValue} onChange={setDefaultValue} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Large (24px)</span>
            <div className="p-2">
              <RangeSlider min={0} max={100} thumbSize="24px" value={largeValue} onChange={setLargeValue} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Extra Large (32px)</span>
            <div className="p-2">
              <RangeSlider min={0} max={100} thumbSize="32px" value={xlValue} onChange={setXlValue} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example for filtering price ranges in an e-commerce interface
 */
export const PriceFilter = () => {
  const [value, setValue] = useState<{ min?: number; max?: number }>({ min: 50, max: 350 });

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "-";
    return `$${price}`;
  };

  return (
    <div className="w-96 p-4 border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>

      <RangeSlider
        min={0}
        max={500}
        step={10}
        value={value}
        onChange={setValue}
        marks={[
          { value: 0, label: "$0" },
          { value: 100, label: "$100" },
          { value: 200, label: "$200" },
          { value: 300, label: "$300" },
          { value: 400, label: "$400" },
          { value: 500, label: "$500" },
        ]}
      />

      <div className="flex justify-between mt-8 mb-2">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Min Price</span>
          <span className="text-primary-600 font-medium">{formatPrice(value.min)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Max Price</span>
          <span className="text-primary-600 font-medium">{formatPrice(value.max)}</span>
        </div>
      </div>

      <Button className="w-full mt-4">Apply Filter</Button>
    </div>
  );
};

const FOCUS_RING = "rgb(54, 84, 149)";

const thumbs = (canvasElement: HTMLElement) => ({
  min: canvasElement.querySelector<HTMLElement>('[data-thumb="min"]')!,
  max: canvasElement.querySelector<HTMLElement>('[data-thumb="max"]')!,
});

const hasFocusRing = (thumb: HTMLElement) => {
  const style = getComputedStyle(thumb);
  return style.outlineStyle === "solid" && style.outlineColor === FOCUS_RING;
};

const FocusableSlider = ({ thumbSize, value }: { thumbSize: string; value: { min: number; max: number } }) => {
  const [current, setCurrent] = useState<{ min?: number; max?: number }>(value);
  return (
    <div className="w-96 p-4">
      <RangeSlider label="Price" min={0} max={100} thumbSize={thumbSize} value={current} onChange={setCurrent} />
    </div>
  );
};

type FocusStory = StoryObj<{ thumbSize: string; value: { min: number; max: number } }>;

/**
 * Tab to a thumb and it shows a ring; the other thumb stays plain. Drawn thumbs are not focusable,
 * so the ring follows the focus of the matching native input.
 */
export const KeyboardFocus: FocusStory = {
  args: { thumbSize: "16px", value: { min: 25, max: 75 } },
  render: (args) => <FocusableSlider {...args} />,
  play: async ({ canvasElement, canvas, userEvent }) => {
    const { min, max } = thumbs(canvasElement);
    expect(hasFocusRing(min)).toBe(false);
    expect(hasFocusRing(max)).toBe(false);

    await userEvent.tab();
    expect(canvas.getByRole("slider", { name: "Price, minimum" })).toHaveFocus();
    expect(hasFocusRing(min)).toBe(true);
    expect(hasFocusRing(max)).toBe(false);

    await userEvent.tab();
    expect(canvas.getByRole("slider", { name: "Price, maximum" })).toHaveFocus();
    expect(hasFocusRing(min)).toBe(false);
    expect(hasFocusRing(max)).toBe(true);
  },
};

/** The ring scales with every thumb size, from 12px to 32px. */
export const KeyboardFocusLargeThumb: FocusStory = {
  ...KeyboardFocus,
  args: { thumbSize: "32px", value: { min: 25, max: 75 } },
};

/**
 * Both thumbs at the same value. The ring sits outside the focused thumb, so it stays visible under
 * its twin and still says which input the arrow keys move.
 */
export const KeyboardFocusOverlapping: FocusStory = {
  args: { thumbSize: "16px", value: { min: 50, max: 50 } },
  render: (args) => <FocusableSlider {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const { min, max } = thumbs(canvasElement);

    await userEvent.tab();
    expect(hasFocusRing(min)).toBe(true);
    expect(hasFocusRing(max)).toBe(false);

    await userEvent.tab();
    expect(hasFocusRing(min)).toBe(false);
    expect(hasFocusRing(max)).toBe(true);
  },
};
