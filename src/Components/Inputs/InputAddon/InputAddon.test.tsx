import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { customRender, screen } from "../../Utilities/Testing";
import { InputAddon } from "./InputAddon";

const renderAddon = (element: ReactElement) => {
  const { container } = customRender(element);
  return container.firstChild as HTMLElement;
};

describe("InputAddon", () => {
  it("renders its content", () => {
    customRender(<InputAddon>https://</InputAddon>);
    expect(screen.getByText("https://")).toBeInTheDocument();
  });

  it("sits at the leading edge by default", () => {
    const addon = renderAddon(<InputAddon>https://</InputAddon>);
    expect(addon).toHaveClass("rounded-l-sm");
    expect(addon).not.toHaveClass("rounded-r-sm");
  });

  it("rounds the trailing edge when trailing", () => {
    const addon = renderAddon(<InputAddon position="trailing">USD</InputAddon>);
    expect(addon).toHaveClass("rounded-r-sm");
    expect(addon).not.toHaveClass("rounded-l-sm");
  });

  it("draws its own box so it can sit beside the input", () => {
    const addon = renderAddon(<InputAddon>https://</InputAddon>);
    expect(addon).toHaveClass("bg-white", "outline-1", "outline-gray-300", "h-[38px]");
  });

  it("drops the box when inline, so it sits inside the input outline", () => {
    const addon = renderAddon(<InputAddon inline>+1</InputAddon>);
    expect(addon).not.toHaveClass("bg-white", "outline-1", "h-[38px]");
    expect(addon).toHaveClass("shrink-0", "select-none", "h-full");
  });

  it("keeps its distance from the value when inline", () => {
    expect(renderAddon(<InputAddon inline>+1</InputAddon>)).toHaveClass("pr-2");

    const trailing = renderAddon(
      <InputAddon position="trailing" inline>
        kg
      </InputAddon>,
    );
    expect(trailing).toHaveClass("pl-2");
    expect(trailing).not.toHaveClass("pr-2");
  });

  it("lets a caller override its spacing", () => {
    const addon = renderAddon(<InputAddon className="px-6">https://</InputAddon>);
    expect(addon).toHaveClass("px-6");
    expect(addon).not.toHaveClass("px-3");
  });

  it("forwards div props, so it can be referenced by the input it decorates", () => {
    const addon = renderAddon(
      <InputAddon id="price-currency" position="trailing">
        USD
      </InputAddon>,
    );
    expect(addon).toHaveAttribute("id", "price-currency");
  });

  it("stays in the accessibility tree, unlike a decorative icon", () => {
    const addon = renderAddon(<InputAddon position="trailing">kg</InputAddon>);
    expect(addon).not.toHaveAttribute("aria-hidden");
  });
});
