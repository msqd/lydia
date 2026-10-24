import { FacetResetLink } from "@msqd/lydia/Components/Facets";
import { HeadingLevel } from "@msqd/lydia/Components/Typography/HeadingLevel";
import { type FilterChangeHandler, type Filters, countActiveFilters } from "@msqd/lydia/Models/Filters";
import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { TransactionFiltersCard } from "./TransactionFiltersCard";

export interface TransactionsFiltersSidebarProps
  extends Omit<ComponentProps<typeof TransactionFiltersCard>, "filters" | "onFiltersChange" | "onResetFilters"> {
  /** Current filter values using unified Filters type */
  filters: Filters;

  /** Unified filter change handler */
  onFiltersChange: FilterChangeHandler;

  /** Handler for resetting all filters */
  onResetFilters: () => void;

  /** Custom title for the sidebar */
  title?: string;

  /** Whether to show default header */
  showDefaultHeader?: boolean;

  /** Custom className for the container */
  className?: string;
}

/**
 * TransactionsFiltersSidebar component that provides transaction filtering in a sidebar layout.
 * Designed to match the ExplorerPage tree view aesthetic with clean header and count displays.
 */
export function TransactionsFiltersSidebar({
  filters,
  onFiltersChange,
  onResetFilters,
  facets,
  title = "Filters",
  showDefaultHeader = true,
  className,
  ...props
}: TransactionsFiltersSidebarProps) {
  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className={twMerge("bg-white rounded-lg shadow overflow-hidden flex flex-col", className)} {...props}>
      {/* Header - consistent with Explorer sidebar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {activeFilterCount > 0 && onResetFilters && (
            <FacetResetLink title="all filters" onReset={onResetFilters}>
              reset all
            </FacetResetLink>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Under the sidebar's h3 title, its facets head at h4. */}
        <HeadingLevel level={3}>
          <TransactionFiltersCard
            filters={filters}
            onFiltersChange={onFiltersChange}
            onResetFilters={onResetFilters}
            facets={facets}
            showDefaultHeader={false}
            skipCardWrapper={true}
          />
        </HeadingLevel>
      </div>
    </div>
  );
}
