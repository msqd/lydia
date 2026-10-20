import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { Card } from "@msqd/lydia/Components/Cards";
import { HeadingLevel } from "@msqd/lydia/Components/Typography/HeadingLevel";
import type { Filters } from "@msqd/lydia/Models/Filters";
import { type ComponentProps, type ReactNode } from "react";
import { FacetList } from "./FacetList";

export interface FacetListCardProps extends Omit<ComponentProps<typeof Card>, "children"> {
  /** Current filter values, read to decide whether the reset button has anything to reset */
  filters: Filters;

  /** Handler for resetting all filters */
  onResetFilters?: () => void;

  /** Custom header content (e.g., title, reset button) */
  headerContent?: ReactNode;

  /** Whether to show default header with title and reset button */
  showDefaultHeader?: boolean;

  /** Title for the default header */
  title?: string;

  /** Filter facet components as children */
  children: ReactNode;

  /** Whether to skip the Card wrapper and render directly as FacetList */
  skipCardWrapper?: boolean;
}

/**
 * FacetListCard component that provides a card container for filter facets.
 * This component combines the Card layout with FacetList functionality,
 * providing a clean container for facet collections.
 *
 * @example
 * ```tsx
 * <FacetListCard
 *   filters={filters}
 *   onResetFilters={() => setFilters({})}
 *   title="Filters"
 *   showDefaultHeader
 * >
 *   <MultipleChoiceFacet name="status" title="Status" ... />
 *   <SingleChoiceFacet name="method" title="Method" ... />
 * </FacetListCard>
 * ```
 */
export function FacetListCard({
  filters,
  onResetFilters,
  headerContent,
  showDefaultHeader = false,
  title = "Filters",
  children,
  skipCardWrapper = false,
  ...cardProps
}: FacetListCardProps) {
  const hasActiveFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v !== undefined && v !== null && v !== false);
    }
    return value !== undefined && value !== null && value !== "";
  });

  const defaultHeader = showDefaultHeader ? (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {onResetFilters && hasActiveFilters && (
        <button
          className="text-gray-500 mx-1 font-normal text-xs hover:text-gray-700 transition-colors cursor-pointer"
          onClick={onResetFilters}
          type="button"
          aria-label="Reset all filters"
        >
          <ArrowPathIcon className="h-3 w-3 inline-block mr-1" />
          reset
        </button>
      )}
    </div>
  ) : null;

  // If skipCardWrapper is true, render FacetList directly
  if (skipCardWrapper) {
    return <FacetList>{children}</FacetList>;
  }

  return (
    <Card
      header={headerContent || defaultHeader}
      hasDefaultPadding={false}
      headerClassName={showDefaultHeader || headerContent ? undefined : "hidden"}
      {...cardProps}
    >
      {/* Under the card's own h3 title, its facets head at h4. */}
      {showDefaultHeader && !headerContent ? (
        <HeadingLevel level={3}>
          <FacetList>{children}</FacetList>
        </HeadingLevel>
      ) : (
        <FacetList>{children}</FacetList>
      )}
    </Card>
  );
}
