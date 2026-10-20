import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface KeyboardShortcutProps extends ComponentProps<"kbd"> {
  /**
   * Shortcut keys to display
   */
  shortcut: string;
}

/**
 * A keyboard shortcut display component
 * Shows keyboard shortcut keys in a styled format
 */
export function KeyboardShortcut({ shortcut, className, ...props }: KeyboardShortcutProps) {
  return (
    <div className="flex items-center h-full py-1.5 pr-1.5">
      <kbd
        className={twMerge(
          "inline-flex items-center rounded-sm border border-gray-200 px-1 font-sans text-xs text-gray-500",
          className,
        )}
        {...props}
      >
        {shortcut}
      </kbd>
    </div>
  );
}
