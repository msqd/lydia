import { RangeSlider } from "@msqd/lydia/Components/Inputs";
import { Foldable, type FoldableProps } from "@msqd/lydia/Components/Utilities/Foldable";
import { type FilterChangeHandler, type Filters, type RangeFilterMeta, readRange } from "@msqd/lydia/Models/Filters";
import { tpdexScale } from "@msqd/lydia/Models/Tpdex";
import { type ComponentProps } from "react";
import { FacetResetLink } from "../FacetResetLink";

// TPDEX marks and threshold mappings — derived once from the module-level tpdexScale.
const marks = tpdexScale.map((rating, index) => ({
  value: index * 10,
  label: rating.label,
  className: rating.className,
}));

const markValueToThresholdForMin = new Map(tpdexScale.map((rating, index) => [index * 10, rating.threshold]));
const markValueToThresholdForMax = new Map(
  tpdexScale.map((rating, index) => [(index + 1) * 10, rating.threshold ? rating.threshold - 1 : undefined]),
);

const maxKey = Math.max(...Array.from(markValueToThresholdForMin.keys()));
const minKey = Math.min(...Array.from(markValueToThresholdForMin.keys()));

// Remove the last mark for min and the first mark for max.
markValueToThresholdForMin.set(maxKey, undefined);
markValueToThresholdForMax.set(minKey, undefined);

const thresholdToMarkValueForMin = new Map<number, number>();
markValueToThresholdForMin.forEach((value, key) => {
  if (value !== undefined) {
    thresholdToMarkValueForMin.set(value, key);
  }
});

const thresholdToMarkValueForMax = new Map<number, number>();
markValueToThresholdForMax.forEach((value, key) => {
  if (value !== undefined) {
    thresholdToMarkValueForMax.set(value, key);
  }
});

const range: RangeFilterMeta = {
  min: minKey,
  max: maxKey,
  step: 10,
  marks: marks,
};

export interface PerformanceFacetProps extends ComponentProps<"div"> {
  /** Filter name/key in the filters object */
  name: string;
  /** Display title for the facet */
  title: string;
  /** Current filter values */
  filters: Filters;
  /** Unified filter change handler */
  onFiltersChange: FilterChangeHandler;
  /** Whether the facet should be open by default */
  defaultOpen?: boolean;
  /**
   * Where the facet's title sits in the document outline, if that is not `h5`.
   *
   * Forwarded to `Foldable`, which draws the title and cannot know what
   * precedes it. A rail headed `h2` whose facets are fixed at `h5` skips two
   * levels, which is WCAG 1.3.1 -- and a consumer had no way to say so, because
   * this component did not pass the prop on.
   */
  headingLevel?: FoldableProps["headingLevel"];
  /** Additional CSS classes */
  className?: string;
}

/**
 * PerformanceFacet component for TPDEX performance index filtering using a range slider.
 *
 * @example
 * ```tsx
 * <PerformanceFacet
 *   name="tpdex"
 *   title="Performance Index"
 *   filters={filters}
 *   onFiltersChange={onFiltersChange}
 * />
 * ```
 */
export function PerformanceFacet({
  name,
  title,
  filters,
  onFiltersChange,
  defaultOpen = true,
  headingLevel,
  className,
  ...props
}: PerformanceFacetProps) {
  const currentValue = readRange(filters, name);

  const handleChange = (value: { min?: number; max?: number }) => {
    if (value && typeof value === "object" && "min" in value && "max" in value) {
      // The marks follow `tpdexScale`, best rating first, so the left thumb (`min`) bounds the highest
      // threshold and the right thumb (`max`) the lowest.
      const maxValue = markValueToThresholdForMax.get(value.min ?? -1);
      const minValue = markValueToThresholdForMin.get(value.max ?? -1);

      const newValue: { min?: number; max?: number } = {};

      if (minValue !== null && minValue !== undefined) {
        newValue.min = minValue;
      }

      if (maxValue !== null && maxValue !== undefined) {
        newValue.max = maxValue;
      }

      onFiltersChange(name, Object.keys(newValue).length > 0 ? newValue : undefined);
    }
  };

  // Convert current TPDEX thresholds to slider values for display
  const getSliderValues = () => {
    const defaultMin = range.min;
    const defaultMax = range.max;

    if (!currentValue.min && !currentValue.max) {
      return { min: defaultMin, max: defaultMax };
    }

    const sliderMin =
      currentValue.max !== undefined ? (thresholdToMarkValueForMax.get(currentValue.max) ?? defaultMin) : defaultMin;

    const sliderMax =
      currentValue.min !== undefined ? (thresholdToMarkValueForMin.get(currentValue.min) ?? defaultMax) : defaultMax;

    return { min: sliderMin, max: sliderMax };
  };

  const sliderValues = getSliderValues();

  // Check if there are active filters (different from default range)
  const hasActiveFilters = sliderValues.min !== range.min || sliderValues.max !== range.max;

  const handleReset = () => {
    onFiltersChange(name, undefined);
  };

  const titleAction = hasActiveFilters ? (
    <FacetResetLink title={title} onReset={handleReset}>
      reset
    </FacetResetLink>
  ) : undefined;

  return (
    <Foldable
      title={title}
      titleAction={titleAction}
      defaultOpen={defaultOpen}
      headingLevel={headingLevel}
      className={className}
      {...props}
    >
      <RangeSlider
        min={range.min}
        max={range.max}
        step={range.step}
        value={sliderValues}
        onChange={handleChange}
        marks={range.marks}
        label={title}
        className="mt-4"
      />
    </Foldable>
  );
}
