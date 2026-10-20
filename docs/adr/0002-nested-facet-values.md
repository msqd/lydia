# 2. Nested facet values: the whole class, some codes, or the class minus codes

Date: 2026-10-12. Status: proposed; merges with #162.

## Context

jaco filters status by class and by code, and keeps a local facet to do it
([msqd/jaco#129](https://github.com/msqd/jaco/issues/129)). Before it can drop that facet, `MultipleChoiceFacet` has to
nest codes under their class.

Recette on #134 went five rounds. Two rulings shaped this ADR: a class and its own code are never both in the filter, and
a class is an open set that never turns into a list of codes by itself. Round 5 added "4xx except 404", which #134 could
not express. #159 settles the rest.

## Decision

### Tokens

Values are jaco's (`query-strings.json`, `status_tokens`):

| Token | Means | Set |
|---|---|---|
| `"4"` | every 4xx, including codes not seen yet | open |
| `"404"` | this code | closed |
| `"-404"` | every 4xx but 404; valid only beside `"4"` | open |
| `"failure"` | a flat value with no codes | - |

`"4xx"` is a label, never a value. `filters[name]` keeps its shape: a list of strings, or `undefined` for no filter.

Within a facet, tokens are written in the facet's order, depth first: a class, then its exclusions in code order, then
the next class; flat values after the classes. One view has one address.

### Per class, one state

| State | Filter for 4xx | Class box | Codes |
|---|---|---|---|
| Nothing | no 4xx token | unticked | unticked |
| Whole class | `"4"` | ticked | ticked |
| Some codes | `"404"`, `"422"` | partial | the chosen ones ticked |
| Class minus codes | `"4"`, `"-404"` | partial | ticked but the excluded ones |

Counts stay unfiltered (#82): a class with exclusions shows its full count.

### Reading a filter

| Filter received | Reads as | Written on the next change as |
|---|---|---|
| `["4", "404"]` | whole class | `["4"]` |
| every offered 4xx code | whole class | `["4"]` |
| `["-404"]`, no `"4"` | nothing for 4xx | the exclusion is dropped |
| `["4", "-404", "404"]` | class minus 404 | `["4", "-404"]` |

An exclusion of a code the facet does not list belongs to one class or to none. The owner is the class with the longest
name that begins the code, provided what follows has the shape of what follows the class in one of its listed codes,
any digit standing for any digit and any letter for any letter (`-499` goes to class `4`; `-api2/y` to `api2`, not `api`). An owned exclusion shows in
the except line and is written after the listed exclusions. A value with no owner, such as `-4xx` (`xx` is not shaped
like `04`), is not an exclusion: it is kept unread after the facet's own tokens.

### Transitions

| From | Action | To |
|---|---|---|
| nothing, some codes, class minus codes | tick the class | whole class `["4"]` |
| whole class | untick the class | nothing |
| nothing | tick a code | some codes `["404"]` |
| some codes | tick a code | some codes, one more |
| some codes | tick the last unticked code | whole class `["4"]` |
| some codes | untick a code | some codes, one fewer |
| some codes | untick the last ticked code | nothing |
| whole class | untick a code (exclude it) | class minus that code `["4", "-404"]` |
| class minus codes | untick another code | class minus both `["4", "-404", "-422"]` |
| class minus codes | tick an excluded code, or press its × | class minus the rest; whole class if none left |
| class minus codes | untick the last kept code | nothing |
| any | "only" on a class | `["4"]`, every other value cleared |
| any | "only" on a code | `["404"]`, every other value cleared |
| any | tick or untick `failure` | `failure` added or removed; classes unchanged |
| any | "only" on `failure` | `["failure"]` |
| any | reset | no filter |

Excluding a code means unticking it under an open class. There is no other way in: from nothing or from some codes,
the class has to be ticked first. Unticking the last kept code clears the class, as unticking the last code of some
codes does; `["4", "-400", "-404", "-422"]`, which would match only codes not seen yet, is never written.

### Flat values

A value with no codes (`failure`) is a sibling after the classes: no nesting, no partial state.

### Interface

Variant C of the mockup (#172), simplified after recette (#169) and UX research, implemented in #182. Stories:
`src/Components/Facets/Variants/MultipleChoiceFacet.stories.tsx`, `NestedValues` and `NestedWithSelection`.

- Each class has one disclosure chevron (`aria-expanded`, `aria-controls`), the same in every state; it folds or unfolds
  its class on its own.
- Fold rules, from the recette of #172:
  - Classes start folded.
  - Checking a class unfolds it; unchecking folds it back.
  - On first render, a class with a selection (some codes, or class minus codes) starts unfolded.
- Whole class shows no extra line: the ticked box says it.
- Class minus codes keeps the partial tick, and shows one line under the class: `except [404 ×] [422 ×]`. × includes
  that code again in one click. That line is what tells it from some codes, which shows none. Unticking the last kept
  code clears the class.
- The class checkbox is `aria-describedby` that line, so a screen reader reads "4xx, mixed, except 404, 422".

No observability tool nests status codes in a facet; those that exclude say so in words ("is not", `!=`, a NOT pill),
never with a checkbox shade alone. The `except` line follows them.

## Consequences

- jaco changes its own facet to these tokens, then drops it for `MultipleChoiceFacet` (msqd/jaco#129). jaco's
  recorder parses `-404` too, beside its class.
- lydia's `filtering.ts` matches `"4xx"` and `"failure"` only; learning codes is #163.
- HARP and ApiLab see no change until they pass nested options.
