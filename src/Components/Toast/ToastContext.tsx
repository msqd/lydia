import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Toast } from "./Toast";
import type { ToastPosition, ToastType } from "./Toast";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  show: boolean;
  onClose?: () => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id" | "show">) => string;
  updateToast: (id: string, toast: Partial<Omit<ToastItem, "id">>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const positionStyles: Record<ToastPosition, string> = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
};

interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  maxToasts?: number;
  position?: ToastPosition;
}

/**
 * Provider component that manages toast notifications.
 * Use with the useToast hook to add, remove, and manage toasts.
 *
 * @example
 * ```tsx
 * // In your app root component:
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // In any component:
 * const { addToast } = useToast();
 *
 * // Show a success notification
 * addToast({
 *   type: "success",
 *   title: "Success!",
 *   message: "Operation completed successfully",
 * });
 * ```
 */
export function ToastProvider({
  children,
  defaultDuration = 5000,
  maxToasts = 5,
  position = "top-right",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Add a new toast
  const addToast = useCallback(
    (toast: Omit<ToastItem, "id" | "show">) => {
      // Generate a unique ID based on timestamp
      const id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      setToasts((prevToasts) => {
        // If we have reached the maximum number of toasts, remove the oldest one
        const newToasts = prevToasts.length >= maxToasts ? prevToasts.slice(1) : prevToasts;

        return [
          ...newToasts,
          {
            ...toast,
            id,
            show: true,
            duration: toast.duration ?? defaultDuration,
          },
        ];
      });

      return id;
    },
    [defaultDuration, maxToasts],
  );

  // Update an existing toast
  const updateToast = useCallback((id: string, toast: Partial<Omit<ToastItem, "id">>) => {
    setToasts((prevToasts) => prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t)));
  }, []);

  // Remove a toast
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => {
      const toastToRemove = prevToasts.find((t) => t.id === id);

      if (toastToRemove?.onClose) {
        toastToRemove.onClose();
      }

      return prevToasts.filter((t) => t.id !== id);
    });
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Determine if we need to reverse the stack based on position
  const isBottomPosition = position.startsWith("bottom");

  // Create a copy of the toasts array to avoid modifying the original
  const orderedToasts = [...toasts];

  // If bottom position, reverse the order so new toasts appear at the bottom
  if (isBottomPosition) {
    orderedToasts.reverse();
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        updateToast,
        removeToast,
        clearAllToasts,
      }}
    >
      {children}
      <div
        className={twMerge(
          "fixed z-50 p-4 flex flex-col space-y-4 pointer-events-none max-h-screen overflow-hidden",
          positionStyles[position],
        )}
        aria-live="polite"
      >
        {orderedToasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            show={toast.show}
            onClose={removeToast}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast context.
 * Returns methods for adding, removing, and managing toasts.
 *
 * @returns ToastContextValue
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// Convenience hooks for different toast types

/**
 * Hook to show success toasts.
 *
 * @example
 * ```tsx
 * const success = useSuccessToast();
 *
 * // Show a success toast
 * success("Operation successful", "Your changes have been saved");
 * ```
 */
export function useSuccessToast() {
  const { addToast } = useToast();

  return useCallback(
    (title: string, message?: string, options?: Omit<ToastItem, "id" | "show" | "type" | "title" | "message">) =>
      addToast({ type: "success", title, message, ...options }),
    [addToast],
  );
}

/**
 * Hook to show error toasts.
 *
 * @example
 * ```tsx
 * const error = useErrorToast();
 *
 * // Show an error toast
 * error("Error", "Something went wrong");
 * ```
 */
export function useErrorToast() {
  const { addToast } = useToast();

  return useCallback(
    (title: string, message?: string, options?: Omit<ToastItem, "id" | "show" | "type" | "title" | "message">) =>
      addToast({ type: "error", title, message, ...options }),
    [addToast],
  );
}

/**
 * Hook to show warning toasts.
 *
 * @example
 * ```tsx
 * const warning = useWarningToast();
 *
 * // Show a warning toast
 * warning("Warning", "This action cannot be undone");
 * ```
 */
export function useWarningToast() {
  const { addToast } = useToast();

  return useCallback(
    (title: string, message?: string, options?: Omit<ToastItem, "id" | "show" | "type" | "title" | "message">) =>
      addToast({ type: "warning", title, message, ...options }),
    [addToast],
  );
}

/**
 * Hook to show info toasts.
 *
 * @example
 * ```tsx
 * const info = useInfoToast();
 *
 * // Show an info toast
 * info("Information", "Your session will expire in 5 minutes");
 * ```
 */
export function useInfoToast() {
  const { addToast } = useToast();

  return useCallback(
    (title: string, message?: string, options?: Omit<ToastItem, "id" | "show" | "type" | "title" | "message">) =>
      addToast({ type: "info", title, message, ...options }),
    [addToast],
  );
}
