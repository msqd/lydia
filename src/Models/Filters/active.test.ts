import { describe, expect, it } from "vitest";
import { countActiveFilters, hasActiveFilters } from "./active";

describe("countActiveFilters", () => {
  it("counts nothing when there are no filters", () => {
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters(undefined)).toBe(0);
  });

  it("counts each selected value of a multiple choice facet", () => {
    expect(countActiveFilters({ method: ["GET", "POST"] })).toBe(2);
  });

  it("does not count a facet whose selection is empty", () => {
    expect(countActiveFilters({ method: [] })).toBe(0);
  });

  it("counts each bound of a range that is set", () => {
    expect(countActiveFilters({ tpdex: { min: 80 } })).toBe(1);
    expect(countActiveFilters({ tpdex: { min: 80, max: 100 } })).toBe(2);
  });

  it("does not count a range whose bounds are all undefined", () => {
    expect(countActiveFilters({ tpdex: { min: undefined, max: undefined } })).toBe(0);
  });

  it("does not count a date range with no dates", () => {
    expect(countActiveFilters({ time: { startDate: "", endDate: undefined } })).toBe(0);
  });

  it("does not count a single choice facet left empty", () => {
    expect(countActiveFilters({ client: "" })).toBe(0);
    expect(countActiveFilters({ client: undefined })).toBe(0);
  });
});

describe("hasActiveFilters", () => {
  it("is false when nothing is filtered or searched", () => {
    expect(hasActiveFilters({}, "")).toBe(false);
    expect(hasActiveFilters(undefined, undefined)).toBe(false);
  });

  it("is true as soon as one facet is active", () => {
    expect(hasActiveFilters({ method: ["GET"] }, "")).toBe(true);
  });

  it("is true as soon as something is searched", () => {
    expect(hasActiveFilters({}, "users")).toBe(true);
  });

  it("treats a whitespace-only search as no search", () => {
    expect(hasActiveFilters({}, "   ")).toBe(false);
  });
});
