import { describe, expect, it } from "vitest";
import {
  customRender,
  expectComponentDefaults,
  screen,
  testAdditionalProps,
  testClassNameMerging,
  testComponentVariants,
} from "../Utilities/Testing";
import { Badge, type BadgeColor, type BadgePaletteColor, type BadgeSize, type BadgeStatusColor } from "./Badge";

describe("Badge", () => {
  it("renders with default props", () => {
    const { container } = customRender(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");

    expectComponentDefaults({
      element: badge,
      defaultClasses: ["bg-gray-50", "text-gray-700", "ring-gray-600/20"],
      tagName: "SPAN",
    });

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with custom color", () => {
    const colors: BadgeColor[] = [
      "default",
      "primary",
      "success",
      "warning",
      "danger",
      "green",
      "yellow",
      "orange",
      "red",
      "blue",
      "purple",
    ];

    const colorClassMap: Record<BadgeColor, string[]> = {
      default: ["bg-gray-50", "text-gray-700", "ring-gray-600/20"],
      primary: ["bg-primary-50", "text-primary-700", "ring-primary-600/20"],
      success: ["bg-success-50", "text-success-700", "ring-success-600/20"],
      warning: ["bg-warning-50", "text-warning-700", "ring-warning-600/20"],
      danger: ["bg-danger-50", "text-danger-700", "ring-danger-600/20"],
      green: ["bg-green-50", "text-green-700", "ring-green-600/20"],
      yellow: ["bg-yellow-50", "text-yellow-700", "ring-yellow-600/20"],
      orange: ["bg-orange-50", "text-orange-700", "ring-orange-600/20"],
      red: ["bg-red-50", "text-red-700", "ring-red-600/20"],
      blue: ["bg-blue-50", "text-blue-700", "ring-blue-600/20"],
      purple: ["bg-purple-50", "text-purple-700", "ring-purple-600/20"],
    };

    testComponentVariants({
      Component: Badge,
      variants: colors,
      variantProp: "color",
      classMap: colorClassMap,
      testContent: "Test Badge",
      baseClasses: ["inline-flex", "items-center", "ring-1"],
    });
  });

  it("renders with size variants", () => {
    const sizes: BadgeSize[] = ["default", "jumbo"];

    const sizeClassMap: Record<BadgeSize, string[]> = {
      default: ["px-2", "py-1", "text-xs"],
      jumbo: ["select-none", "text-2xl", "md:text-3xl", "lg:text-4xl", "font-semibold"],
    };

    testComponentVariants({
      Component: Badge,
      variants: sizes,
      variantProp: "size",
      classMap: sizeClassMap,
      testContent: "Size Test",
      baseClasses: ["inline-flex", "items-center", "ring-1"],
    });
  });

  it("keeps status presets on tokens and palette presets on fixed hues", () => {
    const statusPresets: BadgeStatusColor[] = ["success", "warning", "danger"];
    const palettePresets: BadgePaletteColor[] = ["green", "yellow", "orange", "red", "blue", "purple"];

    // A status preset must never resolve to a hue: retheming the token has to reach it.
    for (const color of statusPresets) {
      const { container } = customRender(<Badge color={color}>{color}</Badge>);
      expect(container.innerHTML).not.toMatch(/-(green|yellow|orange|red|amber|emerald|rose)-/);
    }

    // A palette preset carries identity rather than judgement, so it must not follow the tokens.
    for (const color of palettePresets) {
      const { container } = customRender(<Badge color={color}>{color}</Badge>);
      expect(container.innerHTML).not.toMatch(/-(success|warning|danger)-/);
    }
  });

  it("merges custom className with default styles", () => {
    testClassNameMerging({
      Component: Badge,
      customClass: "custom-class",
      defaultClasses: ["inline-flex", "items-center"],
      testContent: "Custom Badge",
    });
  });

  it("passes additional props to the span element", () => {
    testAdditionalProps({
      Component: Badge,
      additionalProps: { "data-testid": "badge-element" },
      testContent: "Test Badge",
      expectations: (badge) => {
        expect(badge).toHaveTextContent("Test Badge");
      },
    });
  });
});
