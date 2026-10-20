import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { Checkbox } from "@msqd/lydia/Components/Inputs";
import { Foldable, type FoldableProps } from "@msqd/lydia/Components/Utilities/Foldable";
import type { FilterChangeHandler, FilterMeta, Filters } from "@msqd/lydia/Models/Filters";
import { type ComponentProps, Fragment, type ReactNode, useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FacetCount } from "../FacetCount";
import { DEFAULT_COUNTS_CAPTION, FacetCountsCaption, countsCaptionOf } from "../FacetCountsCaption";
import { FacetInnerLightButton } from "../FacetInnerLightButton";
import { FacetResetLink } from "../FacetResetLink";
import {
  type FacetOption,
  type NestedOption,
  type OptionState,
  isCodeTicked,
  isNested,
  readSelection,
  toggleCode,
  toggleOption,
  writeSelection,
} from "./nestedValues";

export type { FacetOption } from "./nestedValues";

export interface MultipleChoiceFacetProps extends ComponentProps<"div"> {
  /** Filter name/key in the filters object */
  name: string;
  /** Display title for the facet */
  title: string;
  /** Current filter values */
  filters: Filters;
  /** Unified filter change handler */
  onFiltersChange: FilterChangeHandler;
  /**
   * Values this facet can offer, with their counts. Only the consumer knows what exists in the
   * whole result set, so an absent or empty list renders an empty facet rather than a guess.
   *
   * An option with `under` is a class (`"4"`, labelled "4xx") whose codes (`"404"`) hang beneath it. In
   * `filters` a class is chosen whole (`"4"`), as some codes (`"404"`), or as every code but some (`"4"`
   * then `"-404"`). ADR 0002 has the full rules.
   */
  options?: FacetOption[];
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

interface OptionRowProps {
  id: string;
  label: ReactNode;
  count?: number;
  checked: boolean;
  indeterminate?: boolean;
  describedBy?: string;
  /** Long form of the label: a tooltip, and the checkbox's accessible description. */
  description?: string;
  onChange: () => void;
  /** Rendered before the checkbox, such as a disclosure chevron. */
  before?: ReactNode;
  /** Present when "only" saves clicks on this row. */
  onOnly?: () => void;
  className?: string;
}

function OptionRow({
  id,
  label,
  count,
  checked,
  indeterminate,
  describedBy,
  description,
  onChange,
  before,
  onOnly,
  className,
}: OptionRowProps) {
  const descriptionId = `${id}-description`;
  const describedByIds = [description && descriptionId, describedBy].filter(Boolean).join(" ") || undefined;

  return (
    // "only" follows the name and sits outside the label: a label may hold
    // nothing interactive but its own control, and some browsers pass a
    // click on a button inside it to the box. The count is taken out of
    // the flow into the padding on the right (wide enough for 7 digits), so it is one column that
    // "only" appearing, or being absent, cannot shift.
    <div className={twMerge("group relative flex items-center pr-14", className)}>
      {before}
      <Checkbox
        containerProps={{ className: "static w-auto min-w-0" }}
        id={id}
        name={id}
        label={
          <>
            <span className="block truncate" title={description}>
              {label}
            </span>
            {count !== undefined && (
              <FacetCount count={count} className="absolute right-0 top-1/2 -translate-y-1/2 tabular-nums" />
            )}
          </>
        }
        checked={checked}
        indeterminate={indeterminate}
        aria-describedby={describedByIds}
        onChange={onChange}
      />
      {description && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
      {onOnly && (
        <span className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <FacetInnerLightButton label="only" handler={onOnly} />
        </span>
      )}
    </div>
  );
}

/**
 * MultipleChoiceFacet component for multi-select filters with "only" buttons.
 * Allows users to select multiple options from a list using checkboxes.
 * A tick narrows to its value; nothing ticked means no filter.
 * An option with `under` nests its codes beneath it (ADR 0002).
 *
 * @example
 * ```tsx
 * <MultipleChoiceFacet
 *   name="status"
 *   title="Status"
 *   filters={filters}
 *   onFiltersChange={onFiltersChange}
 *   options={[
 *     { name: "2xx", label: "2xx Success", count: 756 },
 *     { name: "4xx", label: "4xx Client Error", count: 123 }
 *   ]}
 * />
 * ```
 */
export function MultipleChoiceFacet({
  name,
  title,
  filters,
  onFiltersChange,
  options = [],
  fallbackName,
  defaultOpen = true,
  countsCaption = DEFAULT_COUNTS_CAPTION,
  headingLevel,
  className,
  ...props
}: MultipleChoiceFacetProps) {
  const currentValues = (filters[name] as string[]) || [];
  const selection = readSelection(currentValues, options);
  const hasNested = options.some(isNested);

  // A class starts folded, unless the filter holds a selection for it when its options first arrive, at mount or
  // later. After that the user owns its fold, so options updating never resets it.
  const [seen, setSeen] = useState<string[]>([]);
  const [unfolded, setUnfolded] = useState<string[]>([]);
  const arrived = options.filter((option) => isNested(option) && !seen.includes(option.name));
  if (arrived.length > 0) {
    setSeen([...seen, ...arrived.map((option) => option.name)]);
    setUnfolded([
      ...unfolded,
      ...arrived.filter((option) => selection[options.indexOf(option)].kind !== "none").map((option) => option.name),
    ]);
  }
  const fold = (optionName: string, unfold: boolean) =>
    setUnfolded((names) => [...names.filter((other) => other !== optionName), ...(unfold ? [optionName] : [])]);

  /**
   * A tick narrows to a value, and nothing ticked is no filter (msqd/jaco#129).
   *
   * Values are reported in the facet's order, never in click order, so one
   * view has one address. A chosen value the facet no longer offers keeps its
   * place after the offered ones rather than being dropped unseen.
   */
  const setState = (index: number, state: OptionState) => {
    const next = writeSelection(
      selection.map((current, at) => (at === index ? state : current)),
      options,
      currentValues,
    );
    onFiltersChange(name, next.length === 0 ? undefined : next);
  };

  const tickOption = (index: number) => {
    const next = toggleOption(selection[index]);
    setState(index, next);
    if (isNested(options[index])) fold(options[index].name, next.kind === "whole");
  };

  // Ids follow position, not value: values may hold spaces, and two facets may share a `name`.
  const baseId = useId();
  const idOf = (...path: (number | string)[]) => [baseId, ...path].join("-");
  const caption = countsCaptionOf(options, countsCaption);

  const handleOnlyClick = (value: string, id: string) => {
    onFiltersChange(name, [value]);
    // The value narrowed to offers no "only", so the pressed button is about to
    // go, and focus with it to the document (WCAG 2.4.3). Its own checkbox
    // stays, and is where a keyboard user was.
    document.getElementById(id)?.focus();
  };

  const handleAnyClick = () => {
    onFiltersChange(name, undefined);
  };

  /**
   * "only" where it saves clicks: not on the value the filter already is.
   * With nothing chosen it would equal ticking the box.
   */
  const onlyFor = (value: string, id: string) =>
    currentValues.length > 0 && !(currentValues.length === 1 && currentValues[0] === value)
      ? () => handleOnlyClick(value, id)
      : undefined;

  const hasActiveFilters = currentValues.length > 0;

  const titleAction = hasActiveFilters ? (
    <FacetResetLink title={title} onReset={handleAnyClick}>
      reset
    </FacetResetLink>
  ) : undefined;

  const labelOf = (meta: FilterMeta) => meta.label || (meta.name === "NULL" && fallbackName ? fallbackName : meta.name);

  const renderCodes = (option: NestedOption, index: number, state: OptionState, folded: boolean) => (
    <div
      id={idOf(index, "codes")}
      role="group"
      aria-label={labelOf(option)}
      hidden={folded}
      className="space-y-2 ps-11 pt-2"
    >
      {option.under.map((code, codeIndex) => (
        <OptionRow
          key={code.name}
          id={idOf(index, codeIndex)}
          label={labelOf(code)}
          description={code.description}
          count={code.count}
          checked={isCodeTicked(state, code.name)}
          onChange={() => setState(index, toggleCode(state, option, code.name))}
          onOnly={onlyFor(code.name, idOf(index, codeIndex))}
        />
      ))}
    </div>
  );

  /**
   * The pressed cross is about to go, and the last one takes the whole line with it. Focus moves to the next
   * cross, or to the class box, before that (WCAG 2.4.3).
   */
  const includeAgain = (option: NestedOption, index: number, excluded: string[], state: OptionState, at: number) => {
    const next = at + 1 < excluded.length ? idOf(index, "except", at + 1) : idOf(index);
    document.getElementById(next)?.focus();
    setState(index, toggleCode(state, option, excluded[at]));
  };

  const renderExcluded = (option: NestedOption, index: number, excluded: string[], state: OptionState) => (
    <div className="flex flex-wrap items-center gap-1 ps-11 pt-1 text-xs text-gray-600">
      <span id={idOf(index, "except")} className="sr-only">
        except {excluded.join(", ")}
      </span>
      <span aria-hidden>except</span>
      {excluded.map((code, at) => (
        <button
          key={code}
          id={idOf(index, "except", at)}
          type="button"
          aria-label={`Include ${code} again`}
          onClick={() => includeAgain(option, index, excluded, state, at)}
          className="inline-flex cursor-pointer items-center gap-0.5 rounded bg-gray-100 px-1.5 leading-5 text-gray-800 hover:bg-gray-200"
        >
          {code}
          <XMarkIcon aria-hidden className="h-3 w-3" />
        </button>
      ))}
    </div>
  );

  const renderOption = (option: FacetOption, index: number) => {
    const state = selection[index];
    const row = (extra: Partial<OptionRowProps> = {}) => (
      <OptionRow
        id={idOf(index)}
        label={labelOf(option)}
        description={option.description}
        count={option.count}
        checked={state.kind === "whole"}
        onChange={() => tickOption(index)}
        onOnly={onlyFor(option.name, idOf(index))}
        {...extra}
      />
    );

    if (!isNested(option)) {
      // A flat value lines up with the labels of the classes around it, past their chevrons.
      return <Fragment key={option.name}>{row({ className: hasNested ? "ps-4" : undefined })}</Fragment>;
    }

    const folded = !unfolded.includes(option.name);
    const Chevron = folded ? ChevronRightIcon : ChevronDownIcon;
    const excluded = state.kind === "minus" ? state.excluded : [];
    return (
      <div key={option.name}>
        {row({
          indeterminate: state.kind === "some" || state.kind === "minus",
          describedBy: state.kind === "minus" ? idOf(index, "except") : undefined,
          before: (
            <button
              type="button"
              aria-label={`${labelOf(option)} codes`}
              aria-expanded={!folded}
              aria-controls={idOf(index, "codes")}
              onClick={() => fold(option.name, folded)}
              className="-ms-1 me-1 flex h-6 w-4 shrink-0 cursor-pointer items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <Chevron aria-hidden className="h-4 w-4" />
            </button>
          ),
        })}
        {state.kind === "minus" && renderExcluded(option, index, excluded, state)}
        {renderCodes(option, index, state, folded)}
      </div>
    );
  };

  return (
    <Foldable
      title={title}
      titleAction={titleAction}
      defaultOpen={defaultOpen}
      headingLevel={headingLevel}
      className={className}
      {...props}
    >
      {options.length === 0 && <p className="text-xs text-gray-500 italic">No values</p>}
      {/*
       * The title sits on the disclosure button, so it names the button and
       * nothing else — and these checkboxes do not share a `name` either, so
       * nothing ties them together. Without a name on the group a screen
       * reader announces "Option 1, checkbox, checked" and never says what is
       * being narrowed (WCAG 1.3.1).
       *
       * `role="group"` rather than `radiogroup`, which is for a single choice.
       * `aria-label` rather than `aria-labelledby`: the button's id is
       * headlessui's and is not exposed, and `title` is a required string on
       * this component, so labelling from it cannot go undefined.
       */}
      {caption && <FacetCountsCaption id={idOf("caption")}>{caption}</FacetCountsCaption>}
      <div
        role="group"
        aria-label={title}
        aria-describedby={caption ? idOf("caption") : undefined}
        className="space-y-2"
      >
        {options.map(renderOption)}
      </div>
    </Foldable>
  );
}
