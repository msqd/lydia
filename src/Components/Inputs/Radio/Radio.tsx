import { useId } from "react";
import type { ReactNode } from "react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface RadioProps extends ComponentProps<"input"> {
  name: string;
  label?: string | ReactNode;
  checked?: boolean;
  containerProps?: ComponentProps<"div">;
  labelProps?: ComponentProps<"label">;
  disabled?: boolean;
}

export function Radio({
  name,
  label = undefined,
  checked = undefined,
  containerProps = {},
  labelProps = {},
  disabled = false,
  ...inputProps
}: RadioProps) {
  const id = inputProps.id ?? useId();

  return (
    <div
      {...containerProps}
      className={twMerge(
        "flex items-center gap-x-3 w-full",
        disabled ? "" : "cursor-pointer",
        containerProps.className,
      )}
    >
      <input
        id={id}
        name={name}
        type="radio"
        checked={checked}
        disabled={disabled}
        {...inputProps}
        className={twMerge(
          "h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600",
          disabled ? "opacity-60" : "cursor-pointer",
          inputProps.className,
        )}
      />
      <label
        htmlFor={id}
        {...labelProps}
        className={twMerge(
          "block text-sm font-medium leading-6 text-gray-900 flex-1",
          disabled ? "text-gray-400" : "cursor-pointer",
          labelProps.className,
        )}
      >
        {label ?? name}
      </label>
    </div>
  );
}
