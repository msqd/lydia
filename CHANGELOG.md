# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versions 0.1.0 to 0.4.0 were internal releases consumed from git as `lydia`, never published to npm. The unscoped
`lydia` package on npm is unrelated. The first npm release is 0.6.0, as `@msqd/lydia`.

<!-- towncrier release notes start -->

## 0.4.0 - 2026-10-15

### Breaking

- **`TpdexRating.color` (hex) is now `token`**, the name of a theme token (`--color-tpdex-a`). A consumer that reads
  `rating.color` resolves the token (`resolveThemeColor(rating.token)`); one that builds its own `TpdexRating` writes
  `token` instead of `color`. `className` is now `bg-tpdex-*` instead of a Tailwind palette class (`bg-green-500`), so
  a test that matches the old class must match the new one.
- **Bar series `color` may be `undefined`.** `createThinBarSeries` and `createWideBarSeries` return series whose
  `color` is typed `string | undefined`, no longer `string`. A consumer assigning `createThinBarSeries(...)[0].color`
  (or the wide one) to a `string` must handle `undefined`.
- **`lydia/styles` no longer ships some palette utilities.** `.bg-teal-400`, `.bg-emerald-400`, `.bg-lime-500`,
  `.bg-yellow-500`, `.bg-amber-500`, `.bg-orange-500`, `.bg-red-500` and `.bg-red-700` are gone, with
  `--color-teal-400`, `--color-emerald-400`, `--color-lime-500`, `--color-amber-500` and `--color-orange-500`. A
  consumer using them must generate them from its own Tailwind scan.

### Added

- Theme tokens `--color-tpdex-*` (one per rating) and `--color-chart-transactions`, `--color-chart-rest` and
  `--color-chart-label`. Retheme them to move badges and charts together.
- `resolveThemeColor`, `resolveThemeColors` and `toEchartsColor` (`Components/Charts/Utils`) read a theme token from
  the computed style and convert `oklch()` to `rgb()`, which ECharts parses. `useThemeColor` and `useThemeColors`
  (`Components/Charts/Hooks`) do it during render and again when the theme changes.
- `MultipleChoiceFacet` and `SingleChoiceFacet` say what their counts are counts of: a caption under the heading,
  "Counts cover all transactions", which also describes the option group for a screen reader. Counts do not narrow
  as other facets are filtered. Pass `countsCaption` to reword it, or `""` to drop it. A facet whose options have no
  count shows no caption. `DEFAULT_COUNTS_CAPTION` is exported.

### Changed

- Chart colours follow theme tokens instead of hex. `TransactionsChart` bars use the danger and success tokens (they
  were `#e6adad` and `#b9e6ad`), the TPDEX line uses the `--color-tpdex-*` tokens, and a theme change reaches charts on
  screen without a remount.
- `SummaryRateChart` `color` accepts a theme token (`--color-danger-200`) as well as a CSS colour. The Errors pane
  uses `--color-danger-200`, the colour of its ring.
- The theme is declared `@theme static`, so every token is in the stylesheet whether or not a class uses it. Charts
  read tokens at runtime and would otherwise find them dropped.
- `createWideBarSeries` and `createThinBarSeries` take an optional `colors`.

### Fixed

- `MultipleChoiceFacet`: an exclusion of a code the options do not list belongs to one class or none
  ([ADR 0002](docs/adr/0002-nested-facet-values.md)). `["4", "-4xx"]` no longer reads as "4xx except 4xx", and a
  code under two class names (`api`, `api2`) is no longer written twice.
- `MultipleChoiceFacet`: including an unlisted code again no longer clears its class. `["4", "-404", "-499"]` gives
  `["4", "-404"]`, not no filter, when 404 is the only listed code.
- A status class written `"4XX"` (any case) is read as `"4"` and written back as `"4"`, like `"4xx"`. It was logged as
  unknown and ignored while the facet still showed the filter active.
- The overview errors link filters on `status=5&status=failure`. It passed `5xx` and `ERR`, and `ERR` is not a status
  token.
- `MultipleChoiceFacet` unfolds a class holding a selection when its `options` arrive after mount. A fold the user
  chose is kept when options update.

## 0.3.0 - 2026-10-15

### Breaking

- **Status filter values follow [ADR 0002](docs/adr/0002-nested-facet-values.md).** The status facet and
  `statusGroupsOf` emit tokens, no longer `"4xx"`: a class `"4"`, a code `"404"`, an exclusion `"-404"` (every code
  of the class but 404), and `"failure"`.
  - `"4xx"` passed in `filters.status` is read as `"4"`. An unknown value is logged with `console.error` and
    ignored.
  - A consumer that forwards `filters.status` to a backend or a URL must map the tokens: `"4xx"` becomes `"4"`, and
    `"404"` and `"-404"` are new. Filters saved with `"4xx"` still filter.
  - The class label is "4xx" and its description "Client Error", shown as a tooltip. The label was "4xx Client Error".
- **`statusGroupOrder` is now `statusClassOrder`** (`lydia/Models/Transactions/encoding`). Its values are `"1"` to
  `"5"` instead of `"1xx"` to `"5xx"`, and `"failure"` is no longer in it. Rename the import and the values you
  compare against.
- **`MultipleChoiceFacet` checkbox `id` and `name` are generated.** They were `${name}-${value}` (`method-GET`). This
  affects every facet, not only status. A test that selects `#method-GET` or `input[name="method-GET"]` must query by
  role and accessible name instead.

### Added

- Nested facet values. A `MultipleChoiceFacet` option takes `under`, the codes that hang beneath it
  (`FacetOption`, exported from `Components/Facets`).
  - A class is ticked whole, partly (indeterminate, some codes) or whole but some codes, shown as "except".
  - Classes start folded unless the filter holds a selection for them; the user owns the fold after that.
  - `deriveTransactionFacets` nests each status code under its class.
  - Helpers live in `Components/Facets/Variants/nestedValues`.
- `FilterMeta.description`: what the label stands for. Shown as a tooltip and read as the checkbox's description.
- Paginator `labelledBy`: ids of the elements whose text leads the landmark's name.
- Checkbox `indeterminate`.
- `statusClassOf`, `canonicalStatusToken` and `parseStatusSelection` (`Models/Transactions/encoding`).

### Fixed

- TransactionsListPage: a page named with `aria-label` or `aria-labelledby` leads its paginators' names ("Errors,
  pagination above the list"), so two pages in a document no longer repeat the same landmarks. An unnamed page keeps
  its names.
- RangeSlider: `defaultValue` type-checks. The `defaultValue` inherited from `div` made it unusable.
- Nested facet values:
  - After "include again" on an except chip, focus moves to the next chip or to the class checkbox, never lost.
  - An exclusion of a code the facet does not list shows in the except line and can be removed.

## 0.2.0 - 2026-10-14

### Breaking

- `TransactionsListPage`: the filters sidebar no longer remembers its open state in `localStorage`. It starts closed; pass `filtersOpen` and `onFiltersOpenChange` together to control it and persist it yourself (`filtersOpen` alone does not compile; `onFiltersOpenChange` alone only reports changes). The `use-state-persist` dependency is dropped.
- `TransactionsListPageProps` is now a type alias over a union, no longer an interface.
  - `interface X extends TransactionsListPageProps` fails (TS2312): declare `type X = TransactionsListPageProps & { … }`.
  - `Omit<TransactionsListPageProps, K>` collapses the union and no longer fits the page: use a distributive omit,
    `type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never`.

### Changed

- CI runs the Storybook story tests.

### Fixed

- RangeSlider shows keyboard focus on the drawn thumb.

## 0.1.0 - 2026-10-12

First release.

### Breaking

- **MultipleChoiceFacet narrows instead of excluding**
  ([ADR 0001](docs/adr/0001-facets-narrow.md)).
  - Nothing chosen is nothing ticked, and no filter.
  - A tick adds that value to the filter. HARP's inversion is gone.
  - Values are reported in the facet's order, not in click order.
  - Ticking every box keeps every value; it no longer collapses to "no filter".
  - A facet with a single option is enabled.
  - "only" shows while another value is chosen; with nothing chosen it would equal a tick.
  - `Filters` keeps its shape. A list saved under the old behaviour still filters as before, but leaves out
    values that appeared since.
- **Accessible names changed.** Update any test that queries them.
  - NavBar: the home link is named by its brand text, no longer "Go to homepage". The logo is decorative.
  - SearchInput: the button is "Search with Enter".
  - Colors: each cell holds a button, named by its hex, then what it copies.
  - Paginator: the landmark is named by the new `label` prop, "Pagination" by default.
- **Foldable.** The heading and `titleAction` now sit outside the disclosure button: the button is inside the
  heading, the action beside it. The action needs no `stopPropagation`. The default heading level follows the
  section (see `HeadingLevel`) and falls back to h5, instead of always h5.
- **Visible colour changes** for 4.5:1 contrast.
  - TpdexBadge: dark labels on the light fills; only G keeps white.
  - Secondary greys: keyboard hints, line numbers and the filters toggle go from gray-400 to gray-500; explorer
    counts go to gray-600.
  - Status colours as text: StatCard trends use the -700 step of the success and danger tokens; JsonTreeView
    strings go green-700.
  - The favourite star outline goes from gray-300 to gray-500.

### Added

- `HeadingLevel`, `Subheading` and `useSubheadingLevel` (`Components/Typography`). A section says which level heads
  it, and the headings inside go one below.
- DefaultLayout: `title` (the page's one h1, in a header band) and `toolbar` (wraps at narrow widths).
- DataTable columns: `labelHidden` keeps the label as the header's name with no text drawn; `rowHeader` draws the
  cell as `<th scope="row">`.
- Paginator `label`.
- RangeSlider `label`, naming its two thumbs "<label>, minimum" and "<label>, maximum" ("Minimum" and
  "Maximum" without it). PerformanceFacet passes its title.
- `getTpdexTextClassName`, and an optional `textClassName` on a Tpdex rating. Omitted, the label is dark.

### Changed

- The facet count is a fixed column, wide enough for seven digits, and "only" follows the name.
- The build rewrites `package.json` only when its exports change, so a repository vendoring lydia as a
  submodule no longer sees a stale stat.
- CodeFormatter skips syntax highlighting for a body drawn as plain text: a virtualized view over 50 lines, and
  the unvirtualized view. A 10 MB body renders in a fraction of the time.
- Storybook runs axe over every story and fails on a violation.

### Fixed

- Keyboard and screen reader access:
  - The favourite star in TransactionsListPage is a toggle button named by its transaction, with `aria-pressed`.
  - CodeFormatter's scrollable body is a named group in the tab order.
  - "only" in MultipleChoiceFacet is a button beside the checkbox, not inside its label, and is visible on
    focus.
  - Focus stays on the value's checkbox when "only" narrows to it.
  - TransactionsExplorerSidebar tree toggles are named and say whether they are open.
  - CacheIndicator is an image named by its status.
  - The transactions list's star column header is named "Favourite".
  - The two paginators of TransactionsListPage are named apart, so a screen reader no longer lists one landmark twice.
- Headings nest without skipping a level in facet cards, the filters sidebar, the transaction detail page and the
  system map.
