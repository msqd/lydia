import { describe, expect, it } from "vitest";
import { customRender, expectComponentDefaults, screen } from "../../Utilities/Testing";
import { KeyboardShortcut } from "./KeyboardShortcut";

describe("KeyboardShortcut", () => {
  it("renders with default props", () => {
    customRender(<KeyboardShortcut shortcut="⌘K" />);
    const shortcut = screen.getByText("⌘K");
    expectComponentDefaults({
      element: shortcut,
      tagName: "kbd",
    });
  });

  it("renders different shortcuts", () => {
    customRender(<KeyboardShortcut shortcut="Ctrl+S" />);
    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    customRender(<KeyboardShortcut shortcut="⌘K" className="custom-class" />);
    const shortcut = screen.getByText("⌘K");
    expect(shortcut).toHaveClass("custom-class");
  });

  it("passes through additional props", () => {
    customRender(<KeyboardShortcut shortcut="⌘K" title="Keyboard shortcut" />);
    const shortcut = screen.getByText("⌘K");
    expect(shortcut).toHaveAttribute("title", "Keyboard shortcut");
  });

  it("has correct accessibility attributes", () => {
    customRender(<KeyboardShortcut shortcut="⌘K" />);
    const shortcut = screen.getByText("⌘K");
    expect(shortcut.tagName).toBe("KBD");
  });

  it("renders complex shortcuts", () => {
    customRender(<KeyboardShortcut shortcut="⌘⇧P" />);
    expect(screen.getByText("⌘⇧P")).toBeInTheDocument();
  });
});
