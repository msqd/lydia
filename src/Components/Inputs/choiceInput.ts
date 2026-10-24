import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

/** Props shared by the controls that pair a native input with a label: `Checkbox` and `Radio`. */
export interface ChoiceInputProps extends ComponentProps<"input"> {
  name: string;
  label?: string | ReactNode;
  checked?: boolean;
  containerProps?: ComponentProps<"div">;
  labelProps?: ComponentProps<"label">;
  disabled?: boolean;
}

/** The id of the input, generated when the consumer passes none. `useId` always runs to keep hook order stable. */
export function useChoiceInputId(id: string | undefined): string {
  const generatedId = useId();
  return id ?? generatedId;
}
