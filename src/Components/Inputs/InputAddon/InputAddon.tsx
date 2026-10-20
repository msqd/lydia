import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface InputAddonProps extends ComponentProps<"div"> {
  /**
   * Position of the addon relative to the input
   */
  position?: "leading" | "trailing";
  /**
   * Render inside the input's outline rather than as a box beside it
   */
  inline?: boolean;
  /**
   * Addon content, such as a protocol prefix, a currency or a unit
   */
  children?: ReactNode;
}

/**
 * Leading or trailing decoration for an input, such as a `https://` prefix, a `USD` suffix or a
 * `+1` dialling code. Unlike InputIcon it stays in the accessibility tree, since its content
 * carries meaning; give it an `id` and point the input's `aria-describedby` at it.
 */
export function InputAddon({ children, className, position = "leading", inline = false, ...props }: InputAddonProps) {
  const styles = twMerge(
    "flex items-center",
    !inline && "bg-white outline-1 -outline-offset-1 outline-gray-300 py-1.5 text-gray-500 sm:text-sm/6 h-[38px] px-3",
    inline && "shrink-0 text-gray-500 select-none sm:text-sm/6 h-full leading-[38px]",
    !inline && position === "leading" && "rounded-l-sm",
    !inline && position === "trailing" && "rounded-r-sm",
    inline && position === "leading" && "pr-2",
    inline && position === "trailing" && "pl-2",
    className,
  );

  return (
    <div className={styles} {...props}>
      {children}
    </div>
  );
}
