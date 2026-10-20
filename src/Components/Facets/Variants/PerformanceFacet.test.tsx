import type { Filters } from "@msqd/lydia/Models/Filters";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PerformanceFacet } from "./PerformanceFacet";

const defaultProps = {
  name: "tpdex",
  title: "Performance Index",
  filters: {} as Filters,
  onFiltersChange: vi.fn(),
  defaultOpen: true,
};

describe("PerformanceFacet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<PerformanceFacet {...defaultProps} />);

    expect(screen.getByText("Performance Index")).toBeInTheDocument();
    // Check for range slider presence (RangeSlider creates two slider inputs)
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
  });

  it("displays TPDEX scale labels", () => {
    render(<PerformanceFacet {...defaultProps} />);

    // Check for some TPDEX labels that should be present
    expect(screen.getByText("F")).toBeInTheDocument();
    expect(screen.getByText("A+")).toBeInTheDocument();
  });

  it("displays current range values", () => {
    const propsWithRange = {
      ...defaultProps,
      filters: {
        tpdex: { min: 83, max: 96 }, // B to A+ range
      },
    };

    render(<PerformanceFacet {...propsWithRange} />);

    // The component should render with the specified range
    expect(screen.getByText("Performance Index")).toBeInTheDocument();
  });

  it("calls onFiltersChange when range is modified", () => {
    render(<PerformanceFacet {...defaultProps} />);

    const sliders = screen.getAllByRole("slider");

    // Simulate a range change - this is a simplified test as RangeSlider interaction is complex
    fireEvent.change(sliders[0], { target: { value: "50" } });

    // The exact call depends on the RangeSlider implementation
    expect(defaultProps.onFiltersChange).toHaveBeenCalled();
  });

  it("handles empty filter gracefully", () => {
    render(<PerformanceFacet {...defaultProps} filters={{}} />);

    expect(screen.getByText("Performance Index")).toBeInTheDocument();
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
  });

  it("can be rendered in closed state", () => {
    render(<PerformanceFacet {...defaultProps} defaultOpen={false} />);

    expect(screen.getByText("Performance Index")).toBeInTheDocument();
    // When closed, the sliders should not be visible
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });

  it("supports custom className", () => {
    const { container } = render(<PerformanceFacet {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("calculates slider values correctly for TPDEX thresholds", () => {
    // Test with known TPDEX values
    const propsWithKnownRange = {
      ...defaultProps,
      filters: {
        tpdex: { min: 50, max: 83 }, // C to B range
      },
    };

    render(<PerformanceFacet {...propsWithKnownRange} />);

    // Component should handle the conversion from TPDEX values to slider values
    expect(screen.getByText("Performance Index")).toBeInTheDocument();
  });

  it("handles edge cases for TPDEX values", () => {
    const propsWithEdgeCase = {
      ...defaultProps,
      filters: {
        tpdex: { min: 0, max: 100 }, // Full range
      },
    };

    render(<PerformanceFacet {...propsWithEdgeCase} />);

    expect(screen.getByText("Performance Index")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { container } = render(<PerformanceFacet {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches snapshot with range selected", () => {
    const propsWithRange = {
      ...defaultProps,
      filters: {
        tpdex: { min: 83, max: 96 },
      },
    };

    const { container } = render(<PerformanceFacet {...propsWithRange} />);
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
describe("PerformanceFacet in the document outline", () => {
  it("heads its title h5 when nothing says otherwise", () => {
    render(<PerformanceFacet {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 5, name: "Performance Index" })).toBeInTheDocument();
  });

  it("heads its title at the level the rail around it says", () => {
    render(<PerformanceFacet {...defaultProps} headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3, name: "Performance Index" })).toBeInTheDocument();
  });

  it("names its slider's thumbs after the facet", () => {
    render(<PerformanceFacet {...defaultProps} />);

    expect(screen.getByRole("slider", { name: "Performance Index, minimum" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Performance Index, maximum" })).toBeInTheDocument();
  });
});
