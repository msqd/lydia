import { useCallback, useEffect, useRef } from "react";
import type { Ref } from "react";
import { twMerge } from "tailwind-merge";
import { type ChoiceInputProps, useChoiceInputId } from "../choiceInput";

export interface CheckboxProps extends ChoiceInputProps {
  /** Draws a partial tick: some, not all, of what the box stands for. Not an HTML attribute, so set on the DOM node. */
  indeterminate?: boolean;
}

export function Checkbox({
  name,
  label = undefined,
  checked = undefined,
  containerProps = {},
  labelProps = {},
  disabled = false,
  indeterminate = false,
  ref: consumerRef,
  ...inputProps
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = useChoiceInputId(inputProps.id);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      return assignRef(consumerRef, node);
    },
    [consumerRef],
  );

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent triggering the click event twice if the input itself is clicked
    const tagName = (e.target as Element).tagName;
    if (tagName !== "INPUT" && inputRef.current) {
      inputRef.current.click();
      inputRef.current.focus();
    }
  };

  return (
    <div
      {...containerProps}
      className={twMerge(
        "relative flex gap-x-3 select-none w-full",
        containerProps.className,
        disabled ? "" : "cursor-pointer",
      )}
      onClick={handleContainerClick}
    >
      <div className="flex h-6 items-center">
        <input
          name={name}
          type="checkbox"
          checked={checked}
          {...inputProps}
          id={id}
          ref={setInputRef}
          className={twMerge(
            "lydia-input h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600 cursor-pointer",
            inputProps.className,
          )}
          disabled={disabled}
        />
      </div>
      <div className="text-sm leading-6 flex-1 min-w-0">
        <label
          htmlFor={id}
          {...labelProps}
          className={twMerge("font-medium text-gray-900 block", labelProps.className, disabled ? "" : "cursor-pointer")}
          onClick={(e) => {
            // prevent default because the container's click handler will already handle this
            e.preventDefault();
          }}
        >
          {label ?? name}
        </label>
      </div>
    </div>
  );
}

/** Sets an object or callback ref, and returns the cleanup of a callback ref when it has one. */
function assignRef<T>(ref: Ref<T> | undefined, node: T | null): (() => void) | void {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}
