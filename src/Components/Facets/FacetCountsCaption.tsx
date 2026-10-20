import type { FilterMeta } from "@msqd/lydia/Models/Filters";
import type { ComponentProps } from "react";

export const DEFAULT_COUNTS_CAPTION = "Counts cover all transactions";

/**
 * The caption a facet shows, if any: none when the consumer passes an empty one, and none when no option has a count
 * to explain. A `0` is a count; the codes under a class count too.
 */
export function countsCaptionOf(
  options: (FilterMeta & { under?: FilterMeta[] })[],
  caption: string,
): string | undefined {
  const counted = options.some((option) => option.count !== undefined || option.under?.some(hasCount));
  return counted && caption ? caption : undefined;
}

const hasCount = (option: FilterMeta) => option.count !== undefined;

/**
 * Says what the counts of a facet are counts of. The facet's option group points at it with `aria-describedby`, so a
 * screen reader reads it on entering the group.
 */
export function FacetCountsCaption({ className, ...props }: ComponentProps<"p">) {
  return <p className={["text-xs text-gray-600", className].filter(Boolean).join(" ")} {...props} />;
}
