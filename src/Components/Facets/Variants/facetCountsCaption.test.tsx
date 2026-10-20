import type { FilterMeta } from "@msqd/lydia/Models/Filters";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type FacetOption, MultipleChoiceFacet } from "./MultipleChoiceFacet";
import { SingleChoiceFacet } from "./SingleChoiceFacet";

const counted: FilterMeta[] = [
  { name: "GET", count: 701 },
  { name: "POST", count: 123 },
];
const uncounted: FilterMeta[] = [{ name: "GET" }, { name: "POST" }];

const facets = [
  { kind: "MultipleChoiceFacet", Facet: MultipleChoiceFacet, role: "group" },
  { kind: "SingleChoiceFacet", Facet: SingleChoiceFacet, role: "radiogroup" },
] as const;

describe.each(facets)("$kind counts caption", ({ Facet, role }) => {
  const props = { name: "method", title: "Method", filters: {}, onFiltersChange: vi.fn() };

  it("says the counts cover all transactions, and describes the option group", () => {
    render(<Facet {...props} options={counted} />);

    expect(screen.getByText("Counts cover all transactions")).toBeVisible();
    expect(screen.getByRole(role, { name: "Method" })).toHaveAccessibleDescription("Counts cover all transactions");
  });

  it("takes the consumer's wording", () => {
    render(<Facet {...props} options={counted} countsCaption="Totals for the whole period" />);

    expect(screen.getByRole(role, { name: "Method" })).toHaveAccessibleDescription("Totals for the whole period");
    expect(screen.queryByText("Counts cover all transactions")).not.toBeInTheDocument();
  });

  it("shows no caption when the consumer passes an empty one", () => {
    render(<Facet {...props} options={counted} countsCaption="" />);

    expect(screen.getByRole(role, { name: "Method" })).not.toHaveAccessibleDescription();
  });

  it("shows no caption when no option has a count", () => {
    render(<Facet {...props} options={uncounted} />);

    expect(screen.queryByText("Counts cover all transactions")).not.toBeInTheDocument();
    expect(screen.getByRole(role, { name: "Method" })).not.toHaveAccessibleDescription();
  });

  it("shows the caption when the only count is a zero", () => {
    render(<Facet {...props} options={[{ name: "GET", count: 0 }, { name: "POST" }]} />);

    expect(screen.getByText("Counts cover all transactions")).toBeInTheDocument();
  });
});

describe("MultipleChoiceFacet counts caption, nested", () => {
  it("shows the caption when only the codes under a class have counts", () => {
    const options: FacetOption[] = [{ name: "4", label: "4xx", under: [{ name: "404", count: 97 }] }];
    render(
      <MultipleChoiceFacet name="status" title="Status" filters={{}} onFiltersChange={vi.fn()} options={options} />,
    );

    expect(screen.getByText("Counts cover all transactions")).toBeInTheDocument();
  });
});
