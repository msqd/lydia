import { Radio } from "@msqd/lydia/Components/Inputs";
import { Foldable, type FoldableProps } from "@msqd/lydia/Components/Utilities/Foldable";
import type { FilterChangeHandler, FilterMeta, Filters } from "@msqd/lydia/Models/Filters";
import { type ComponentProps, useId } from "react";
import { DEFAULT_COUNTS_CAPTION, FacetCountsCaption, countsCaptionOf } from "../FacetCountsCaption";
import { FacetLabel } from "../FacetLabel";

export interface SingleChoiceFacetProps extends ComponentProps<"div"> {
  /** Filter name/key in the filters object */
  name: string;
  /** Display title for the facet */
  title: string;
  /** Current filter values */
  filters: Filters;
  /** Unified filter change handler */
  onFiltersChange: FilterChangeHandler;
  /** Available options for the radio filter */
  options: FilterMeta[];
  /** Fallback name to use when option name is "NULL" or similar */
  fallbackName?: string;
  /** Whether the facet should be open by default */
  defaultOpen?: boolean;
  /**
   * Says what the counts are counts of. Counts come from the whole result set, so selecting a value in another facet
   * does not change them, and a number beside a value would otherwise read as "what I would get". The caption
   * describes the option group for a screen reader. Pass an empty string to drop it. Shown only when an option has a
   * count.
   */
  countsCaption?: string;
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
 * SingleChoiceFacet component for single-select filters using radio buttons.
 * Allows users to select only one option from a list.
 *
 * @example
 * ```tsx
 * <SingleChoiceFacet
 *   name="sortBy"
 *   title="Sort By"
 *   filters={filters}
 *   onFiltersChange={onFiltersChange}
 *   options={[
 *     { name: "newest", label: "Newest First", count: undefined },
 *     { name: "oldest", label: "Oldest First", count: undefined }
 *   ]}
 * />
 * ```
 */
export function SingleChoiceFacet({
  name,
  title,
  filters,
  onFiltersChange,
  options,
  fallbackName,
  defaultOpen = true,
  countsCaption = DEFAULT_COUNTS_CAPTION,
  headingLevel,
  className,
  ...props
}: SingleChoiceFacetProps) {
  const currentValue = filters[name] as string | undefined;
  const captionId = useId();
  const caption = countsCaptionOf(options, countsCaption);

  const handleChange = (optionName: string) => {
    onFiltersChange(name, optionName);
  };

  return (
    <Foldable title={title} defaultOpen={defaultOpen} headingLevel={headingLevel} className={className} {...props}>
      {/*
       * The title sits on the disclosure button, so it names the button and
       * nothing else. Without a name on the group itself a screen reader
       * announces "Option 1, radio button, 1 of 3" and never says what is
       * being chosen — the facet's own subject is missing (WCAG 1.3.1).
       *
       * `aria-label` rather than `aria-labelledby`: the button's id is
       * headlessui's and is not exposed, and `title` is a required string on
       * this component, so labelling from it cannot go undefined.
       */}
      {caption && <FacetCountsCaption id={captionId}>{caption}</FacetCountsCaption>}
      <div
        role="radiogroup"
        aria-label={title}
        aria-describedby={caption ? captionId : undefined}
        className="space-y-2"
      >
        {options.map((option) => {
          const displayName = option.name === "NULL" && fallbackName ? fallbackName : option.name;
          const optionLabel = option.label || displayName;

          return (
            <Radio
              key={option.name}
              id={`${name}-${option.name}`}
              name={name}
              value={option.name}
              label={<FacetLabel name={optionLabel} count={option.count} />}
              checked={currentValue === option.name}
              onChange={() => handleChange(option.name)}
            />
          );
        })}
      </div>
    </Foldable>
  );
}
