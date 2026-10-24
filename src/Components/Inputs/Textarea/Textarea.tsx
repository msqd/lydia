import { type ComponentProps, type ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { Field, fieldWrapperClassName, useField } from "../Field";

const defaultTextareaClassName =
  "w-full border-0 px-1.5 py-1.5 text-gray-900 text-left placeholder:text-gray-400 focus:outline-none sm:text-sm/6";

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
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) => {
    const hasError = variant === "error" || isError;
    const { ids, controlProps } = useField({
      id,
      helpTextId,
      errorId,
      cornerHintId,
      helpText,
      errorMessage,
      cornerHint,
      invalid: hasError,
      describedBy,
      framed: !hideContainer,
    });

    const textarea = (
      <div
        className={twMerge(
          fieldWrapperClassName,
          hasError && "outline-danger-500 focus-within:outline-danger-500",
          props.disabled && "opacity-50 cursor-not-allowed",
          wrapperClassName,
        )}
      >
        <textarea
          className={twMerge(defaultTextareaClassName, textareaClassName)}
          ref={ref}
          {...controlProps}
          {...props}
        />
      </div>
    );

    if (hideContainer) {
      return <div className={twMerge("w-full", className)}>{textarea}</div>;
    }

    return (
      <Field
        controlId={ids.control}
        helpTextId={ids.help}
        errorId={ids.error}
        cornerHintId={ids.cornerHint}
        label={label}
        labelClassName={labelClassName}
        required={props.required}
        cornerHint={cornerHint}
        helpText={helpText}
        errorMessage={errorMessage}
        className={className}
      >
        {textarea}
      </Field>
    );
  },
);

Textarea.displayName = "Textarea";
