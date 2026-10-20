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

/** Boolean flags filter */
export interface BooleanFlagsFilter {
  [key: string]: boolean;
}

/** Generic filters container */
export type Filters = Record<string, ArrayFilter | MinMaxFilter | SingleFilter | DateRangeFilter | BooleanFlagsFilter>;

/** Filter metadata for display and validation */
export interface FilterMeta {
  name: string;
  count?: number;
  label?: string;
  /** What the label stands for, in words ("Client Error" for "4xx"). Shown as a tooltip and read as the description. */
  description?: string;
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

/** Filter facet configuration */
export interface FilterFacetConfig {
  name: string;
  title: string;
  type: "checkboxes" | "radios" | "range" | "daterange" | "booleanflags";
  defaultOpen?: boolean;
  meta?: FilterMeta[] | RangeFilterMeta;
  fallbackName?: string;
}

/** Unified filter state change handler */
export type FilterChangeHandler<T = any> = (filterName: string, value: T) => void;

/** URL serialization utilities type */
export interface FilterUrlParams {
  /** Convert filters to URL search params */
  toSearchParams: (filters: Filters) => URLSearchParams;
  /** Create filters from URL search params */
  fromSearchParams: (searchParams: URLSearchParams) => Filters;
}
