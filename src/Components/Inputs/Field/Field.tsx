import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const fieldWrapperClassName =
  "mt-2 flex rounded-sm bg-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary-600";
const defaultLabelClassName = "block text-sm/6 font-medium text-gray-900";
const helpTextClassName = "mt-2 text-sm text-gray-500";
const errorTextClassName = "mt-2 text-sm text-danger-600";

export interface FieldProps {
  controlId: string;
  helpTextId: string;
  errorId: string;
  cornerHintId: string;
  label?: ReactNode;
  labelClassName?: string;
  required?: boolean;
  cornerHint?: ReactNode;
  helpText?: ReactNode;
  errorMessage?: ReactNode;
  className?: string;
  /** The control. Its wrapper owns the gap under the label. */
  children: ReactNode;
}

/** The label, corner hint, help text and error shared by every text field. */
export function Field({
  controlId,
  helpTextId,
  errorId,
  cornerHintId,
  label,
  labelClassName,
  required,
  cornerHint,
  helpText,
  errorMessage,
  className,
  children,
}: FieldProps) {
  return (
    <div className={twMerge("w-full", className)}>
      {(label || cornerHint) && (
        <div className={cornerHint ? "flex justify-between items-baseline" : undefined}>
          {label && (
            <label htmlFor={controlId} className={twMerge(defaultLabelClassName, labelClassName)}>
              {label} {required && <span className="text-danger-500">*</span>}
            </label>
          )}
          {cornerHint && (
            <span id={cornerHintId} className="text-sm/6 text-gray-500">
              {cornerHint}
            </span>
          )}
        </div>
      )}
      {children}
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
}
