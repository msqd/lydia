import { localToday } from "@msqd/lydia/Models/Filters";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateRangeSelector } from "./DateRangeSelector";

describe("DateRangeSelector", () => {
  it("renders with default props", () => {
    const { container } = render(<DateRangeSelector />);
    const dateInputs = screen.getAllByLabelText(/date/i);

    expect(dateInputs).toHaveLength(2);
    expect(dateInputs[0]).toHaveAttribute("type", "date");
    expect(dateInputs[1]).toHaveAttribute("type", "date");

    // Snapshot test
    expect(container).toMatchSnapshot();
  });

  it("renders with label", () => {
    const label = "Date Range";
    render(<DateRangeSelector label={label} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders with initial values", () => {
    const initialValue = {
      startDate: "2025-05-01",
      endDate: "2025-05-10",
    };

    render(<DateRangeSelector value={initialValue} />);

    const dateInputs = screen.getAllByLabelText(/date/i);
    expect(dateInputs[0]).toHaveValue(initialValue.startDate);
    expect(dateInputs[1]).toHaveValue(initialValue.endDate);
  });

  it("calls onChange when start date changes", () => {
    const handleChange = vi.fn();
    render(<DateRangeSelector onChange={handleChange} />);

    const dateInputs = screen.getAllByLabelText(/date/i);
    const startDateInput = dateInputs[0];

    fireEvent.change(startDateInput, { target: { value: "2025-05-01" } });

    expect(handleChange).toHaveBeenCalledWith({
      startDate: "2025-05-01",
      endDate: "",
    });
  });

  it("calls onChange when end date changes", () => {
    const handleChange = vi.fn();
    render(<DateRangeSelector onChange={handleChange} />);

    const dateInputs = screen.getAllByLabelText(/date/i);
    const endDateInput = dateInputs[1];

    fireEvent.change(endDateInput, { target: { value: "2025-05-10" } });

    expect(handleChange).toHaveBeenCalledWith({
      startDate: "",
      endDate: "2025-05-10",
    });
  });

  it("preserves existing date when changing one date", () => {
    const initialValue = {
      startDate: "2025-05-01",
      endDate: "2025-05-10",
    };

    const handleChange = vi.fn();
    render(<DateRangeSelector value={initialValue} onChange={handleChange} />);

    const dateInputs = screen.getAllByLabelText(/date/i);
    const endDateInput = dateInputs[1];

    fireEvent.change(endDateInput, { target: { value: "2025-05-15" } });

    expect(handleChange).toHaveBeenCalledWith({
      startDate: "2025-05-01",
      endDate: "2025-05-15",
    });
  });

  it("applies custom className", () => {
    const { container } = render(<DateRangeSelector className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles aria labels correctly", () => {
    const startPlaceholder = "From";
    const endPlaceholder = "To";

    render(<DateRangeSelector startDatePlaceholder={startPlaceholder} endDatePlaceholder={endPlaceholder} />);

    const startInput = screen.getByLabelText(startPlaceholder);
    const endInput = screen.getByLabelText(endPlaceholder);

    expect(startInput).toHaveAttribute("aria-label", startPlaceholder);
    expect(endInput).toHaveAttribute("aria-label", endPlaceholder);
  });

  /**
   * Rendered without effects, which is what a server render gives and what the browser paints
   * before the first effect flushes. Anything derived from props has to be right here.
   */
  describe("first render, before any effect runs", () => {
    it("shows the range error", () => {
      const html = renderToStaticMarkup(
        <DateRangeSelector label="When" value={{ startDate: "2026-08-20", endDate: "2026-08-10" }} />,
      );

      expect(html).toContain("Start date cannot be after end date");
    });

    it("already forbids past dates when asked to", () => {
      const today = localToday();

      const html = renderToStaticMarkup(<DateRangeSelector disablePastDates />);

      expect(html).toContain(`min="${today}"`);
    });

    it("already forbids future dates when asked to", () => {
      const today = localToday();

      const html = renderToStaticMarkup(<DateRangeSelector disableFutureDates />);

      expect(html).toContain(`max="${today}"`);
    });
  });

  describe("validation", () => {
    it("reports a start date after the end date", () => {
      render(<DateRangeSelector label="When" value={{ startDate: "2026-08-20", endDate: "2026-08-10" }} />);

      expect(screen.getByText("Start date cannot be after end date")).toBeInTheDocument();
    });

    it("reports nothing for a valid range", () => {
      render(<DateRangeSelector label="When" value={{ startDate: "2026-08-10", endDate: "2026-08-20" }} />);

      expect(screen.queryByText("Start date cannot be after end date")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    });

    it("reports nothing when only one date is set", () => {
      render(<DateRangeSelector label="When" value={{ startDate: "2026-08-20", endDate: "" }} />);

      expect(screen.queryByText("Start date cannot be after end date")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    });
  });

  describe("bounds", () => {
    afterEach(() => vi.useRealTimers());

    it("keeps a tighter explicit minDate rather than loosening it to today", () => {
      const tomorrow = localToday(new Date(Date.now() + 86_400_000));

      render(<DateRangeSelector disablePastDates minDate={tomorrow} />);

      expect(screen.getByLabelText("Start date")).toHaveAttribute("min", tomorrow);
    });

    it("uses the local day near midnight, not the UTC one", () => {
      const originalTimeZone = process.env.TZ;
      process.env.TZ = "America/New_York";
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-16T02:00:00Z"));

      try {
        render(<DateRangeSelector disablePastDates disableFutureDates />);

        expect(screen.getByLabelText("Start date")).toHaveAttribute("min", "2026-08-15");
        expect(screen.getByLabelText("Start date")).toHaveAttribute("max", "2026-08-15");
      } finally {
        process.env.TZ = originalTimeZone;
      }
    });

    it("follows the clock rather than freezing today at mount", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-15T23:59:00Z"));
      const { rerender } = render(<DateRangeSelector disablePastDates />);
      expect(screen.getByLabelText("Start date")).toHaveAttribute("min", "2026-08-15");

      vi.setSystemTime(new Date("2026-08-16T00:01:00Z"));
      rerender(<DateRangeSelector disablePastDates />);

      expect(screen.getByLabelText("Start date")).toHaveAttribute("min", "2026-08-16");
    });
  });
});
