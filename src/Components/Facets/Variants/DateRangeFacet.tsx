import { DateRangeSelector } from "@msqd/lydia/Components/Inputs";
import type { DateRange } from "@msqd/lydia/Components/Inputs/DateRangeSelector";
import { Foldable, type FoldableProps } from "@msqd/lydia/Components/Utilities/Foldable";
import { type FilterChangeHandler, type Filters, readDates } from "@msqd/lydia/Models/Filters";
import { type ComponentProps } from "react";
import { FacetResetLink } from "../FacetResetLink";

export interface DateRangeFacetProps extends ComponentProps<"div"> {
  /** Filter name/key in the filters object */
  name: string;
  /** Display title for the facet */
  title: string;
  /** Current filter values */
  filters: Filters;
  /** Unified filter change handler */
  onFiltersChange: FilterChangeHandler;
  /** Whether the facet should be open by default */
  defaultOpen?: boolean;
  /**
   * Where the facet's title sits in the document outline, if that is not `h5`.
   *
   * Forwarded to `Foldable`, which draws the title and cannot know what
   * precedes it. A rail headed `h2` whose facets are fixed at `h5` skips two
   * levels, which is WCAG 1.3.1 -- and a consumer had no way to say so, because
   * this component did not pass the prop on.
   */
  headingLevel?: FoldableProps["headingLevel"];
  /** Placeholder text for start date input */
  startDatePlaceholder?: string;
  /** Placeholder text for end date input */
  endDatePlaceholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DateRangeFacet component for date range filtering using a date range selector.
 * Allows users to select a start and end date to filter results.
 *
 * @example
 * ```tsx
 * <DateRangeFacet
 *   name="time"
 *   title="Time Range"
 *   filters={filters}
 *   onFiltersChange={onFiltersChange}
 *   startDatePlaceholder="Start date"
 *   endDatePlaceholder="End date"
 * />
 * ```
 */
export function DateRangeFacet({
  name,
  title,
  filters,
  onFiltersChange,
  defaultOpen = true,
  headingLevel,
  startDatePlaceholder = "Start date",
  endDatePlaceholder = "End date",
  className,
  ...props
}: DateRangeFacetProps) {
  // Handle date range changes
  const handleDateRangeChange = (range: DateRange) => {
    // Only pass non-empty values to avoid validation issues
    const filterValue: { startDate?: string; endDate?: string } = {};

    if (range.startDate && range.startDate.trim()) {
      filterValue.startDate = range.startDate;
    }

    if (range.endDate && range.endDate.trim()) {
      filterValue.endDate = range.endDate;
    }

    // If both values are empty, pass undefined to clear the filter
    onFiltersChange(name, Object.keys(filterValue).length > 0 ? filterValue : undefined);
  };

  // Get current date range value
  const dateRangeValue = readDates(filters, name);
  const dateRange: DateRange = {
    startDate: dateRangeValue.startDate || "",
    endDate: dateRangeValue.endDate || "",
  };

  // Check if there are active filters
  const hasActiveFilters = !!(dateRangeValue.startDate || dateRangeValue.endDate);

  const handleReset = () => {
    onFiltersChange(name, undefined);
  };

  const titleAction = hasActiveFilters ? (
    <FacetResetLink title={title} onReset={handleReset}>
      reset
    </FacetResetLink>
  ) : undefined;

  return (
    <Foldable
      title={title}
      titleAction={titleAction}
      defaultOpen={defaultOpen}
      headingLevel={headingLevel}
      className={className}
      {...props}
    >
      <DateRangeSelector
        value={dateRange}
        onChange={handleDateRangeChange}
        startDatePlaceholder={startDatePlaceholder}
        endDatePlaceholder={endDatePlaceholder}
      />
    </Foldable>
  );
}
