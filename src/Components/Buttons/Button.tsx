import type { ComponentProps, FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClassName = "font-semibold cursor-pointer shadow-xs";

const sizeStyles: Record<ButtonSize, string> = {
  xs: "rounded-sm px-2 py-1 text-xs",
  sm: "rounded-sm px-2 py-1 text-sm",
  md: "rounded-sm px-2.5 py-1.5 text-sm", // Default size
  lg: "rounded-sm px-3 py-2 text-sm",
  xl: "rounded-sm px-3.5 py-2.5 text-sm",
};

const variantClassNames = {
  primary:
    "text-white bg-primary-500 hover:bg-primary-400 " +
    "focus-visible:outline-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "ring-1 ring-inset ring-primary-600 " +
    "disabled:ring-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed " +
    "active:bg-primary-600 active:ring-primary-700",
  secondary:
    "bg-white text-gray-900 hover:bg-gray-50 " +
    "focus-visible:outline-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "ring-1 ring-inset ring-gray-300 " +
    "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed " +
    "active:bg-gray-100 active:ring-gray-300",
};

export const Button: FunctionComponent<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...moreProps
}) => {
  return (
    <button className={twMerge(baseClassName, variantClassNames[variant], sizeStyles[size], className)} {...moreProps}>
      {children}
    </button>
  );
};
