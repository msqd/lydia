import { type ComponentProps, type ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { InputButton, type InputButtonProps } from "../InputButton";
import { InputIcon } from "../InputIcon";
import { KeyboardShortcut } from "../KeyboardShortcut";

export interface InputProps extends ComponentProps<"input"> {
  // Basic props
  /**
   * The label for the input field
   */
  label?: ReactNode;
  /**
   * Optional help text displayed below the input
   */
  helpText?: string;
  /**
   * ID for the help text element
   */
  helpTextId?: string;
  /**
   * Optional error message
   */
  errorMessage?: string;
  /**
   * ID for the error message element
   */
  errorId?: string;
  /**
   * Optional corner hint text (shown on the right side of the label)
   */
  cornerHint?: string;
  /**
   * ID for the corner hint element
   */
  cornerHintId?: string;

  // Styling props
  /**
   * Optional CSS classes to add to the input wrapper
   */
  wrapperClassName?: string;
  /**
   * Optional CSS classes to add to the label
   */
  labelClassName?: string;
  /**
   * Optional CSS classes to add directly to the input element
   */
  inputClassName?: string;

  /**
   * Visual state variant of the input.
   */
  variant?: "default" | "error" | "success";

  // Icon props (simplified)
  /**
   * Leading icon (ReactNode for flexibility)
   */
  leadingIcon?: ReactNode;
  /**
   * Trailing icon (ReactNode for flexibility)
   */
  trailingIcon?: ReactNode;

  // Button props (simplified)
  /**
   * Leading button configuration
   */
  leadingButton?: Omit<InputButtonProps, "position">;
  /**
   * Trailing button configuration
   */
  trailingButton?: Omit<InputButtonProps, "position">;

  // Keyboard shortcut prop (simplified)
  /**
   * Keyboard shortcut to display
   */
  keyboardShortcut?: string;

  // Advanced customization (for edge cases)
  /**
   * Custom leading element (overrides leadingIcon and leadingButton)
   */
  leadingElement?: ReactNode;
  /**
   * Custom trailing element (overrides trailingIcon, trailingButton, and keyboardShortcut)
   */
  trailingElement?: ReactNode;

  // Backward compatibility props
  /**
   * Hide container div (creates inline input)
   */
  hideContainer?: boolean;
}

const baseClassName = "w-full";
const defaultWrapperClassName =
  "mt-2 flex items-center h-[38px] rounded-sm bg-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary-600";
const defaultInputClassName =
  "lydia-input w-full border-0 px-1.5 text-gray-900 text-left placeholder:text-gray-400 focus:outline-none sm:text-sm/6 h-full flex items-center leading-[38px]";
const defaultLabelClassName = "block text-sm/6 font-medium text-gray-900";
const helpTextClassName = "mt-2 text-sm text-gray-500";
const errorTextClassName = "mt-2 text-sm text-danger-600";

/**
 * Input component with cleaner props interface
 * Provides simplified props for common use cases while maintaining flexibility
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      // Basic props
      label,
      helpText,
      helpTextId,
      errorMessage,
      errorId,
      cornerHint,
      cornerHintId,

      // Styling props
      className,
      wrapperClassName,
      labelClassName,
      inputClassName,

      // State
      variant = "default",

      // Icon props
      leadingIcon,
      trailingIcon,

      // Button props
      leadingButton,
      trailingButton,

      // Keyboard shortcut
      keyboardShortcut,

      // Advanced customization
      leadingElement,
      trailingElement,

      // Backward compatibility
      hideContainer = false,

      // Input props
      id,
      ...props
    },
    ref,
  ) => {
    // Handle backward compatibility props
    const resolvedError = variant === "error";
    const resolvedSuccess = variant === "success";

    // Derive aria props based on helpText and errorMessage
    const ariaProps: Record<string, string> = {};
    if (helpText && helpTextId) {
      ariaProps["aria-describedby"] = helpTextId;
    }
    if (errorMessage && errorId) {
      ariaProps["aria-describedby"] = errorId;
      ariaProps["aria-invalid"] = "true";
    }

    // Combine cornerHintId with ariaProps if it exists
    if (cornerHint && cornerHintId) {
      ariaProps["aria-describedby"] = ariaProps["aria-describedby"]
        ? `${ariaProps["aria-describedby"]} ${cornerHintId}`
        : cornerHintId;
    }

    // Determine state styles
    let stateWrapperClass = "";
    let stateInputClass = "";

    if (resolvedError) {
      stateWrapperClass = "outline-danger-300 focus-within:outline-danger-600";
      stateInputClass = "text-danger-900 placeholder:text-danger-300";
    } else if (resolvedSuccess) {
      stateWrapperClass = "outline-success-300 focus-within:outline-success-600";
      stateInputClass = "text-success-900 placeholder:text-success-400";
    }

    // Build leading element
    const resolvedLeadingElement =
      leadingElement ||
      (leadingButton ? <InputButton position="leading" {...leadingButton} /> : null) ||
      (leadingIcon ? <InputIcon position="leading">{leadingIcon}</InputIcon> : null);

    // Build trailing element
    const resolvedTrailingElement =
      trailingElement ||
      (trailingButton ? <InputButton position="trailing" {...trailingButton} /> : null) ||
      (keyboardShortcut ? <KeyboardShortcut shortcut={keyboardShortcut} /> : null) ||
      (trailingIcon ? <InputIcon position="trailing">{trailingIcon}</InputIcon> : null);

    // Adjust spacing when using elements
    let leadingPadding = "";
    let trailingPadding = "";

    if (resolvedLeadingElement) {
      leadingPadding = "pl-10 sm:pl-9";
    }

    if (resolvedTrailingElement) {
      trailingPadding = "pr-10 sm:pr-9";
    }

    // Special handling for date inputs
    let dateInputClass = "";
    if (props.type === "date") {
      const isEmpty = !props.value || props.value === "";
      dateInputClass = `pr-8 ${isEmpty ? "text-gray-400" : "text-gray-900"} placeholder:text-gray-400`;
    }

    // Helper component for date picker icon
    const DatePickerIcon = () => (
      <div
        className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 ${props.disabled ? "text-gray-300" : "text-gray-400"}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 sm:size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      </div>
    );

    // Input element
    const inputElement = (
      <div
        className={twMerge(
          defaultWrapperClassName,
          stateWrapperClass,
          resolvedLeadingElement || resolvedTrailingElement || props.type === "date"
            ? "grid grid-cols-1 pl-0 relative"
            : "",
          props.disabled ? "bg-gray-50 outline-gray-200 cursor-not-allowed" : "",
          hideContainer ? "mt-0" : "",
          wrapperClassName,
        )}
      >
        {resolvedLeadingElement}
        <input
          ref={ref}
          type={props.type || "text"}
          id={id}
          className={twMerge(
            defaultInputClassName,
            stateInputClass,
            resolvedLeadingElement || resolvedTrailingElement || props.type === "date" ? "col-start-1 row-start-1" : "",
            leadingPadding,
            trailingPadding,
            props.type === "date" ? dateInputClass : "",
            props.type === "date" ? "calendar-icon-right" : "",
            props.disabled ? "text-gray-500 placeholder:text-gray-400" : "",
            inputClassName,
          )}
          {...ariaProps}
          {...props}
        />
        {props.type === "date" && <DatePickerIcon />}
        {resolvedTrailingElement}
      </div>
    );

    // If hideContainer is true, only return the input element
    if (hideContainer) {
      return inputElement;
    }

    // Label component
    const LabelComponent = () => {
      if (!label && !cornerHint) return null;

      return (
        <div className={cornerHint ? "flex justify-between" : undefined}>
          {label && (
            <label htmlFor={id} className={twMerge(defaultLabelClassName, labelClassName)}>
              {label}
            </label>
          )}
          {cornerHint && (
            <span id={cornerHintId} className="text-sm/6 text-gray-500">
              {cornerHint}
            </span>
          )}
        </div>
      );
    };

    return (
      <div className={twMerge(baseClassName, className)}>
        <LabelComponent />
        <div className="mt-2">{inputElement}</div>

        {helpText && !errorMessage && (
          <p id={helpTextId} className={helpTextClassName}>
            {helpText}
          </p>
        )}

        {errorMessage && (
          <p id={errorId} className={errorTextClassName}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
