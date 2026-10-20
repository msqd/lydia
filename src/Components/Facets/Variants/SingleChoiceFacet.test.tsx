import type { FilterMeta, Filters } from "@msqd/lydia/Models/Filters";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SingleChoiceFacet } from "./SingleChoiceFacet";

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

describe("SingleChoiceFacet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<SingleChoiceFacet {...defaultProps} />);

    expect(screen.getByText("Test Filter")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders radio buttons for each option", () => {
    render(<SingleChoiceFacet {...defaultProps} />);

    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);

    // All radio buttons should have the same name (for grouping)
    radioButtons.forEach((radio) => {
      expect(radio).toHaveAttribute("name", "testFilter");
    });
  });

  it("no options are selected by default", () => {
    render(<SingleChoiceFacet {...defaultProps} />);

    const radioButtons = screen.getAllByRole("radio");
    radioButtons.forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
  });

  it("displays selected option correctly", () => {
    const propsWithSelection = {
      ...defaultProps,
      filters: {
        testFilter: "option2",
      },
    };

    render(<SingleChoiceFacet {...propsWithSelection} />);

    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons[0]).not.toBeChecked(); // option1
    expect(radioButtons[1]).toBeChecked(); // option2
    expect(radioButtons[2]).not.toBeChecked(); // option3
  });

  it("calls onFiltersChange when option is selected", () => {
    render(<SingleChoiceFacet {...defaultProps} />);

    const firstRadio = screen.getAllByRole("radio")[0];
    fireEvent.click(firstRadio);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("testFilter", "option1");
  });

  it("calls onFiltersChange when different option is selected", () => {
    const propsWithSelection = {
      ...defaultProps,
      filters: {
        testFilter: "option1",
      },
    };

    render(<SingleChoiceFacet {...propsWithSelection} />);

    const thirdRadio = screen.getAllByRole("radio")[2];
    fireEvent.click(thirdRadio);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("testFilter", "option3");
  });

  it("uses fallback name when option name is NULL and no label provided", () => {
    const optionsWithNull: FilterMeta[] = [
      { name: "NULL", count: 5 }, // No label provided
      { name: "option1", label: "Option 1", count: 10 },
    ];

    render(<SingleChoiceFacet {...defaultProps} options={optionsWithNull} fallbackName="No Value" />);

    expect(screen.getByText("No Value")).toBeInTheDocument();
  });

  it("uses label when available, otherwise uses name", () => {
    const optionsWithMixedLabels: FilterMeta[] = [
      { name: "opt1", label: "Custom Label 1", count: 5 },
      { name: "opt2", count: 3 }, // No label
    ];

    render(<SingleChoiceFacet {...defaultProps} options={optionsWithMixedLabels} />);

    expect(screen.getByText("Custom Label 1")).toBeInTheDocument();
    expect(screen.getByText("opt2")).toBeInTheDocument();
  });

  it("can be rendered in closed state", () => {
    render(<SingleChoiceFacet {...defaultProps} defaultOpen={false} />);

    expect(screen.getByText("Test Filter")).toBeInTheDocument();
    // When closed, the radio buttons should not be visible
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("supports custom className", () => {
    const { container } = render(<SingleChoiceFacet {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles empty options array", () => {
    render(<SingleChoiceFacet {...defaultProps} options={[]} />);

    expect(screen.getByText("Test Filter")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("handles single option", () => {
    const singleOption: FilterMeta[] = [{ name: "only", label: "Only Option", count: 1 }];

    render(<SingleChoiceFacet {...defaultProps} options={singleOption} />);

    const radio = screen.getByRole("radio");
    expect(radio).toBeInTheDocument();
    expect(screen.getByText("Only Option")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { container } = render(<SingleChoiceFacet {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with selection", () => {
    const propsWithSelection = {
      ...defaultProps,
      filters: {
        testFilter: "option2",
      },
    };

    const { container } = render(<SingleChoiceFacet {...propsWithSelection} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  // After the snapshots on purpose: the snapshots record headlessui's generated
  // ids, which are numbered per render, so a test inserted above them renumbers
  // every id and rewrites both snapshots for no reason of its own.
  it("groups the options under the facet title", () => {
    render(<SingleChoiceFacet {...defaultProps} />);

    // The title renders on the disclosure button, so it names the button and
    // nothing else. Without a named group around the options a screen reader
    // announces "Option 1, radio button, 1 of 3" and never says what is being
    // chosen.
    const group = screen.getByRole("radiogroup", { name: "Test Filter" });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
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
describe("SingleChoiceFacet in the document outline", () => {
  it("heads its title h5 when nothing says otherwise", () => {
    render(<SingleChoiceFacet {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 5, name: "Test Filter" })).toBeInTheDocument();
  });

  it("heads its title at the level the rail around it says", () => {
    render(<SingleChoiceFacet {...defaultProps} headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3, name: "Test Filter" })).toBeInTheDocument();
  });
});
