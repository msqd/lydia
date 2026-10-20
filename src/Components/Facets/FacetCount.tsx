export interface FacetCountProps {
  /** The count value to display */
  count: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FacetCount component displays a count value with consistent styling.
 * Used in facet labels to show the number of items matching a filter option.
 */
export function FacetCount({ count, className }: FacetCountProps) {
  const classes = ["text-[11px]", "text-gray-500", "font-light"];
  if (className) {
    classes.push(className);
  }

  return <span className={classes.join(" ")}>{count}</span>;
}
