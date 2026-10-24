import type { Filters } from "@msqd/lydia/Models/Filters";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateRangeFacet } from "./DateRangeFacet";

const defaultProps = {
  name: "dateRange",
  title: "Date Range",
  filters: {} as Filters,
  onFiltersChange: vi.fn(),
  defaultOpen: true,
};

describe("DateRangeFacet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<DateRangeFacet {...defaultProps} />);

    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Start date")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("End date")).toBeInTheDocument();
  });

  it("renders with custom placeholders", () => {
    render(<DateRangeFacet {...defaultProps} startDatePlaceholder="From" endDatePlaceholder="To" />);

    expect(screen.getByPlaceholderText("From")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("To")).toBeInTheDocument();
  });

  it("displays preselected date values", () => {
    const propsWithDates = {
      ...defaultProps,
      filters: {
        dateRange: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
      },
    };

    render(<DateRangeFacet {...propsWithDates} />);

    const startInput = screen.getByDisplayValue("2024-01-01");
    const endInput = screen.getByDisplayValue("2024-01-31");

    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  it("calls onFiltersChange when start date is changed", () => {
    render(<DateRangeFacet {...defaultProps} />);

    const startInput = screen.getByPlaceholderText("Start date");
    fireEvent.change(startInput, { target: { value: "2024-02-01" } });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("dateRange", {
      startDate: "2024-02-01",
    });
  });

  it("calls onFiltersChange when end date is changed", () => {
    render(<DateRangeFacet {...defaultProps} />);

    const endInput = screen.getByPlaceholderText("End date");
    fireEvent.change(endInput, { target: { value: "2024-02-28" } });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("dateRange", {
      endDate: "2024-02-28",
    });
  });

  it("preserves existing date when changing one field", () => {
    const propsWithStartDate = {
      ...defaultProps,
      filters: {
        dateRange: {
          startDate: "2024-01-01",
          endDate: "",
        },
      },
    };

    render(<DateRangeFacet {...propsWithStartDate} />);

    const endInput = screen.getByPlaceholderText("End date");
    fireEvent.change(endInput, { target: { value: "2024-01-31" } });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith("dateRange", {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
  });

  it("can be rendered in closed state", () => {
    render(<DateRangeFacet {...defaultProps} defaultOpen={false} />);

    // The title should still be visible (button), but inputs should be hidden
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    // In Foldable component, closed content is not rendered to DOM
    expect(screen.queryByPlaceholderText("Start date")).not.toBeInTheDocument();
  });

  it("supports custom className", () => {
    const { container } = render(<DateRangeFacet {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles empty filter object gracefully", () => {
    render(<DateRangeFacet {...defaultProps} filters={{}} />);

    const startInput = screen.getByPlaceholderText("Start date");
    const endInput = screen.getByPlaceholderText("End date");

    expect(startInput).toHaveValue("");
    expect(endInput).toHaveValue("");
  });

  it("matches snapshot", () => {
    const { container } = render(<DateRangeFacet {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with selected dates", () => {
    const propsWithDates = {
      ...defaultProps,
      filters: {
        dateRange: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
      },
    };

    const { container } = render(<DateRangeFacet {...propsWithDates} />);
    expect(container.firstChild).toMatchSnapshot();
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
describe("DateRangeFacet in the document outline", () => {
  it("heads its title h5 when nothing says otherwise", () => {
    render(<DateRangeFacet {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 5, name: "Date Range" })).toBeInTheDocument();
  });

  it("heads its title at the level the rail around it says", () => {
    render(<DateRangeFacet {...defaultProps} headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3, name: "Date Range" })).toBeInTheDocument();
  });
});

describe("DateRangeFacet error", () => {
  it("shows the error when the start is after the end", () => {
    const filters = { dateRange: { startDate: "2024-02-01", endDate: "2024-01-01" } } as Filters;
    render(<DateRangeFacet {...defaultProps} filters={filters} />);

    expect(screen.getByText("Start date cannot be after end date")).toBeInTheDocument();
  });
});
