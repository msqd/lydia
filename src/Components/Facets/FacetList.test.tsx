import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FacetList } from "./FacetList";

describe("FacetList", () => {
  // FacetList lays its children out and provides no context, so the filter
  // state is not its business. Anything it demands and does not read is a cost
  // charged to every consumer for nothing: a consumer's dashboard builds a Filters
  // map and a change handler purely to satisfy this signature, and passes the
  // same pair again to each facet inside, which is where they are actually
  // read.
  it("needs nothing but its children", () => {
    render(
      <FacetList>
        <p>a facet</p>
      </FacetList>,
    );

    expect(screen.getByText("a facet")).toBeInTheDocument();
  });

  it("draws dividers between facets by default", () => {
    const { container } = render(
      <FacetList>
        <p>a facet</p>
      </FacetList>,
    );

    expect(container.firstChild).toHaveClass("divide-y");
  });

  it("leaves the dividers out when asked", () => {
    const { container } = render(
      <FacetList hasDividers={false}>
        <p>a facet</p>
      </FacetList>,
    );

    expect(container.firstChild).not.toHaveClass("divide-y");
  });

  it("merges a caller's classes rather than dropping them", () => {
    const { container } = render(
      <FacetList className="w-64">
        <p>a facet</p>
      </FacetList>,
    );

    expect(container.firstChild).toHaveClass("w-64");
  });

  it("passes the underlying div's props through, as ComponentProps<'div'> promises", () => {
    render(
      <FacetList aria-label="Filters" role="region">
        <p>a facet</p>
      </FacetList>,
    );

    expect(screen.getByRole("region", { name: "Filters" })).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { container } = render(
      <FacetList>
        <p>a facet</p>
      </FacetList>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
