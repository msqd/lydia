import { type ComponentProps, type ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

// Constants for styling
const baseClassName = "w-full";
const defaultWrapperClassName =
  "mt-2 flex rounded-sm bg-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary-600";
const defaultTextareaClassName =
  "w-full border-0 px-1.5 py-1.5 text-gray-900 text-left placeholder:text-gray-400 focus:outline-none sm:text-sm/6";
const defaultLabelClassName = "block text-sm/6 font-medium text-gray-900";
const helpTextClassName = "mt-2 text-sm text-gray-500";
const errorTextClassName = "mt-2 text-sm text-danger-600";

// Textarea component props
export interface TextareaProps extends ComponentProps<"textarea"> {
  /**
   * The label for the textarea field
   */
  label?: ReactNode;

  /**
   * Help text to display below the textarea
   */
  helpText?: ReactNode;

  /**
   * ID for the help text element for accessibility
   */
  helpTextId?: string;

  /**
   * Error message to display below the textarea when in error state
   */
  errorMessage?: ReactNode;

  /**
   * ID for the error message element for accessibility
   */
  errorId?: string;

  /**
   * Corner hint text to display in the top right
   */
  cornerHint?: ReactNode;

  /**
   * ID for the corner hint element for accessibility
   */
  cornerHintId?: string;

  /**
   * Additional CSS classes for the textarea wrapper
   */
  wrapperClassName?: string;

  /**
   * Additional CSS classes for the label
   */
  labelClassName?: string;

  /**
   * Additional CSS classes for the textarea element
   */
  textareaClassName?: string;

  /**
   * Optional visual variant for the textarea
   */
  variant?: "default" | "error" | "success";

  /**
   * Whether the container should be hidden
   */
  hideContainer?: boolean;

  /**
   * Whether this input has an error (for use inside Input.Group or other custom setups)
   */
  isError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helpText,
      helpTextId,
      errorMessage,
      errorId,
      cornerHint,
      cornerHintId,
      className,
      wrapperClassName,
      labelClassName,
      textareaClassName,
      variant = "default",
      hideContainer = false,
      isError = false,
      ...props
    },
    ref,
  ) => {
    // Determine if we're in an error state either from variant or isError prop
    const hasError = variant === "error" || isError;

    return (
      <div className={twMerge(baseClassName, className)}>
        {!hideContainer && (
          <div className="flex justify-between items-baseline">
            {label && (
              <label htmlFor={props.id} className={twMerge(defaultLabelClassName, labelClassName)}>
                {label} {props.required && <span className="text-danger-500">*</span>}
              </label>
            )}
            {cornerHint && (
              <span id={cornerHintId} className="text-sm text-gray-500">
                {cornerHint}
              </span>
            )}
          </div>
        )}
        <div
          className={twMerge(
            defaultWrapperClassName,
            hasError && "outline-danger-500 focus-within:outline-danger-500",
            props.disabled && "opacity-50 cursor-not-allowed",
            wrapperClassName,
          )}
        >
          <textarea
            className={twMerge(defaultTextareaClassName, textareaClassName)}
            ref={ref}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={hasError ? errorId : helpTextId ? helpTextId : cornerHintId ? cornerHintId : undefined}
            {...props}
          />
        </div>
        {!hideContainer && helpText && !hasError && (
          <p className={helpTextClassName} id={helpTextId}>
            {helpText}
          </p>
        )}
        {!hideContainer && hasError && errorMessage && (
          <p className={errorTextClassName} id={errorId}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
