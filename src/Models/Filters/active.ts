import type { Filters } from "./types";

/**
 * Number of individually selected filter values, counting each bound of a range and each
 * selected choice of a facet. An empty selection and an unset bound are not
 * selections, so a facet the user has not touched contributes nothing.
 */
export function countActiveFilters(filters: Filters | undefined): number {
  if (!filters) {
    return 0;
  }

  return Object.values(filters).reduce<number>((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }

    if (typeof value === "object" && value !== null) {
      return (
        count + Object.values(value).filter((bound) => bound !== undefined && bound !== null && bound !== "").length
      );
    }

    return value !== undefined && value !== null && value !== "" ? count + 1 : count;
  }, 0);
}

/**
 * Whether the user has narrowed the results at all, by a facet or by the search term. Tells an
 * empty result set that matched nothing apart from one that has nothing to show yet.
 */
export function hasActiveFilters(filters: Filters | undefined, search: string | undefined): boolean {
  return countActiveFilters(filters) > 0 || (search ?? "").trim() !== "";
}
