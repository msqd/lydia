import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../Toast";
import { Colors } from "./Colors";

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock getComputedStyle
const mockGetComputedStyle = vi.fn();
Object.assign(window, {
  getComputedStyle: mockGetComputedStyle,
});

// Mock canvas context for color conversion
const mockFillRect = vi.fn();
const mockGetImageData = vi.fn();

// Mock HTMLCanvasElement.prototype.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
  return {
    fillStyle: "",
    fillRect: mockFillRect,
    getImageData: mockGetImageData.mockReturnValue({
      data: [128, 128, 128, 255], // Default gray color
    }),
  };
});

const ColorsWithProvider = ({ ...props }) => (
  <ToastProvider>
    <Colors {...props} />
  </ToastProvider>
);

describe("Colors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getComputedStyle to return different colors based on the element's className
    mockGetComputedStyle.mockImplementation((element) => {
      const className = element.className || "";

      // Return different colors based on the background class - mix of RGB and OKLCH
      if (className.includes("bg-primary-50")) return { backgroundColor: "rgb(232, 235, 243)" }; // #e8ebf3
      if (className.includes("bg-primary-100")) return { backgroundColor: "oklch(0.82 0.02 258.34)" }; // Should convert to #c4cde2
      if (className.includes("bg-primary-200")) return { backgroundColor: "rgb(158, 173, 205)" }; // #9eadcd
      if (className.includes("bg-primary-300")) return { backgroundColor: "oklch(0.64 0.06 258.34)" }; // Should convert to #798db9
      if (className.includes("bg-primary-400")) return { backgroundColor: "rgb(91, 116, 171)" }; // #5b74ab
      if (className.includes("bg-primary-500")) return { backgroundColor: "oklch(0.47 0.08 258.34)" }; // Should convert to #3d5c9e
      if (className.includes("bg-primary-600")) return { backgroundColor: "rgb(54, 84, 149)" }; // #365495
      if (className.includes("bg-primary-700")) return { backgroundColor: "oklch(0.39 0.09 258.34)" }; // Should convert to #2d4a89
      if (className.includes("bg-primary-800")) return { backgroundColor: "rgb(29, 58, 136)" }; // #1d3a88
      if (className.includes("bg-primary-900")) return { backgroundColor: "oklch(0.28 0.08 258.34)" }; // Should convert to #1c2f65
      if (className.includes("bg-danger-500")) return { backgroundColor: "rgb(239, 68, 68)" }; // #ef4444
      if (className.includes("bg-warning-500")) return { backgroundColor: "rgb(234, 179, 8)" }; // #eab308
      if (className.includes("bg-success-500")) return { backgroundColor: "rgb(34, 197, 94)" }; // #22c55e

      // Default fallback
      return { backgroundColor: "rgb(128, 128, 128)" }; // #808080
    });

    // Mock canvas context to return specific colors based on input
    mockGetImageData.mockImplementation(() => {
      return {
        data: [196, 205, 226, 255], // Default to primary-100 equivalent
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("renders default color palettes in table format", () => {
    render(<ColorsWithProvider />);

    // Check for table structure
    expect(screen.getByRole("table")).toBeInTheDocument();

    // The page documents the theme's own ramps, not Tailwind's stock palette
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Danger")).toBeInTheDocument();
    expect(screen.queryByText("Green")).not.toBeInTheDocument();
    expect(screen.queryByText("Red")).not.toBeInTheDocument();

    // Check for shade headers (900 to 50)
    expect(screen.getByText("900")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    // Every token exposes a complete ramp: 4 palettes × 10 shades
    const colorItems = screen.getAllByRole("button");
    expect(colorItems).toHaveLength(40);
  });

  it("renders custom palettes when provided", () => {
    const customPalettes = [
      {
        name: "Custom",
        variants: [
          { shade: "500", bgClass: "bg-danger-500" },
          { shade: "400", bgClass: "bg-blue-500" },
        ],
      },
    ];

    render(<ColorsWithProvider palettes={customPalettes} />);

    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();

    // Should not render default palettes
    expect(screen.queryByText("Primary")).not.toBeInTheDocument();
    expect(screen.queryByText("Success")).not.toBeInTheDocument();
  });

  it("copies color to clipboard when clicked", async () => {
    mockWriteText.mockResolvedValue(undefined);

    render(<ColorsWithProvider />);

    // Find a color cell and click it
    const colorButtons = screen.getAllByRole("button");
    fireEvent.click(colorButtons[0]);

    expect(mockWriteText).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<ColorsWithProvider className="custom-class" />);

    const container = screen.getByRole("table");
    expect(container).toHaveClass("custom-class");
  });

  /**
   * A control's name starts with the text it shows, so a speech user saying
   * what they see reaches it (WCAG 2.5.3, axe `label-content-name-mismatch`).
   * The swatch shows its hex; "Copy color Primary 500 (#...)" did not begin
   * with it. And a real button inside the cell, not a cell turned into a
   * button, so the table keeps its cells.
   */
  it("names each swatch's button by the hex it shows, then by what it copies", () => {
    render(<ColorsWithProvider />);

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      const shown = button.querySelector("[data-hex]")?.textContent ?? "";
      expect(shown).not.toBe("");
      // Named from its content (this file mocks getComputedStyle, which the
      // accessible-name computation needs), so the content is the name.
      expect(button).not.toHaveAttribute("aria-label");
      expect(button.textContent?.startsWith(`${shown}, copy `)).toBe(true);
      expect(button.closest("td")).not.toBeNull();
    }
    expect(screen.queryAllByRole("button").every((button) => button.tagName === "BUTTON")).toBe(true);
  });
});
