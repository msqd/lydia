/**
 * Base filter types inspired by HARP's filter system
 * Designed to be URL-serializable and provide a unified state management approach
 */

/** Array of string values for multi-select filters (checkboxes) */
export type ArrayFilter = string[] | undefined;

/** Min/max range filter for numeric values (sliders) */
export interface MinMaxFilter {
  min?: number;
  max?: number;
}

/** Single value filter for radio buttons */
export type SingleFilter = string | undefined;

/** Date range filter */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

/** The value one facet holds. Read it through `readArray`, `readRange`, `readDates` or `readSingle`. */
export type FilterValue = ArrayFilter | MinMaxFilter | SingleFilter | DateRangeFilter;

/** Generic filters container */
export type Filters = Record<string, FilterValue>;
/** Filter metadata for display and validation */
export interface FilterMeta {
  name: string;
  count?: number;
  label?: string;
  /** What the label stands for, in words ("Client Error" for "4xx"). Shown as a tooltip and read as the description. */
  description?: string;
}

/**
 * A value of a facet. With `under`, it is a class whose values hang beneath it (a status class and its codes): its
 * `name` is the class token and each `under` name a code token (ADR 0002).
 */
export interface FacetOption extends FilterMeta {
  under?: FilterMeta[];
}

/** Range filter metadata with marks for sliders */
export interface RangeFilterMeta {
  min: number;
  max: number;
  step?: number;
  marks?: Array<{
    value: number;
    label: string;
    className?: string;
  }>;
}

/** Unified filter state change handler */
export type FilterChangeHandler<T = FilterValue> = (filterName: string, value: T) => void;
