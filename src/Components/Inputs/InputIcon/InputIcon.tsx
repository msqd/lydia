import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface InputIconProps extends ComponentProps<"div"> {
  /**
   * Position of the icon
   */
  position: "leading" | "trailing";
  /**
   * Optional size of the icon (default: normal)
   */
  size?: "normal" | "small";
  /**
   * Icon content (usually an SVG or icon component)
   */
  children: ReactNode;
}

/**
 * Icon component for input fields
 * Positions icons at the leading or trailing edge of input fields
 */
export function InputIcon({ children, className, position, size = "normal", ...props }: InputIconProps) {
  const styles = twMerge(
    "pointer-events-none col-start-1 row-start-1 self-center text-gray-400",
    position === "leading" && "ml-3",
    position === "trailing" && "mr-3 justify-self-end",
    size === "normal" && "size-5",
    size === "small" && "sm:size-4",
    className,
  );

  return (
    <div className={styles} aria-hidden="true" {...props}>
      {children}
    </div>
  );
}
