import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Button, type ButtonProps } from "../../Buttons";

export interface InputButtonProps extends Omit<ButtonProps, "size"> {
  /**
   * Position of the button relative to the input
   */
  position?: "trailing" | "leading";
  /**
   * Optional icon to display in the button
   */
  icon?: ReactNode;
  /**
   * Children content (button text)
   */
  children?: ReactNode;
}

/**
 * Button component designed for use within input fields
 * Uses the project's Button component as a base with input-specific styling
 */
export function InputButton({
  children,
  className,
  position = "trailing",
  icon,
  variant = "secondary",
  ...props
}: InputButtonProps) {
  const inputButtonStyles = twMerge(
    // Base input button styles
    "h-[38px] flex items-center gap-x-1.5 px-3",
    // Position-specific border radius
    position === "trailing" && "rounded-l-none",
    position === "leading" && "rounded-r-none",
    // Override default Button padding since we need specific height
    "!py-0",
    className,
  );

  return (
    <Button variant={variant} className={inputButtonStyles} {...props}>
      {icon}
      {children}
    </Button>
  );
}
