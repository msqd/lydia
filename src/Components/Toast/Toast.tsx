import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import { twMerge } from "tailwind-merge";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

export interface ToastProps extends ComponentProps<"div"> {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  show: boolean;
}

const typeClasses: Record<ToastType, string> = {
  success: "bg-success-50 border-success-200 text-success-800",
  error: "bg-danger-50 border-danger-200 text-danger-800",
  warning: "bg-warning-50 border-warning-200 text-warning-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconClasses: Record<ToastType, string> = {
  success: "text-success-500",
  error: "text-danger-500",
  warning: "text-warning-500",
  info: "text-blue-500",
};

const icons: Record<ToastType, ReactElement> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * Toast component for displaying notifications.
 *
 * @example
 * ```tsx
 * <Toast
 *   id="toast-1"
 *   type="success"
 *   title="Operation successful"
 *   message="Your changes have been saved"
 *   show={true}
 *   onClose={(id) => removeToast(id)}
 * />
 * ```
 */
export function Toast({
  id,
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  show,
  className,
  ...props
}: ToastProps) {
  const [isShowing, setIsShowing] = useState(show);

  // Reset showing state when show prop changes
  useEffect(() => {
    setIsShowing(show);
  }, [show]);

  // Auto-close the toast after duration
  useEffect(() => {
    if (!isShowing || !duration) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isShowing, duration]);

  // Handle closing the toast
  const handleClose = () => {
    setIsShowing(false);
  };

  return (
    <Transition
      show={isShowing}
      as={Fragment}
      appear={true}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterLeave={() => onClose(id)}
    >
      <div
        className={twMerge(
          "w-full min-w-[300px] max-w-md shadow-lg rounded-lg pointer-events-auto border",
          typeClasses[type],
          className,
        )}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        {...props}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className={twMerge("flex-shrink-0", iconClasses[type])}>{icons[type]}</div>
            <div className="ml-3 flex-1 mr-2">
              <p className="text-sm font-medium break-words">{title}</p>
              {message && <p className="mt-1 text-sm opacity-90 break-words">{message}</p>}
            </div>
            <div className="flex-shrink-0 flex">
              <button
                type="button"
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleClose}
                aria-label="Close notification"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
