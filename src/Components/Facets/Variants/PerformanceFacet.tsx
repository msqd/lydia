import { RangeSlider } from "@msqd/lydia/Components/Inputs";
import { Foldable, type FoldableProps } from "@msqd/lydia/Components/Utilities/Foldable";
import { type FilterChangeHandler, type Filters, type RangeFilterMeta, readRange } from "@msqd/lydia/Models/Filters";
import { tpdexScale } from "@msqd/lydia/Models/Tpdex";
import { type ComponentProps } from "react";
import { FacetResetLink } from "../FacetResetLink";

const MARK_STEP = 10;

const marks = tpdexScale.map((rating, index) => ({
  value: index * MARK_STEP,
  label: rating.label,
  className: rating.className,
}));

const range: RangeFilterMeta = {
  min: 0,
  max: (tpdexScale.length - 1) * MARK_STEP,
  step: MARK_STEP,
  marks: marks,
};

type SliderValue = { min: number; max: number };
type TpdexBounds = { min?: number; max?: number };

/**
 * Slider positions to tpdex bounds.
 *
 * Marks follow `tpdexScale`, best rating first, so the left thumb bounds the score from above and the
 * right thumb from below. A thumb at its end of the track sets no bound.
 */
export function sliderToFilter(slider: SliderValue): TpdexBounds {
  const upper = slider.min === range.min ? undefined : tpdexScale[slider.min / MARK_STEP]?.threshold;
  const lower = tpdexScale[slider.max / MARK_STEP]?.threshold;
  return {
    ...(lower !== undefined && { min: lower }),
    ...(upper !== undefined && { max: upper - 1 }),
  };
}

/**
 * Tpdex bounds to slider positions. A bound between two marks sits on the next mark at or below it,
 * and a bound that no mark can show leaves its thumb at the end of the track.
 */
export function filterToSlider({ min, max }: TpdexBounds): SliderValue {
  const lowerIndex =
    min === undefined ? -1 : tpdexScale.findIndex((r) => r.threshold !== undefined && r.threshold <= min);
  const upperIndex =
    max === undefined
      ? -1
      : tpdexScale.findIndex((r, i) => i > 0 && r.threshold !== undefined && r.threshold - 1 <= max);
  return {
    min: upperIndex < 0 || (max ?? 0) >= 100 ? range.min : upperIndex * MARK_STEP,
    max: lowerIndex < 0 ? range.max : lowerIndex * MARK_STEP,
  };
}

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
    const bounds = sliderToFilter({ min: value.min ?? range.min, max: value.max ?? range.max });
    onFiltersChange(name, Object.keys(bounds).length > 0 ? bounds : undefined);
  };

  const sliderValues = filterToSlider(currentValue);
  const hasActiveFilters = currentValue.min !== undefined || currentValue.max !== undefined;

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
