import type { ComponentProps, FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

/**
 * A badge is coloured for one of two reasons, and they must not be confused.
 *
 * Status presets say what a thing *means*, and follow the theme's status tokens: retheme
 * `danger` and every failure badge in the product follows. Reach for these first.
 *
 * Palette presets say what a thing *is*, and are fixed hues that carry no judgement. They
 * exist for categories a product colour-codes by convention, such as HTTP methods, where
 * "GET is green" is an identity rather than a claim that GET succeeded.
 */
export type BadgeStatusColor = "success" | "warning" | "danger";
export type BadgePaletteColor = "green" | "yellow" | "orange" | "red" | "blue" | "purple";
export type BadgeColor = BadgeStatusColor | BadgePaletteColor | "default" | "primary";

export type BadgeSize = "default" | "jumbo";

interface BadgeProps extends ComponentProps<"span"> {
  color?: BadgeColor;
  size?: BadgeSize;
}

const baseClassName = "inline-flex items-center font-medium rounded-md ring-1 ring-inset";

// Class names are spelled out because Tailwind scans source text and cannot see a composed string.
const colorVariants: Record<BadgeColor, string> = {
  default: `bg-gray-50 text-gray-700 ring-gray-600/20`,
  primary: `bg-primary-50 text-primary-700 ring-primary-600/20`,

  success: `bg-success-50 text-success-700 ring-success-600/20`,
  warning: `bg-warning-50 text-warning-700 ring-warning-600/20`,
  danger: `bg-danger-50 text-danger-700 ring-danger-600/20`,

  green: `bg-green-50 text-green-700 ring-green-600/20`,
  yellow: `bg-yellow-50 text-yellow-700 ring-yellow-600/20`,
  orange: `bg-orange-50 text-orange-700 ring-orange-600/20`,
  red: `bg-red-50 text-red-700 ring-red-600/20`,
  blue: `bg-blue-50 text-blue-700 ring-blue-600/20`,
  purple: `bg-purple-50 text-purple-700 ring-purple-600/20`,
};

const sizeVariants = {
  default: `px-2 py-1 text-xs`,
  jumbo: `select-none px-2 py-1 font-semibold text-2xl md:text-3xl lg:text-4xl`,
};

export const Badge: FunctionComponent<BadgeProps> = ({
  color = "default",
  size = "default",
  className,
  ...moreProps
}) => {
  return (
    <span
      data-testid={`badge-${color}`}
      className={twMerge(baseClassName, colorVariants[color], sizeVariants[size], className)}
      {...moreProps}
    />
  );
};
