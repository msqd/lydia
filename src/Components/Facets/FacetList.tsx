import type { FilterChangeHandler, Filters } from "@msqd/lydia/Models/Filters";
import { type ComponentProps, type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface FacetListProps extends ComponentProps<"div"> {
  /** Whether to add dividers between facet sections */
  hasDividers?: boolean;

  /** Additional CSS classes for the container */
  className?: string;

  /** Filter facet components as children */
  children: ReactNode;
}

/**
 * Layout for a collection of filter facets: a container, and optional dividers between them.
 *
 * It holds no filter state and provides no context, so each facet is given its own `filters` and
 * `onFiltersChange` and reads them itself. That is deliberate — see `useFacetState` below if you
 * want somewhere to keep the state — but it does mean this component has nothing to do with the
 * values, and asking it for them would be asking for something it never reads.
 *
 * @example
 * ```tsx
 * const { filters, handleFilterChange } = useFacetState();
 *
 * <FacetList>
 *   <MultipleChoiceFacet name="status" title="Status" filters={filters} onFiltersChange={handleFilterChange} ... />
 *   <SingleChoiceFacet name="method" title="Method" filters={filters} onFiltersChange={handleFilterChange} ... />
 * </FacetList>
 * ```
 */
export function FacetList({ hasDividers = true, className, children, ...props }: FacetListProps) {
  const containerClasses = twMerge(
    "overflow-hidden text-gray-900 sm:text-sm",
    hasDividers && "divide-y divide-gray-100",
    className,
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * Hook to help manage filter state in components using FacetList
 * Provides common filter operations and URL serialization helpers
 */
export function useFacetState(initialFilters: Filters = {}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleFilterChange: FilterChangeHandler = (filterName: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const updateFilter = (filterName: string, value: any) => {
    handleFilterChange(filterName, value);
  };

  const removeFilter = (filterName: string) => {
    setFilters((prev) => {
      const { [filterName]: removed, ...rest } = prev;
      return rest;
    });
  };

  return {
    filters,
    setFilters,
    handleFilterChange,
    resetFilters,
    updateFilter,
    removeFilter,
  };
}
