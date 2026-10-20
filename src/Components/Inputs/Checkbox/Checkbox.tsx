import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps extends ComponentProps<"input"> {
  name: string;
  label?: string | ReactNode;
  checked?: boolean;
  containerProps?: ComponentProps<"div">;
  labelProps?: ComponentProps<"label">;
  disabled?: boolean;
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
  ...inputProps
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
          id={inputProps.id ?? name}
          name={name}
          ref={inputRef}
          type="checkbox"
          checked={checked}
          {...inputProps}
          className={twMerge(
            "h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600 cursor-pointer",
            inputProps.className,
          )}
          disabled={disabled}
        />
      </div>
      <div className="text-sm leading-6 flex-1 min-w-0">
        <label
          htmlFor={inputRef.current?.id ?? name}
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
