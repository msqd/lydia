import type { Filters } from "@msqd/lydia/Models/Filters";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionFiltersCard } from "./TransactionFiltersCard";

describe("TransactionFiltersCard", () => {
  it("renders the facets with their header", () => {
    const { container } = render(
      <TransactionFiltersCard
        filters={{} as Filters}
        onFiltersChange={vi.fn()}
        onResetFilters={vi.fn()}
        facets={{ method: [{ name: "GET", label: "GET", count: 543 }] }}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
