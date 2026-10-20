import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFacetState } from "../FacetList";
import { type FacetOption, MultipleChoiceFacet } from "./MultipleChoiceFacet";

/** ADR 0002: every state row, reading rule and transition has its test. */

const options: FacetOption[] = [
  {
    name: "2",
    label: "2xx",
    count: 756,
    under: [
      { name: "200", count: 701 },
      { name: "204", count: 55 },
    ],
  },
  {
    name: "4",
    label: "4xx",
    count: 123,
    under: [
      { name: "400", count: 18 },
      { name: "404", count: 97 },
      { name: "422", count: 8 },
    ],
  },
  {
    name: "5",
    label: "5xx",
    count: 31,
    under: [
      { name: "500", count: 4 },
      { name: "502", count: 27 },
    ],
  },
  { name: "failure", count: 3 },
];

function renderFacet(values?: string[]) {
  const onFiltersChange = vi.fn();
  render(
    <MultipleChoiceFacet
      name="status"
      title="Status"
      options={options}
      filters={values ? { status: values } : {}}
      onFiltersChange={onFiltersChange}
    />,
  );
  /** What the facet reported last: the new list, or `undefined` for no filter. */
  const written = () => onFiltersChange.mock.lastCall?.[1];
  return { written, onFiltersChange };
}

/** Same facet over its own state, to follow fold behaviour across changes. */
function renderLiveFacet(values?: string[]) {
  const reported = vi.fn();
  function Live() {
    const { filters, handleFilterChange } = useFacetState(values ? { status: values } : {});
    return (
      <MultipleChoiceFacet
        name="status"
        title="Status"
        options={options}
        filters={filters}
        onFiltersChange={(key, value) => {
          reported(key, value);
          handleFilterChange(key, value);
        }}
      />
    );
  }
  render(<Live />);
  return { written: () => reported.mock.lastCall?.[1] };
}

const box = (label: string) => screen.getByRole("checkbox", { name: new RegExp(`^${label}(\\s|$)`) });
const chevron = (label: string) => screen.getByRole("button", { name: `${label} codes` });
const unfold = (label: string) => fireEvent.click(chevron(label));
const click = (label: string) => fireEvent.click(box(label));
const rowOf = (label: string) => box(label).closest<HTMLElement>(".group")!;
const only = (label: string) => fireEvent.click(within(rowOf(label)).getByRole("button", { name: "only" }));

describe("nested values: the four states of a class", () => {
  it("nothing: class and codes unticked", () => {
    renderFacet();
    unfold("4xx");

    expect(box("4xx")).not.toBeChecked();
    expect(box("4xx")).not.toBePartiallyChecked();
    for (const code of ["400", "404", "422"]) expect(box(code)).not.toBeChecked();
  });

  it("whole class: class ticked, every code ticked, no extra line", () => {
    renderFacet(["4"]);

    expect(box("4xx")).toBeChecked();
    for (const code of ["400", "404", "422"]) expect(box(code)).toBeChecked();
    expect(screen.queryByText("except")).not.toBeInTheDocument();
  });

  it("some codes: class partial, the chosen codes ticked, no extra line", () => {
    renderFacet(["404", "422"]);

    expect(box("4xx")).toBePartiallyChecked();
    expect(box("400")).not.toBeChecked();
    expect(box("404")).toBeChecked();
    expect(box("422")).toBeChecked();
    expect(screen.queryByText("except")).not.toBeInTheDocument();
  });

  it("class minus codes: class partial, every code ticked but the excluded, one except line", () => {
    renderFacet(["4", "-404"]);

    expect(box("4xx")).toBePartiallyChecked();
    expect(box("400")).toBeChecked();
    expect(box("404")).not.toBeChecked();
    expect(box("422")).toBeChecked();
    expect(screen.getByRole("button", { name: "Include 404 again" })).toBeInTheDocument();
    expect(box("4xx")).toHaveAccessibleDescription("except 404");
  });

  it("class minus codes: the class is described by every excluded code", () => {
    renderFacet(["4", "-404", "-422"]);

    expect(box("4xx")).toHaveAccessibleDescription("except 404, 422");
  });

  it("keeps counts unfiltered, whatever the state", () => {
    renderFacet(["4", "-404"]);

    expect(within(rowOf("4xx")).getByText("123")).toBeInTheDocument();
    expect(within(rowOf("404")).getByText("97")).toBeInTheDocument();
  });

  it("a flat value draws no chevron and no partial state", () => {
    renderFacet(["failure"]);

    expect(box("failure")).toBeChecked();
    expect(screen.queryByRole("button", { name: "failure codes" })).not.toBeInTheDocument();
  });
});

describe("nested values: reading a filter", () => {
  it("reads a class beside one of its codes as the whole class, and writes the class alone", () => {
    const { written } = renderFacet(["4", "404"]);

    expect(box("4xx")).toBeChecked();
    expect(box("404")).toBeChecked();
    fireEvent.click(box("failure"));
    expect(written()).toEqual(["4", "failure"]);
  });

  it("reads every offered code as the whole class, and writes the class alone", () => {
    const { written } = renderFacet(["400", "404", "422"]);

    expect(box("4xx")).toBeChecked();
    expect(box("4xx")).not.toBePartiallyChecked();
    fireEvent.click(box("failure"));
    expect(written()).toEqual(["4", "failure"]);
  });

  it("reads an exclusion without its class as nothing, and drops it on the next change", () => {
    const { written } = renderFacet(["-404"]);

    expect(box("4xx")).not.toBeChecked();
    expect(box("4xx")).not.toBePartiallyChecked();
    fireEvent.click(box("failure"));
    expect(written()).toEqual(["failure"]);
  });

  it("reads a class, an exclusion and the same code as class minus that code", () => {
    const { written } = renderFacet(["4", "-404", "404"]);

    expect(box("4xx")).toBePartiallyChecked();
    expect(box("404")).not.toBeChecked();
    fireEvent.click(box("failure"));
    expect(written()).toEqual(["4", "-404", "failure"]);
  });

  it("writes chosen codes in the facet's order, not the order they were ticked", () => {
    const { written } = renderLiveFacet();

    unfold("4xx");
    click("422");
    click("404");
    expect(written()).toEqual(["404", "422"]);
  });

  it("writes excluded codes in the facet's order, not the order they were excluded", () => {
    const { written } = renderLiveFacet(["4"]);

    click("422");
    click("404");
    expect(written()).toEqual(["4", "-404", "-422"]);
  });

  it("writes tokens in the facet's order, depth first, whatever order they came in", () => {
    const { written } = renderFacet(["failure", "502", "-422", "4", "-404", "200"]);

    fireEvent.click(box("2xx"));
    expect(written()).toEqual(["2", "4", "-404", "-422", "502", "failure"]);
  });

  it("keeps a value the facet does not offer, after the offered ones", () => {
    const { written } = renderFacet(["4", "unknown"]);

    fireEvent.click(box("failure"));
    expect(written()).toEqual(["4", "failure", "unknown"]);
  });
});

describe("nested values: transitions", () => {
  it("nothing, tick the class: whole class", () => {
    const { written } = renderFacet();
    click("4xx");
    expect(written()).toEqual(["4"]);
  });

  it("some codes, tick the class: whole class", () => {
    const { written } = renderFacet(["404", "422"]);
    click("4xx");
    expect(written()).toEqual(["4"]);
  });

  it("class minus codes, tick the class: whole class", () => {
    const { written } = renderFacet(["4", "-404"]);
    click("4xx");
    expect(written()).toEqual(["4"]);
  });

  it("whole class, untick the class: nothing", () => {
    const { written } = renderFacet(["4"]);
    click("4xx");
    expect(written()).toBeUndefined();
  });

  it("nothing, tick a code: some codes", () => {
    const { written } = renderFacet();
    unfold("4xx");
    click("404");
    expect(written()).toEqual(["404"]);
  });

  it("some codes, tick a code: one more", () => {
    const { written } = renderFacet(["404"]);
    click("422");
    expect(written()).toEqual(["404", "422"]);
  });

  it("some codes, tick the last unticked code: whole class", () => {
    const { written } = renderFacet(["404", "422"]);
    click("400");
    expect(written()).toEqual(["4"]);
  });

  it("some codes, untick a code: one fewer", () => {
    const { written } = renderFacet(["404", "422"]);
    click("404");
    expect(written()).toEqual(["422"]);
  });

  it("some codes, untick the last ticked code: nothing", () => {
    const { written } = renderFacet(["404"]);
    click("404");
    expect(written()).toBeUndefined();
  });

  it("whole class, untick a code: class minus that code", () => {
    const { written } = renderFacet(["4"]);
    click("404");
    expect(written()).toEqual(["4", "-404"]);
  });

  it("class minus codes, untick another code: class minus both", () => {
    const { written } = renderFacet(["4", "-404"]);
    click("422");
    expect(written()).toEqual(["4", "-404", "-422"]);
  });

  it("class minus codes, tick an excluded code: class minus the rest", () => {
    const { written } = renderFacet(["4", "-404", "-422"]);
    click("404");
    expect(written()).toEqual(["4", "-422"]);
  });

  it("class minus codes, press the cross of an excluded code: class minus the rest", () => {
    const { written } = renderFacet(["4", "-404", "-422"]);
    fireEvent.click(screen.getByRole("button", { name: "Include 404 again" }));
    expect(written()).toEqual(["4", "-422"]);
  });

  it("class minus codes, include the last excluded code: whole class", () => {
    const { written } = renderFacet(["4", "-404"]);
    fireEvent.click(screen.getByRole("button", { name: "Include 404 again" }));
    expect(written()).toEqual(["4"]);
  });

  it("class minus codes, untick the last kept code: nothing", () => {
    const { written } = renderFacet(["4", "-400", "-404"]);
    click("422");
    expect(written()).toBeUndefined();
  });

  it('"only" on a class: the class alone', () => {
    const { written } = renderFacet(["404", "5"]);
    only("4xx");
    expect(written()).toEqual(["4"]);
  });

  it('"only" on a code: the code alone', () => {
    const { written } = renderFacet(["4", "5"]);
    only("404");
    expect(written()).toEqual(["404"]);
  });

  it("tick a flat value: added, classes unchanged", () => {
    const { written } = renderFacet(["4", "-404"]);
    click("failure");
    expect(written()).toEqual(["4", "-404", "failure"]);
  });

  it("untick a flat value: removed, classes unchanged", () => {
    const { written } = renderFacet(["4", "-404", "failure"]);
    click("failure");
    expect(written()).toEqual(["4", "-404"]);
  });

  it('"only" on a flat value: that value alone', () => {
    const { written } = renderFacet(["4", "-404"]);
    only("failure");
    expect(written()).toEqual(["failure"]);
  });

  it("reset: no filter", () => {
    const { written } = renderFacet(["4", "-404", "502", "failure"]);
    fireEvent.click(screen.getByRole("link", { name: "Reset Status" }));
    expect(written()).toBeUndefined();
  });

  it("offers no 'only' on the value the filter already is", () => {
    renderFacet(["404"]);
    expect(within(rowOf("404")).queryByRole("button", { name: "only" })).not.toBeInTheDocument();
    expect(within(rowOf("4xx")).getByRole("button", { name: "only" })).toBeInTheDocument();
  });
});

describe("nested values: folding", () => {
  const codesGroup = (label: string) => screen.queryByRole("group", { name: label });

  it("starts every class folded when nothing is chosen", () => {
    renderFacet();

    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "false");
    expect(codesGroup("4xx")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /^404/ })).not.toBeInTheDocument();
  });

  it("starts unfolded a class holding a selection, and folded the others", () => {
    renderFacet(["404", "5"]);

    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
    expect(chevron("5xx")).toHaveAttribute("aria-expanded", "true");
    expect(chevron("2xx")).toHaveAttribute("aria-expanded", "false");
  });

  it("starts unfolded a class minus codes", () => {
    renderFacet(["4", "-404"]);

    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
  });

  it("the chevron folds and unfolds its class on its own, leaving the filter alone", () => {
    const { onFiltersChange } = renderFacet(["404"]);

    fireEvent.click(chevron("4xx"));
    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("checkbox", { name: /^404/ })).not.toBeInTheDocument();
    fireEvent.click(chevron("4xx"));
    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it("the chevron controls the group of its codes", () => {
    renderFacet(["404"]);

    expect(document.getElementById(chevron("4xx").getAttribute("aria-controls")!)).toBe(codesGroup("4xx"));
  });

  it("ticking a class unfolds it, and unticking folds it back", () => {
    renderLiveFacet();

    click("4xx");
    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
    click("4xx");
    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps a class unfolded while its codes are ticked one by one", () => {
    renderLiveFacet();

    unfold("4xx");
    click("404");
    expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
  });

  describe("when options arrive after mount", () => {
    const facet = (offered: FacetOption[] | undefined, values: string[]) => (
      <MultipleChoiceFacet
        name="status"
        title="Status"
        options={offered}
        filters={{ status: values }}
        onFiltersChange={vi.fn()}
      />
    );

    it("unfolds a class holding a selection when its options first arrive", () => {
      const { rerender } = render(facet(undefined, ["404", "5"]));

      rerender(facet(options, ["404", "5"]));

      expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
      expect(chevron("5xx")).toHaveAttribute("aria-expanded", "true");
      expect(chevron("2xx")).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps a fold the user chose across option updates", () => {
      const { rerender } = render(facet(undefined, ["404"]));
      rerender(facet(options, ["404"]));

      fireEvent.click(chevron("4xx"));
      rerender(
        facet(
          options.map((option) => ({ ...option, count: 1 })),
          ["404"],
        ),
      );

      expect(chevron("4xx")).toHaveAttribute("aria-expanded", "false");
    });

    it("unfolds a class that first arrives in a later update, not the ones already seen", () => {
      const { rerender } = render(facet([options[0]], ["404", "2"]));
      fireEvent.click(chevron("2xx"));

      rerender(facet(options, ["404", "2"]));

      expect(chevron("4xx")).toHaveAttribute("aria-expanded", "true");
      expect(chevron("2xx")).toHaveAttribute("aria-expanded", "false");
    });
  });
});

describe("nested values: pressing the cross of an excluded code", () => {
  it("moves focus to the next excluded code", () => {
    renderLiveFacet(["4", "-404", "-422"]);
    const cross = screen.getByRole("button", { name: "Include 404 again" });
    cross.focus();

    fireEvent.click(cross);

    expect(screen.getByRole("button", { name: "Include 422 again" })).toHaveFocus();
  });

  it("moves focus to the class checkbox when it was the last excluded code", () => {
    renderLiveFacet(["4", "-404"]);
    const cross = screen.getByRole("button", { name: "Include 404 again" });
    cross.focus();

    fireEvent.click(cross);

    expect(screen.queryByText("except")).not.toBeInTheDocument();
    expect(box("4xx")).toHaveFocus();
  });
});

describe("nested values: an exclusion the options do not list", () => {
  const sparse: FacetOption[] = [
    {
      name: "4",
      label: "4xx",
      under: [
        { name: "400", count: 18 },
        { name: "422", count: 8 },
      ],
    },
  ];

  function renderSparse(values: string[]) {
    const reported = vi.fn();
    function Live() {
      const { filters, handleFilterChange } = useFacetState({ status: values });
      return (
        <MultipleChoiceFacet
          name="status"
          title="Status"
          options={sparse}
          filters={filters}
          onFiltersChange={(key, value) => {
            reported(key, value);
            handleFilterChange(key, value);
          }}
        />
      );
    }
    render(<Live />);
    return { written: () => reported.mock.lastCall?.[1] };
  }

  it("reads as the class minus that code, shown in the except line", () => {
    renderSparse(["4", "-404"]);

    expect(box("4xx")).toBePartiallyChecked();
    expect(box("4xx")).toHaveAccessibleDescription("except 404");
    expect(screen.getByRole("button", { name: "Include 404 again" })).toBeInTheDocument();
  });

  it("is removed by its cross, leaving the whole class", () => {
    const { written } = renderSparse(["4", "-404"]);

    fireEvent.click(screen.getByRole("button", { name: "Include 404 again" }));

    expect(written()).toEqual(["4"]);
    expect(box("4xx")).toBeChecked();
  });

  it("is kept after the listed exclusions when another code is unticked", () => {
    const { written } = renderSparse(["4", "-404"]);

    click("400");

    expect(written()).toEqual(["4", "-400", "-404"]);
  });

  it("without its class reads as nothing and is dropped", () => {
    const { written } = renderSparse(["-404", "other"]);

    expect(box("4xx")).not.toBeChecked();
    click("4xx");
    expect(written()).toEqual(["4", "other"]);
  });
});

describe("nested values: ids", () => {
  const spaced: FacetOption[] = [{ name: "a b", under: [{ name: "c d" }, { name: "e" }] }];

  it("gives the disclosure and the except line ids that hold with spaces in values", () => {
    render(
      <MultipleChoiceFacet
        name="status"
        title="Status"
        options={spaced}
        filters={{ status: ["a b", "-c d"] }}
        onFiltersChange={vi.fn()}
      />,
    );

    const controls = screen.getByRole("button", { name: "a b codes" }).getAttribute("aria-controls")!;
    const describedBy = screen.getByRole("checkbox", { name: /^a b/ }).getAttribute("aria-describedby")!;
    for (const id of [controls, describedBy]) {
      expect(id).not.toMatch(/\s/);
      expect(document.getElementById(id)).not.toBeNull();
    }
    expect(screen.getByRole("checkbox", { name: /^a b/ })).toHaveAccessibleDescription("except c d");
  });

  it("keeps every id unique when two facets of the same name share a document", () => {
    const facet = (
      <MultipleChoiceFacet
        name="status"
        title="Status"
        options={options}
        filters={{ status: ["4", "-404"] }}
        onFiltersChange={vi.fn()}
      />
    );
    const { container } = render(
      <>
        {facet}
        {facet}
      </>,
    );

    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
