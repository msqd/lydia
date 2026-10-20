import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Input } from "../Input/Input";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangeSelectorProps extends Omit<ComponentProps<"div">, "onChange"> {
  /**
   * The label for the date range selector
   */
  label?: string;
  /**
   * The current date range
   */
  value?: DateRange;
  /**
   * Placeholder for the start date input
   */
  startDatePlaceholder?: string;
  /**
   * Placeholder for the end date input
   */
  endDatePlaceholder?: string;
  /**
   * Callback when date range changes
   */
  onChange?: (range: DateRange) => void;
  /**
   * Additional CSS class for the component
   */
  className?: string;
  /**
   * Minimum allowed date (ISO format: YYYY-MM-DD)
   */
  minDate?: string;
  /**
   * Maximum allowed date (ISO format: YYYY-MM-DD)
   */
  maxDate?: string;
  /**
   * Whether to disable past dates
   */
  disablePastDates?: boolean;
  /**
   * Whether to disable future dates
   */
  disableFutureDates?: boolean;
}

export function DateRangeSelector({
  label,
  value = { startDate: "", endDate: "" },
  startDatePlaceholder = "Start date",
  endDatePlaceholder = "End date",
  onChange,
  className,
  minDate,
  maxDate,
  disablePastDates = false,
  disableFutureDates = false,
  ...props
}: DateRangeSelectorProps) {
  // Derived during render rather than mirrored into state. An effect would leave the first paint
  // showing no error and offering past dates, and would freeze "today" at the moment it last ran.
  const today = new Date().toISOString().split("T")[0];
  const effectiveMinDate = disablePastDates && !(minDate && minDate > today) ? today : minDate;
  const effectiveMaxDate = disableFutureDates && !(maxDate && maxDate < today) ? today : maxDate;

  const hasBothDates = Boolean(value.startDate?.trim() && value.endDate?.trim());
  const error = hasBothDates && value.startDate > value.endDate ? "Start date cannot be after end date" : null;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;

    if (onChange) {
      onChange({
        ...value,
        startDate: newStartDate,
      });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;

    if (onChange) {
      onChange({
        ...value,
        endDate: newEndDate,
      });
    }
  };

  return (
    <div className={twMerge("w-full", className)} {...props}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
          {error && <span className="text-xs text-danger-500">{error}</span>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={value.startDate}
          onChange={handleStartDateChange}
          placeholder={startDatePlaceholder}
          aria-label={startDatePlaceholder}
          variant={error ? "error" : "default"}
          {...(effectiveMinDate ? { min: effectiveMinDate } : {})}
          {...(value.endDate && value.endDate.trim()
            ? { max: value.endDate }
            : effectiveMaxDate
              ? { max: effectiveMaxDate }
              : {})}
        />
        <Input
          type="date"
          value={value.endDate}
          onChange={handleEndDateChange}
          placeholder={endDatePlaceholder}
          aria-label={endDatePlaceholder}
          variant={error ? "error" : "default"}
          {...(value.startDate && value.startDate.trim()
            ? { min: value.startDate }
            : effectiveMinDate
              ? { min: effectiveMinDate }
              : {})}
          {...(effectiveMaxDate ? { max: effectiveMaxDate } : {})}
        />
      </div>
    </div>
  );
}
