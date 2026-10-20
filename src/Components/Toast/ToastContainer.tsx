import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import type { ToastPosition } from "./Toast";

export interface ToastContainerProps {
  /**
   * Where to display the toasts on the screen
   */
  position?: ToastPosition;

  /**
   * CSS class for the container
   */
  className?: string;

  /**
   * Children elements (toast notifications)
   */
  children?: ReactNode;
}

const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
};

/**
 * Container component for toast notifications.
 * Use to position and organize toast notifications on the screen.
 *
 * @example
 * ```tsx
 * <ToastContainer position="top-right">
 *   <Toast id="toast-1" type="success" title="Success!" show={true} onClose={() => {}} />
 *   <Toast id="toast-2" type="error" title="Error!" show={true} onClose={() => {}} />
 * </ToastContainer>
 * ```
 */
export function ToastContainer({ position = "top-right", className, children }: ToastContainerProps) {
  return (
    <div
      data-testid="toast-container"
      className={twMerge(
        "fixed z-50 p-4 flex flex-col space-y-4 pointer-events-none max-h-screen overflow-hidden",
        positionStyles[position],
        className,
      )}
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export default ToastContainer;
