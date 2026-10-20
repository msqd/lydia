import type { FilterMeta } from "@msqd/lydia/Models/Filters";

/**
 * A value of a facet. With `under`, it is a class whose values hang beneath it (a status class and its codes): its
 * `name` is the class token and each `under` name a code token (ADR 0002).
 */
export interface FacetOption extends FilterMeta {
  under?: FilterMeta[];
}

/** An option that has values beneath it. An empty `under` is a flat value. */
export type NestedOption = FacetOption & { under: FilterMeta[] };

export const isNested = (option: FacetOption): option is NestedOption => (option.under?.length ?? 0) > 0;

/** What a filter says about one option. A flat value is `whole` or `none`. */
export type OptionState =
  | { kind: "none" }
  | { kind: "whole" }
  | { kind: "some"; codes: string[] }
  | { kind: "minus"; excluded: string[] };

const NONE: OptionState = { kind: "none" };
const WHOLE: OptionState = { kind: "whole" };

/** `"-404"`: every value of the class but 404. It only means something beside the class token. */
const exclusion = (code: string) => `-${code}`;

const codeNames = (option: NestedOption) => option.under.map((code) => code.name);

/** What follows the class token, digits and letters abstracted: `"04"` is `"00"`, `"xx"` is `"aa"`. */
const shapeAfter = (token: string, prefix: string) =>
  token.slice(prefix.length).replace(/\d/g, "0").replace(/[a-z]/gi, "a");

/**
 * The one class that owns an unlisted code (ADR 0002): the class with the longest name that begins it, if what follows
 * has the shape of what follows the class in one of its listed codes. A label such as `"4xx"` does not look like `"404"`,
 * so it has no owner.
 */
function ownerOf(code: string, options: FacetOption[]): NestedOption | undefined {
  const owner = options
    .filter(isNested)
    .filter((option) => code.length > option.name.length && code.startsWith(option.name))
    .reduce<NestedOption | undefined>(
      (best, option) => (best && best.name.length >= option.name.length ? best : option),
      undefined,
    );
  const shape = owner && shapeAfter(code, owner.name);
  return owner && codeNames(owner).some((listed) => shapeAfter(listed, owner.name) === shape) ? owner : undefined;
}

/**
 * Codes of the class excluded by `values` that the options do not list, such as a server facet that drops codes with
 * a zero count.
 */
function unlistedExclusions(values: string[], option: NestedOption, options: FacetOption[]): string[] {
  const listed = codeNames(option);
  return values
    .filter((value) => value.startsWith("-"))
    .map((value) => value.slice(1))
    .filter((code, at, all) => ownerOf(code, options) === option && !listed.includes(code) && all.indexOf(code) === at);
}

/** How a filter reads for one option; a class beside one of its own codes reads as the class. */
function readOption(values: string[], option: FacetOption, options: FacetOption[]): OptionState {
  if (!isNested(option)) return values.includes(option.name) ? WHOLE : NONE;

  const codes = codeNames(option);
  if (values.includes(option.name)) {
    const excluded = [
      ...codes.filter((code) => values.includes(exclusion(code))),
      ...unlistedExclusions(values, option, options),
    ];
    return excluded.length > 0 ? { kind: "minus", excluded } : WHOLE;
  }
  const chosen = codes.filter((code) => values.includes(code));
  if (chosen.length === codes.length) return WHOLE;
  return chosen.length > 0 ? { kind: "some", codes: chosen } : NONE;
}

/** The tokens one option writes, in the facet's order. An exclusion is only ever written beside its class. */
function writeOption(state: OptionState, option: FacetOption): string[] {
  const inOrder = (names: string[]) =>
    isNested(option) ? codeNames(option).filter((code) => names.includes(code)) : [];
  const unlisted = (names: string[]) =>
    isNested(option) ? names.filter((code) => !codeNames(option).includes(code)) : [];
  switch (state.kind) {
    case "none":
      return [];
    case "whole":
      return [option.name];
    case "some":
      return inOrder(state.codes);
    case "minus":
      return [option.name, ...[...inOrder(state.excluded), ...unlisted(state.excluded)].map(exclusion)];
  }
}

export const readSelection = (values: string[], options: FacetOption[]): OptionState[] =>
  options.map((option) => readOption(values, option, options));

/**
 * The filter the given states write: options in the facet's order, depth first, so one view has one address. Values
 * the facet does not offer keep their place after the offered ones rather than being dropped unseen.
 */
export function writeSelection(states: OptionState[], options: FacetOption[], values: string[]): string[] {
  const known = new Set(
    options.flatMap((option) => [
      option.name,
      ...(isNested(option) ? codeNames(option).flatMap((code) => [code, exclusion(code)]) : []),
    ]),
  );
  const isKnown = (value: string) =>
    known.has(value) || (value.startsWith("-") && ownerOf(value.slice(1), options) !== undefined);
  return [
    ...options.flatMap((option, index) => writeOption(states[index], option)),
    ...values.filter((value) => !isKnown(value)),
  ];
}

export const toggleOption = (state: OptionState): OptionState => (state.kind === "whole" ? NONE : WHOLE);

/**
 * Under a closed class a code is chosen or not; under an open class it is kept or excluded. Choosing the last code
 * gives the class; excluding the last kept code clears it, as `["4", "-400", "-404", "-422"]` would only match codes
 * not seen yet.
 */
export function toggleCode(state: OptionState, option: NestedOption, code: string): OptionState {
  const all = option.under.length;
  const flip = (names: string[]) => (names.includes(code) ? names.filter((name) => name !== code) : [...names, code]);
  switch (state.kind) {
    case "none":
    case "some": {
      const codes = flip(state.kind === "some" ? state.codes : []);
      if (codes.length === all) return WHOLE;
      return codes.length > 0 ? { kind: "some", codes } : NONE;
    }
    case "whole":
    case "minus": {
      const before = state.kind === "minus" ? state.excluded : [];
      const excluded = flip(before);
      const excludesCode = excluded.length > before.length;
      if (excludesCode && excluded.filter((name) => codeNames(option).includes(name)).length === all) return NONE;
      return excluded.length > 0 ? { kind: "minus", excluded } : WHOLE;
    }
  }
}

export function isCodeTicked(state: OptionState, code: string): boolean {
  switch (state.kind) {
    case "none":
      return false;
    case "whole":
      return true;
    case "some":
      return state.codes.includes(code);
    case "minus":
      return !state.excluded.includes(code);
  }
}
