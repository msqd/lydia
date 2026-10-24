import { twMerge } from "tailwind-merge";
import { type ChoiceInputProps, useChoiceInputId } from "../choiceInput";

export type RadioProps = ChoiceInputProps;

export function Radio({
  name,
  label = undefined,
  checked = undefined,
  containerProps = {},
  labelProps = {},
  disabled = false,
  ...inputProps
}: RadioProps) {
  const id = useChoiceInputId(inputProps.id);

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
        name={name}
        type="radio"
        checked={checked}
        disabled={disabled}
        {...inputProps}
        id={id}
        className={twMerge(
          "lydia-input h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600",
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
