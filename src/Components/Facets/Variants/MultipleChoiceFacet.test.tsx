import type { FilterMeta, Filters } from "@msqd/lydia/Models/Filters";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useFacetState } from "../FacetList";
import { MultipleChoiceFacet } from "./MultipleChoiceFacet";

const defaultOptions: FilterMeta[] = [
  { name: "option1", label: "Option 1", count: 10 },
  { name: "option2", label: "Option 2", count: 5 },
  { name: "option3", label: "Option 3", count: 3 },
];

const defaultProps = {
  name: "testFilter",
  title: "Test Filter",
  filters: {} as Filters,
  onFiltersChange: vi.fn(),
  options: defaultOptions,
  defaultOpen: true,
};

describe("MultipleChoiceFacet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<MultipleChoiceFacet {...defaultProps} />);

    expect(screen.getByText("Test Filter")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  /**
   * A tick narrows to a value; it does not exclude one. Ruled on
   * msqd/jaco#129: HARP's inversion, where nothing chosen drew every box
   * ticked and a click stored every other value, is gone. Over a list that
   * grows, storing "every other value" silently excluded the next new one.
   */
  describe("narrowing", () => {
    const changed = () => defaultProps.onFiltersChange.mock.lastCall;

    it("ticks nothing while nothing is chosen", () => {
      render(<MultipleChoiceFacet {...defaultProps} />);

      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).not.toBeChecked();
      }
    });

    it("narrows to the value a tick chooses", () => {
      render(<MultipleChoiceFacet {...defaultProps} />);

      fireEvent.click(screen.getByRole("checkbox", { name: /Option 2/ }));
      expect(changed()).toEqual(["testFilter", ["option2"]]);
    });

    it("widens to a second value, reported in the facet's order", () => {
      render(<MultipleChoiceFacet {...defaultProps} filters={{ testFilter: ["option3"] }} />);

      fireEvent.click(screen.getByRole("checkbox", { name: /Option 1/ }));
      expect(changed()).toEqual(["testFilter", ["option1", "option3"]]);
    });

    it("keeps every value when every box is ticked, rather than meaning all", () => {
      render(<MultipleChoiceFacet {...defaultProps} filters={{ testFilter: ["option1", "option2"] }} />);

      fireEvent.click(screen.getByRole("checkbox", { name: /Option 3/ }));
      expect(changed()).toEqual(["testFilter", ["option1", "option2", "option3"]]);
    });

    it("clears the filter when the last tick is removed", () => {
      render(<MultipleChoiceFacet {...defaultProps} filters={{ testFilter: ["option2"] }} />);

      fireEvent.click(screen.getByRole("checkbox", { name: /Option 2/ }));
      expect(changed()).toEqual(["testFilter", undefined]);
    });

    it("keeps a chosen value the facet no longer offers, after the offered ones", () => {
      render(<MultipleChoiceFacet {...defaultProps} filters={{ testFilter: ["gone", "option2"] }} />);

      fireEvent.click(screen.getByRole("checkbox", { name: /Option 1/ }));
      expect(changed()).toEqual(["testFilter", ["option1", "option2", "gone"]]);
    });

    it("lets a lone option be chosen", () => {
      const lone: FilterMeta[] = [{ name: "only", label: "Only Option", count: 1 }];
      render(<MultipleChoiceFacet {...defaultProps} options={lone} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeEnabled();
      fireEvent.click(checkbox);
      expect(changed()).toEqual(["testFilter", ["only"]]);
    });

    it("offers no 'only' while nothing is chosen, where it would equal a tick", () => {
      render(<MultipleChoiceFacet {...defaultProps} />);

      expect(screen.queryByRole("button", { name: "only" })).not.toBeInTheDocument();
    });

    it("offers 'only' beside every value but the sole one chosen, and narrows to it", () => {
      render(<MultipleChoiceFacet {...defaultProps} filters={{ testFilter: ["option1", "option2"] }} />);

      const only = screen.getAllByRole("button", { name: "only" });
      expect(only).toHaveLength(3);
      fireEvent.click(only[2]);
      expect(changed()).toEqual(["testFilter", ["option3"]]);
    });
  });

  it("displays selected filters correctly", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        testFilter: ["option1", "option2"],
      },
    };

    render(<MultipleChoiceFacet {...propsWithFilters} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked(); // option1
    expect(checkboxes[1]).toBeChecked(); // option2
    expect(checkboxes[2]).not.toBeChecked(); // option3
  });

  it("shows reset button in title when filters are applied", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        testFilter: ["option1"],
      },
    };

    render(<MultipleChoiceFacet {...propsWithFilters} />);

    expect(screen.getByRole("link", { name: "Reset Test Filter" })).toBeInTheDocument();
  });

  it("calls onFiltersChange when reset button is clicked", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        testFilter: ["option1"],
      },
    };

    render(<MultipleChoiceFacet {...propsWithFilters} />);

    const resetLink = screen.getByRole("link", { name: "Reset Test Filter" });
    fireEvent.click(resetLink);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("testFilter", undefined);
  });

  it("does not show only button for single selected option", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        testFilter: ["option1"],
      },
    };

    render(<MultipleChoiceFacet {...propsWithFilters} />);

    // Should have 2 "only" buttons (for option2 and option3), not 3
    const onlyButtons = screen.getAllByText("only");
    expect(onlyButtons).toHaveLength(2);
  });

  it("uses fallback name when option name is NULL and no label provided", () => {
    const optionsWithNull: FilterMeta[] = [
      { name: "NULL", count: 5 }, // No label provided
      { name: "option1", label: "Option 1", count: 10 },
    ];

    render(<MultipleChoiceFacet {...defaultProps} options={optionsWithNull} fallbackName="No Value" />);

    expect(screen.getByText("No Value")).toBeInTheDocument();
  });

  it("can be rendered in closed state", () => {
    render(<MultipleChoiceFacet {...defaultProps} defaultOpen={false} />);

    expect(screen.getByText("Test Filter")).toBeInTheDocument();
    // When closed, the checkboxes should not be visible
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("supports custom className", () => {
    const { container } = render(<MultipleChoiceFacet {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("does not show only button when only one option", () => {
    const singleOption: FilterMeta[] = [{ name: "only", label: "Only Option", count: 1 }];

    render(<MultipleChoiceFacet {...defaultProps} options={singleOption} />);

    expect(screen.queryByText("only")).not.toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { container } = render(<MultipleChoiceFacet {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with filters applied", () => {
    const propsWithFilters = {
      ...defaultProps,
      filters: {
        testFilter: ["option1", "option2"],
      },
    };

    const { container } = render(<MultipleChoiceFacet {...propsWithFilters} />);
    expect(container.firstChild).toMatchSnapshot();
  });
  describe("with nothing to offer", () => {
    it("says it has no values rather than showing an empty box", () => {
      // Only the consumer knows what exists in the whole result set. A facet with no options is
      // honest; one that invents options is not, and a silent empty box is neither.
      render(<MultipleChoiceFacet {...defaultProps} options={[]} />);

      expect(screen.getByText("No values")).toBeInTheDocument();
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    });

    it("offers nothing when given no options at all", () => {
      render(<MultipleChoiceFacet {...defaultProps} options={undefined} />);

      expect(screen.getByText("No values")).toBeInTheDocument();
    });
  });

  describe("counts", () => {
    it("shows a count of zero, which is a measurement", () => {
      render(<MultipleChoiceFacet {...defaultProps} options={[{ name: "none", label: "None", count: 0 }]} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("shows no count at all when the consumer supplied none", () => {
      // Absence is not zero. Rendering 0 for an unknown count states something the consumer
      // never claimed.
      render(<MultipleChoiceFacet {...defaultProps} options={[{ name: "unknown", label: "Unknown" }]} />);

      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  // After the snapshots on purpose: they record headlessui's generated ids,
  // which are numbered per render, so a test inserted above them renumbers
  // every id and rewrites the snapshots for no reason of its own.
  it("groups the options under the facet title", () => {
    render(<MultipleChoiceFacet {...defaultProps} />);

    // The title renders on the disclosure button, so it names the button and
    // nothing else. These checkboxes do not even share a `name`, so nothing
    // ties them together: without a named group a screen reader announces
    // "Option 1, checkbox, checked" and never says what is being narrowed.
    const group = screen.getByRole("group", { name: "Test Filter" });
    expect(within(group).getAllByRole("checkbox")).toHaveLength(3);
  });
});

/*
 * A facet has to be able to say where its title sits.
 *
 * `Foldable` takes a `headingLevel` and defaults it to `h5`; a facet wraps a
 * `Foldable` and, until now, did not pass it on. So a rail headed `h2` produced
 * `h2` then `h5` -- two levels skipped, which is WCAG 1.3.1 and which axe
 * reports as `heading-order` -- and the consumer had nothing to pass to fix it.
 * The prop existed one layer down and was unreachable.
 *
 * Appended rather than inserted, because the snapshots above are keyed by
 * headlessui ids numbered per render: a test added higher up renumbers every
 * one of them.
 */
describe("MultipleChoiceFacet in the document outline", () => {
  it("heads its title h5 when nothing says otherwise", () => {
    render(<MultipleChoiceFacet {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 5, name: "Test Filter" })).toBeInTheDocument();
  });

  it("heads its title at the level the rail around it says", () => {
    render(<MultipleChoiceFacet {...defaultProps} headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3, name: "Test Filter" })).toBeInTheDocument();
  });
});

/**
 * "only" is a button, and a label may hold nothing interactive but its own
 * control: a button inside the checkbox's label is invalid HTML, and some
 * browsers pass a click on it to the box (HTML, the label element).
 */
describe("MultipleChoiceFacet's only button", () => {
  const chosen = { ...defaultProps, filters: { testFilter: ["option1", "option2"] } as Filters };

  it("sits outside every label", () => {
    const { container } = render(<MultipleChoiceFacet {...chosen} />);

    expect(container.querySelectorAll("label button, label a, label [tabindex]")).toHaveLength(0);
    expect(screen.getAllByRole("button", { name: "only" }).length).toBeGreaterThan(0);
  });

  it("narrows to its value without toggling its checkbox", () => {
    const onFiltersChange = vi.fn();
    render(<MultipleChoiceFacet {...chosen} onFiltersChange={onFiltersChange} />);

    fireEvent.click(screen.getAllByRole("button", { name: "only" })[2]);

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith("testFilter", ["option3"]);
  });

  /**
   * "only" narrows to its value, and the value it narrowed to then offers no
   * "only": the button the keyboard pressed is gone, and focus fell to the
   * document, so the next Tab started again from the top of the page (WCAG
   * 2.4.3). It lands on the value's own checkbox instead.
   */
  it("leaves focus on the value it narrowed to, not on the document", async () => {
    const user = userEvent.setup();
    function Live() {
      const { filters, handleFilterChange } = useFacetState(chosen.filters);
      return <MultipleChoiceFacet {...defaultProps} filters={filters} onFiltersChange={handleFilterChange} />;
    }
    render(<Live />);

    screen.getAllByRole("button", { name: "only" })[2].focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("checkbox", { name: /Option 3/ })).toHaveFocus();
  });

  describe("descriptions", () => {
    const described: FilterMeta[] = [
      { name: "2", label: "2xx", count: 4, description: "Success" },
      { name: "failure", label: "Failure", count: 1 },
    ];

    it("shows the description as a tooltip on the label", () => {
      render(<MultipleChoiceFacet {...defaultProps} options={described} />);

      expect(screen.getByText("2xx")).toHaveAttribute("title", "Success");
    });

    it("gives the description to assistive technology, without renaming the checkbox", () => {
      render(<MultipleChoiceFacet {...defaultProps} options={described} />);

      const box = screen.getByRole("checkbox", { name: /^2xx/ });
      expect(box).toHaveAccessibleDescription("Success");
      expect(box).toHaveAccessibleName("2xx 4");
    });

    it("adds nothing to a row without a description", () => {
      render(<MultipleChoiceFacet {...defaultProps} options={described} />);

      expect(screen.getByText("Failure")).not.toHaveAttribute("title");
      expect(screen.getByRole("checkbox", { name: /^Failure/ })).not.toHaveAttribute("aria-describedby");
    });
  });
});
