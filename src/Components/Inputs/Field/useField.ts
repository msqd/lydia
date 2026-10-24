import { type ReactNode, useId } from "react";

export interface FieldOptions {
  id?: string;
  helpTextId?: string;
  errorId?: string;
  cornerHintId?: string;
  helpText?: ReactNode;
  errorMessage?: ReactNode;
  cornerHint?: ReactNode;
  /** True when the variant alone marks the control invalid, with or without a message. */
  invalid?: boolean;
  /** The consumer's own `aria-describedby`, kept after the ones the field generates. */
  describedBy?: string;
  /** False when the frame is not rendered, so no description exists to point at. */
  framed?: boolean;
}

/**
 * Generates the ids of a field (control, help text, error, corner hint) unless the consumer passes
 * them, and derives the ARIA attributes of its control from the descriptions actually rendered.
 */
export function useField({
  id,
  helpTextId,
  errorId,
  cornerHintId,
  helpText,
  errorMessage,
  cornerHint,
  invalid = false,
  describedBy,
  framed = true,
}: FieldOptions) {
  const generated = useId();
  const ids = {
    control: id ?? generated,
    help: helpTextId ?? `${generated}-help`,
    error: errorId ?? `${generated}-error`,
    cornerHint: cornerHintId ?? `${generated}-hint`,
  };

  const descriptions = [
    framed && errorMessage ? ids.error : null,
    framed && helpText && !errorMessage ? ids.help : null,
    framed && cornerHint ? ids.cornerHint : null,
    describedBy,
  ].filter(Boolean);

  return {
    ids,
    controlProps: {
      id: ids.control,
      "aria-describedby": descriptions.length > 0 ? descriptions.join(" ") : undefined,
      "aria-invalid": invalid || Boolean(errorMessage) ? (true as const) : undefined,
    },
  };
}
