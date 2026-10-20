import type { Filters } from "@msqd/lydia/Models/Filters";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacetListCard } from "./FacetListCard";

const child = <p>a facet</p>;

describe("FacetListCard", () => {
  // Unlike FacetList, this component does read `filters` and `onResetFilters`: the first decides
  // whether there is anything to reset, the second does the resetting. They are covered here
  // because a card that stopped offering the reset would look exactly like one with nothing to
  // reset.
  it("offers no reset when nothing is filtered", () => {
    render(
      <FacetListCard filters={{} as Filters} onResetFilters={vi.fn()} showDefaultHeader>
        {child}
      </FacetListCard>,
    );

    expect(screen.queryByRole("button", { name: "Reset all filters" })).not.toBeInTheDocument();
  });

  it("offers a reset once something is filtered", () => {
    render(
      <FacetListCard filters={{ status: ["500"] } as Filters} onResetFilters={vi.fn()} showDefaultHeader>
        {child}
      </FacetListCard>,
    );

    expect(screen.getByRole("button", { name: "Reset all filters" })).toBeInTheDocument();
  });

  it("resets when the reset is pressed", async () => {
    const onResetFilters = vi.fn();
    render(
      <FacetListCard filters={{ status: ["500"] } as Filters} onResetFilters={onResetFilters} showDefaultHeader>
        {child}
      </FacetListCard>,
    );

    screen.getByRole("button", { name: "Reset all filters" }).click();

    expect(onResetFilters).toHaveBeenCalledOnce();
  });

  it("offers no reset when the caller gave nowhere to reset to", () => {
    render(
      <FacetListCard filters={{ status: ["500"] } as Filters} showDefaultHeader>
        {child}
      </FacetListCard>,
    );

    expect(screen.queryByRole("button", { name: "Reset all filters" })).not.toBeInTheDocument();
  });

  it("renders its facets without the Card wrapper when asked", () => {
    render(
      <FacetListCard filters={{} as Filters} skipCardWrapper>
        {child}
      </FacetListCard>,
    );

    expect(screen.getByText("a facet")).toBeInTheDocument();
  });
});
