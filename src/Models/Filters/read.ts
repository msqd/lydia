import type { DateRangeFilter, Filters, MinMaxFilter } from "./types";

/**
 * Readers for a filter value. `Filters` says what a facet writes, but what arrives may come from a
 * URL parser or a stored view, so each reader checks the shape and answers with an empty value for
 * one it does not recognise rather than letting it reach code that assumes the type.
 */

const raw = (filters: Filters | undefined, name: string): unknown => filters?.[name];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);

const asNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

/** Keeps the keys whose value is defined, so an unreadable bound is absent rather than `undefined`. */
const defined = <T extends object>(entries: T): T =>
  Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined)) as T;

/** The selected values of a multiple choice facet; empty unless the filter is a list of strings. */
export function readArray(filters: Filters | undefined, name: string): string[] {
  const value = raw(filters, name);
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

/** The bounds of a range facet; a bound that is not a finite number is absent. */
export function readRange(filters: Filters | undefined, name: string): MinMaxFilter {
  const value = raw(filters, name);
  return isRecord(value) ? defined({ min: asNumber(value.min), max: asNumber(value.max) }) : {};
}

/** The dates of a date range facet; a date that is not a string is absent. */
export function readDates(filters: Filters | undefined, name: string): DateRangeFilter {
  const value = raw(filters, name);
  return isRecord(value) ? defined({ startDate: asString(value.startDate), endDate: asString(value.endDate) }) : {};
}

/** The chosen value of a single choice facet; undefined unless the filter is a string. */
export function readSingle(filters: Filters | undefined, name: string): string | undefined {
  return asString(raw(filters, name));
}
