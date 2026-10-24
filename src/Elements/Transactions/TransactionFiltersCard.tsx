import { FacetListCard } from "@msqd/lydia/Components/Facets";
import { DateRangeFacet, MultipleChoiceFacet, PerformanceFacet } from "@msqd/lydia/Components/Facets/Variants";
import type { FilterChangeHandler, Filters } from "@msqd/lydia/Models/Filters";
import { canonicalStatusToken } from "@msqd/lydia/Models/Transactions/encoding";
import type { TransactionFacets } from "@msqd/lydia/Models/Transactions/facets";
import { type ComponentProps } from "react";

export interface TransactionFiltersCardProps
  extends Omit<ComponentProps<typeof FacetListCard>, "children" | "filters" | "onFiltersChange" | "onResetFilters"> {
  /** Current filter values using unified Filters type */
  filters: Filters;

  /** Unified filter change handler */
  onFiltersChange: FilterChangeHandler;

  /** Handler for resetting all filters */
  onResetFilters: () => void;

  /** Custom title for the filters card */
  title?: string;

  /** Whether to show default header */
  showDefaultHeader?: boolean;

  /**
   * Values each facet can offer, with their counts. Only the consumer knows what exists in the
   * whole result set, so a facet with no entry here offers nothing rather than something invented.
   */
  facets?: TransactionFacets;
}

/**
 * TransactionFiltersCard lays out the facets a transaction list can be narrowed by.
 *
 * It knows which facets exist and how they are presented. It does not know what values they can
 * offer: those come from the consumer, because only the consumer sees the whole result set. A
 * facet given no options renders empty, which is honest, rather than offering endpoints nobody
 * called and counts nobody measured.
 *
 * @example
 * ```tsx
 * <TransactionFiltersCard
 *   filters={filters}
 *   onFiltersChange={handleFilterChange}
 *   onResetFilters={() => setFilters({})}
 *   title="Filter Transactions"
 *   showDefaultHeader
 * />
 * ```
 */
export function TransactionFiltersCard({
  filters,
  onFiltersChange,
  onResetFilters,
  title = "Filters",
  showDefaultHeader = true,
  facets = {},
  ...cardProps
}: TransactionFiltersCardProps) {
  // "4xx" is a label, not a value: a consumer that still passes it means the class "4".
  const statusFilters = Array.isArray(filters.status)
    ? { ...filters, status: filters.status.map(canonicalStatusToken) }
    : filters;

  return (
    <FacetListCard
      filters={filters}
      onResetFilters={onResetFilters}
      title={title}
      showDefaultHeader={showDefaultHeader}
      {...cardProps}
    >
      {/* Time Filter - Date Range Selection */}
      <DateRangeFacet
        name="time"
        title="Time"
        filters={filters}
        onFiltersChange={onFiltersChange}
        startDatePlaceholder="Start date"
        endDatePlaceholder="End date"
        defaultOpen={true}
      />

      {/* Endpoint Filter - Multiple choice with "only" buttons */}
      <MultipleChoiceFacet
        name="endpoint"
        title="Endpoint"
        filters={filters}
        onFiltersChange={onFiltersChange}
        options={facets.endpoint}
        defaultOpen={true}
      />

      {/* Method Filter - Multiple choice with "only" buttons */}
      <MultipleChoiceFacet
        name="method"
        title="Method"
        filters={filters}
        onFiltersChange={onFiltersChange}
        options={facets.method}
        defaultOpen={true}
      />

      {/* Status Filter - Multiple choice with "only" buttons */}
      <MultipleChoiceFacet
        name="status"
        title="Status"
        filters={statusFilters}
        onFiltersChange={onFiltersChange}
        options={facets.status}
        defaultOpen={true}
      />

      {/* Cache Status Filter - Multiple choice with "only" buttons */}
      <MultipleChoiceFacet
        name="cacheStatus"
        title="Cache Status"
        filters={filters}
        onFiltersChange={onFiltersChange}
        options={facets.cacheStatus}
        defaultOpen={true}
      />

      {/* Flags Filter - Multiple choice with "only" buttons */}
      <MultipleChoiceFacet
        name="flags"
        title="Flags"
        filters={filters}
        onFiltersChange={onFiltersChange}
        options={facets.flags}
        defaultOpen={true}
      />

      {/* Tags Filter - Multiple choice with "only" buttons */}
      <MultipleChoiceFacet
        name="tags"
        title="Tags"
        filters={filters}
        onFiltersChange={onFiltersChange}
        options={facets.tags}
        defaultOpen={true}
      />

      {/* Performance Index Filter - TPDEX Range Slider */}
      <PerformanceFacet
        name="tpdex"
        title="Performance Index"
        filters={filters}
        onFiltersChange={onFiltersChange}
        defaultOpen={true}
      />
    </FacetListCard>
  );
}
