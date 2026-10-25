# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versions 0.1.0 to 0.4.0 were internal releases consumed from git as `lydia`, never published to npm. The unscoped
`lydia` package on npm is unrelated. The first npm release is 0.6.0, as `@msqd/lydia`.

<!-- towncrier release notes start -->

## [0.6.0] - 2026-10-25

### Breaking

- The public surface is now an explicit list of folder barrels, the root entry and the CSS entries (`styles`, `theme.css`, `components.css`). Single-file subpaths and internal folders are no longer exported: import from the folder barrel or the root, which still re-export the components and types. Internal helpers (such as `Components/Charts/Utils/ReactEChartsCore` and the rest of `Pages/Transactions/Detail/Utils`) have no replacement. `ContentRenderer` and `BodyPreview` are exported from `Pages/Transactions/Detail`, `SummarySection` and `HistorySection` from `Pages/Overview`, `SyntaxHighlighter`, `VirtualizedCodeView`, `BodyNotice` and `PerformanceMetrics` from `Components/Formatter`, `FacetCountsCaption` and `countsCaptionOf` from `Components/Facets`. The default export of `Components/Inputs/Textarea` is removed: import `Textarea` by name. Dropped subpaths: `Components/Badges/Badge`, `Components/Buttons/Button`, `Components/Buttons/ButtonGroup`, `Components/Cards/Card`, `Components/Cards/StatCard`, `Components/Charts/Components`, `Components/Charts/Components/ThinBarChart`, `Components/Charts/Components/WideBarChart`, `Components/Charts/Hooks`, `Components/Charts/Hooks/useChartDimensions`, `Components/Charts/Hooks/useThemeColors`, `Components/Charts/SummaryPerformancesChart`, `Components/Charts/SummaryRateChart`, `Components/Charts/TransactionsChart`, `Components/Charts/Utils`, `Components/Charts/Utils/ChartBarCalculator`, `Components/Charts/Utils/ChartColors`, `Components/Charts/Utils/ChartTooltipFormatter`, `Components/Charts/Utils/escapeTooltipHtml`, `Components/Charts/Utils/ReactEChartsCore`, `Components/Charts/Utils/ThemeColor`, `Components/Charts/Utils/TimeFormatter`, `Components/Colors/Colors`, `Components/DataTable/DataTable`, `Components/DataTable/Paginator`, `Components/DataTable/ProportionBar`, `Components/Dialog/Dialog`, `Components/Dialog/Drawer`, `Components/Dialog/modal.types`, `Components/Facets/FacetCount`, `Components/Facets/FacetCountsCaption`, `Components/Facets/FacetInnerLightButton`, `Components/Facets/FacetLabel`, `Components/Facets/FacetList`, `Components/Facets/FacetListCard`, `Components/Facets/FacetResetLink`, `Components/Facets/Variants/DateRangeFacet`, `Components/Facets/Variants/MultipleChoiceFacet`, `Components/Facets/Variants/nestedValues`, `Components/Facets/Variants/PerformanceFacet`, `Components/Facets/Variants/SingleChoiceFacet`, `Components/Formatter/bodyLimits`, `Components/Formatter/BodyNotice`, `Components/Formatter/CodeFormatter`, `Components/Formatter/HeadersDisplay`, `Components/Formatter/JsonTreeView`, `Components/Formatter/PerformanceMetrics`, `Components/Formatter/SyntaxHighlighter`, `Components/Formatter/syntaxTheme`, `Components/Formatter/useCodeHighlighting`, `Components/Formatter/useVirtualization`, `Components/Formatter/VirtualizedCodeView`, `Components/Inputs/Checkbox/Checkbox`, `Components/Inputs/choiceInput`, `Components/Inputs/DateRangeSelector/DateRangeSelector`, `Components/Inputs/Field/Field`, `Components/Inputs/Field/useField`, `Components/Inputs/Input/Input`, `Components/Inputs/InputAddon/InputAddon`, `Components/Inputs/InputButton/InputButton`, `Components/Inputs/InputIcon/InputIcon`, `Components/Inputs/KeyboardShortcut/KeyboardShortcut`, `Components/Inputs/Radio/Radio`, `Components/Inputs/SearchInput/SearchInput`, `Components/Inputs/Sliders/RangeSlider`, `Components/Inputs/Textarea/Textarea`, `Components/Layouts/DefaultLayout`, `Components/NavBar/Assets/defaultAvatar`, `Components/NavBar/NavBar`, `Components/Tabs/Tabs`, `Components/Toast/Toast`, `Components/Toast/ToastContainer`, `Components/Toast/ToastContext`, `Components/Typography/HeadingLevel`, `Components/Typography/Paragraphs`, `Components/Typography/Section`, `Components/Typography/Titles`, `Components/Utilities/Foldable`, `Components/Utilities/useClickOutside`, `Elements/Http/CacheBadge`, `Elements/Http/CacheIndicator`, `Elements/Http/RequestMethodBadge`, `Elements/Http/ResponseStatusBadge`, `Elements/System/CircuitBreakerStatus`, `Elements/System/EndpointNode`, `Elements/System/EntrypointNode`, `Elements/System/NetworkEdges`, `Elements/System/NetworkMap`, `Elements/System/NetworkNode`, `Elements/System/ProxyNode`, `Elements/Tpdex/TpdexBadge`, `Elements/Transactions/TransactionFiltersCard`, `Elements/Transactions/TransactionsExplorerSidebar`, `Elements/Transactions/TransactionsFiltersSidebar`, `Models/Filters/active`, `Models/Filters/dates`, `Models/Filters/read`, `Models/Filters/types`, `Models/Http/body`, `Models/Http/contentDisposition`, `Models/Http/dataUrl`, `Models/Http/headers`, `Models/Http/percent`, `Models/Http/requestTarget`, `Models/System/types`, `Models/Tpdex`, `Models/Transactions/encoding`, `Models/Transactions/endpoints`, `Models/Transactions/facets`, `Models/Transactions/filtering`, `Models/Transactions/Overview`, `Models/Transactions/types`, `Pages/Alerts/AlertsPage`, `Pages/Explorer/ExplorerPage`, `Pages/Overview/OverviewPage`, `Pages/Overview/Sections/Components/TransactionsHistoryView`, `Pages/Overview/Sections/HistorySection`, `Pages/Overview/Sections/SummarySection`, `Pages/SystemPage/SystemPage`, `Pages/Transactions/Detail/Components/DownloadButton`, `Pages/Transactions/Detail/Components/TransactionMessage`, `Pages/Transactions/Detail/Components/TransactionMetadata`, `Pages/Transactions/Detail/TransactionsDetailPage`, `Pages/Transactions/Detail/Utils`, `Pages/Transactions/Detail/Utils/BodyPreview`, `Pages/Transactions/Detail/Utils/ContentRenderer`, `Pages/Transactions/List/TransactionsListPage`, `Pages/Transactions/List/useClientSideTransactions`. ([#5](https://github.com/msqd/lydia/issues/5))
- The demo application is no longer part of the public API. Removed root exports `NavigationProvider`, `useRouteProps`, `renderRouteComponent`, `useNavigation` and the types `NavigationRoute` and `NavigationState`, and the subpaths `./Config/navigation`, `./Hooks/useNavigation`, `./Components/Navigation`, `./Components/Navigation/NavigationProvider` and `./Pages/Transactions/Filters`: no replacement, wire your own routes. `TransactionsFiltersSidebar` and `TransactionsFiltersSidebarProps` are no longer exported from `./Pages/Transactions`: import them from `@msqd/lydia` or `@msqd/lydia/Elements/Transactions`. The `*.samples` modules are no longer published. ([#8](https://github.com/msqd/lydia/issues/8))
- `useGlobalClickOutside` is removed, and `useClickOutside` now takes an options object: `useClickOutside({ onClickOutside, enabled, ignore })`, with `ignore` an explicit list of refs and selectors. It no longer ignores dialogs, menus and portals by itself, so list the ones your element opens, and it listens only while `enabled`. The `@msqd/lydia/Components/Utilities/useGlobalClickOutside` subpath is gone. `TransactionsListPage` no longer clears its selection on a click outside, and `onTransactionSelect` is never called with `null`. Pass `selectedId` (`null` for none) and clear it where you close the drawer that shows the transaction, from its `onClose`; without `selectedId` the page keeps its own selection, which only another row click changes. ([#9](https://github.com/msqd/lydia/issues/9))
- The date and disabled styles of `Input.css` no longer apply to every `input[type="date"]`, `input:disabled` and `div:has(> input:disabled)` of the host app, and no longer use `!important`: they sit in `@layer components` and target Lydia's own inputs (`Input`, `Checkbox`, `Radio`, `SearchInput`, `RangeSlider`). `Input` and `RangeSlider` no longer import their CSS from TypeScript: import `@msqd/lydia/components.css` or `@msqd/lydia/styles`, or their date and range styles are missing. The fonts moved from `dist/fonts` to `dist/css/fonts`. ([#12](https://github.com/msqd/lydia/issues/12))
- `PerformanceData` loses `highlightingTime` and `formattingTime`, and `PerformanceMetrics` no longer displays timings: they measured the time since mount, not the work done. `tokenStyles` leaves `syntaxTheme`, and `SyntaxHighlighter` drops its `showLineNumbers` prop and renders inline tokens without a wrapper `div` or inline colours: token colours come from `prism.css` alone, which now carries the GitHub light palette `tokenStyles` used and no longer styles `language-*` wrappers. `useCodeHighlighting(content, language)` returns `{ formattedContent, lines, highlightLine }` instead of `{ formattedContent, highlightedAST, isHighlighted }` and takes no options, and `VirtualizedCodeView` takes `lines` and `highlightLine` instead of `content` and `highlightedAST`. `useVirtualization` no longer returns `containerRef`. ([#13](https://github.com/msqd/lydia/issues/13))
- `ContentRendererProps.content` and `DownloadButtonProps.data` are typed `HttpBody` (`string | Record<string, unknown> | unknown[]`, exported from `Models/Http/body`) instead of `any`, so a number or boolean no longer compiles. `DownloadButton`'s `mimeType` no longer defaults to `application/octet-stream`: the data URL's own type is used, else `text/plain` for text and `application/json` for parsed documents. `DownloadButton` is now wrapped in a `div`. ([#29](https://github.com/msqd/lydia/issues/29))
- `NavBar` draws only what it is given. `navigation` and `userNavigation` default to `[]` (no demo links, no "Your Profile / Settings / Sign out" menu), `logo` defaults to nothing and `brand` to the text "lydia". `DefaultLogo` and the demo logotype component are removed, and a string `logo` is no longer accepted: pass a `ReactNode`. Pass `navigation`, `userNavigation`, `logo` and `brand` to keep a branded bar. `TransactionsDetailPage` loses `isDrawer`, `onBack`, its built-in `DefaultLayout` and its "Transaction details" title: it renders its sections only, so wrap it in `DefaultLayout` (and its `title`) when it is a page. Drop both props. ([#30](https://github.com/msqd/lydia/issues/30))
- Domain types are closed and `Models` imports nothing from `Components`. `Transaction` and `DetailedTransaction` lose their index signature, so `transaction.anyField` no longer compiles: a consumer that indexes them extends the type (`interface MyRow extends Transaction { extra: string }`) or reads through a cast. `DataTable` takes `TRow extends object` and `types: Record<string, Column<TRow, unknown>>`, and `Column.format` is a method, so a `Column<TRow, number>` still fits. `HttpMessage.body` is `HttpBody` instead of `any`. `BooleanFlagsFilter` and the `"booleanflags"` facet type are removed. `FilterChangeHandler` defaults to `FilterValue` instead of `any`; `Models/Filters` exports `readArray`, `readRange`, `readDates` and `readSingle`, which return a validated value or an empty one, to read a filter value instead of casting it. `FacetOption` lives in `Models/Filters` and `BadgeColor` is no longer imported by `Models/System`, whose status colors are typed `StatusTone`; the old `Components` export paths remain. `SyntaxHighlighter`'s `ast`, `VirtualizedCodeView`'s `highlightedAST` and `useCodeHighlighting`'s result are typed from refractor's tree (`SyntaxTree`) instead of `any`. ([#32](https://github.com/msqd/lydia/issues/32))
- Dead exports removed, no replacement: the types `ClientType`, `TransactionFilters`, `FilterFacetConfig` and `FilterUrlParams`, the function `getStatusColor`, and `updateFilter` from `useFacetState` (use `handleFilterChange`). Default exports are gone: import `SummaryPerformancesChart`, `SummaryRateChart`, `TransactionsChart`, `CodeFormatter`, `JsonTreeView`, `ToastContainer`, `ExplorerPage` and `OverviewPage` by name. `OverviewPageComponent` is removed in favour of `OverviewPage`. The `Cards` namespace is removed: import `Card` and `StatCard` by name. The model type `CircuitBreakerStatus` is renamed `CircuitBreakerState`, so it no longer clashes with the component of the same name. ([#33](https://github.com/msqd/lydia/issues/33))
- Consumers must install the peers `@headlessui/react` and `echarts` themselves (they no longer come with the package), and the `@msqd/lydia/Pages/Transactions/TransactionFiltersCard` subpath is removed: import `TransactionFiltersCard` from `@msqd/lydia/Elements/Transactions` or the package root. ([#34](https://github.com/msqd/lydia/issues/34))
- `TransactionsListPage` no longer keeps favourite state and renders no star column by default. Pass `favorites` (a `ReadonlySet` of transaction ids) and `onFavoriteChange(id, favorite)` to show the column and own the state. ([#37](https://github.com/msqd/lydia/issues/37))
- `useScrollLock` and the `@msqd/lydia/Components/Utilities/useScrollLock` subpath are removed: `Dialog` and `Drawer` rely on Headless UI's own scroll lock, which leaves the page where it was on close. ([#38](https://github.com/msqd/lydia/issues/38))
- `TransactionsExplorerSidebar` reports a structured `Selection` (`{ type, apiName, segments }`) through `onSelect` instead of a path string and a type string, and its `selectedPath` prop becomes `selected?: Selection | null`. `TreeNode` gains `apiName` and `segments`. `Selection`, `apiOf`, `segmentsOf` and `isUnder` are exported to build and filter on the same endpoint model. ([#39](https://github.com/msqd/lydia/issues/39))
- `Paginator` controls are now `<button type="button">` instead of links, so consumer tests that query the `link` role break. Previous is disabled on the first page, next on the last, and every control is disabled without `setPage`. `pages` defaults to 1 instead of 50. ([#42](https://github.com/msqd/lydia/issues/42))
- `Checkbox` without an `id` prop no longer uses its `name` as the input `id`; it generates a unique one, so checkboxes sharing a `name` no longer share an `id`. Pass `id`, or query by role and name, instead of selecting `#<name>`. ([#51](https://github.com/msqd/lydia/issues/51))
- Rendering `Colors` outside a `ToastProvider` no longer throws, and it no longer converts colours by sniffing `process`: `oklch()` values convert without a canvas. `Colors` no longer copies nor toasts by itself; pass `onCopy`, called with the swatch's hex on click. ([#52](https://github.com/msqd/lydia/issues/52))
- `SummarySection` and `OverviewPage` no longer link to `/transactions` by default, nor print "24h" in the pane titles and average labels. Pass `summary.links` (`{ performance?, transactions?, errors? }`, one target per "details" link; a pane without target renders none), `summary.linkComponent` (a `LinkComponentType`, to go through your router) and `summary.windowLabel` (e.g. `"24h"`, shown as the titles' "(24h)" suffix and the "24h average" label) to get them back. ([#54](https://github.com/msqd/lydia/issues/54))
- `Button` now renders `type="button"` unless a `type` prop is passed, so it no longer submits a surrounding `<form>` by default. A consumer relying on a bare `<Button>` to submit must pass `type="submit"`. ([#61](https://github.com/msqd/lydia/issues/61))
- The package is renamed `@msqd/lydia`, published on npm. Every `lydia/...` import becomes `@msqd/lydia/...`, and `lydia/styles` becomes `@msqd/lydia/styles`. The package ships `dist` only, no `src`.

    Consumers that read Lydia's sources must switch:

    - `src/main.css` and the component CSS (`Input.css`, `RangeSliderStyles.css`, `prism.css`) become `@msqd/lydia/theme.css` and `@msqd/lydia/components.css`.
    - Tailwind `@source` points at the package `dist`.
    - Fonts move from `public/fonts` to `dist/fonts`.
- `toEchartsColor` returns `string | undefined`: a colour it cannot convert (malformed `oklch()`, `color-mix()`, `lab()`, `lch()`, `oklab()`, `color()`) is now `undefined` instead of being passed through or producing `NaN`.

### Added

- The README and the integration guide gain a Security section: captured fields are untrusted, the three `ChartTooltipFormatter` methods return HTML, the image and PDF previews need `img-src data:` and `frame-src data:` (plus `font-src data:` for `styles`), and masking credentials in headers and copied URLs is the consumer's job. ([#24](https://github.com/msqd/lydia/issues/24))
- Declarations import each other by relative `.js` paths, so types no longer depend on the `exports` map and consumers on `moduleResolution: "nodenext"` are supported. ([#31](https://github.com/msqd/lydia/issues/31))
- `@msqd/lydia` re-exports every public Component, Element (HTTP and TPDEX badges included), Page and Model, so `import { ... } from "@msqd/lydia"` reaches all of them. Every exported component has a named `<Name>Props` type: `BadgeProps`, `ButtonGroupProps`, `DataTableProps`, `ExplorerPageProps`, `SystemPageProps`, `InputProps`, `CodeFormatterProps`, `JsonTreeViewProps`, `HeadersDisplayProps`, `ToastProviderProps`, `DialogTitleProps`, `DialogDescriptionProps`, `DrawerTitleProps`, `DrawerDescriptionProps`, `DefaultBrandProps`, `HeadingLevelProps`, `SectionProps`, the chart props and the Props of the System and Http Elements. ([#33](https://github.com/msqd/lydia/issues/33))
- Every JS entry of `exports` has a `default` condition after `types` and `import`, and `package.json` gains a `description`, `keywords`, an `author` and `engines.node` `>=24`. ([#56](https://github.com/msqd/lydia/issues/56))
- Integration guide (`docs/integration.md`) for applications consuming `@msqd/lydia`: install, the two CSS options, fonts, theme overrides, local development against a clone with one React, and known pitfalls. Replaces `CSS_USAGE.md`.
- Lydia is published to npm as `@msqd/lydia`. 0.6.0 is published by hand from the CI-built tarball, without provenance; later versions are published from CI when a `v*` tag is pushed, with no stored token and with provenance attestation.
- `--color-chart-out-of-range` theme token, used for out-of-range values of the performance chart instead of a hex literal.
- `@msqd/lydia/theme.css` (fonts and tokens, no Tailwind import) and `@msqd/lydia/components.css`, for a consumer's own Tailwind CSS 4 build. Point `@source` at `@msqd/lydia/dist` so Tailwind scans lydia's classes. `@msqd/lydia/styles` stays precompiled.

### Changed

- Charts register only the ECharts components they draw, so bundles no longer carry the unused title and dataset components. ([#34](https://github.com/msqd/lydia/issues/34))
- Changelog entries are towncrier fragments in `changelog.d/<issue>.<type>.md`, one per PR, instead of edits to `CHANGELOG.md`. `pnpm changelog` writes them into the release section.
- Harden npm publishing: the publish job (OIDC, `npm` environment) only publishes a tarball packed by a job without `id-token`, tags must sit on `main`, manual runs always dry-run, npm is pinned, workflows default to read-only permissions, and `prepublishOnly` builds.
- Harden the workflows: every action is pinned to a commit SHA, the Storybook deploy runs in its own job holding `pages: write` and `id-token: write` while the build gets read-only access, Pages deploys queue instead of running in parallel, and the publish job checks the tarball sha256 and package name before `npm publish`.
- Relicensed under the Mozilla Public License 2.0; `LICENSE` now holds only the MPL text (the Lato font keeps its OFL in `public/fonts/OFL.txt` in the repository, `dist/fonts/OFL.txt` in the package), and `package.json` declares `MPL-2.0`.
- The range slider's styles are plain CSS instead of `@apply`, and component CSS no longer carries a copy of Tailwind. `dist` no longer holds test declarations.
- Transactions pane of the overview summary now draws with the `--color-chart-transactions` theme token instead of a hex literal.

### Fixed

- The "reset" button of `FacetListCard` and the "reset all" link of `TransactionsFiltersSidebar` are hidden when the only bounds set are empty, such as an empty date range. ([#7](https://github.com/msqd/lydia/issues/7))
- `@msqd/lydia/theme.css`, `components.css` and `styles` work without workarounds: the Lato fonts load from the package by relative URL (nothing to copy to `public/fonts`), `components.css` makes Tailwind scan Lydia's components (no `@source` in the app), and the declarations carry no CSS import. ([#12](https://github.com/msqd/lydia/issues/12))
- `CodeFormatter` highlights bodies of any length, drawing and highlighting only the lines in view, instead of showing plain text above 50 lines. A body is split into lines once, scrolling is handled by a single subscription, `ContentRenderer` serializes a JSON body once, and `showLineNumbers` numbers every line, highlighted or not. ([#13](https://github.com/msqd/lydia/issues/13))
- Chart tooltips HTML-escape every name and value they interpolate, so a captured request path used as a tooltip name no longer injects markup. `TransactionsListPage` and `TransactionMetadata` no longer throw on a request target that is not a valid URL, such as `//[x`, and show the path and query as captured instead of the parser-normalised form. `splitRequestTarget` is exported from `@msqd/lydia/Models`. ([#28](https://github.com/msqd/lydia/issues/28))
- `ContentRenderer` no longer crashes on a binary body that arrives as a parsed object, shows "Empty body" for an empty one, and previews a PDF only for the exact `application/pdf` media type and a `data:application/pdf` URL, in a frame that sends no referrer. The `Content-Disposition` filename is parsed in linear time and now handles `filename*` (RFC 5987) and escaped quotes; control characters and path separators are stripped. `DownloadButton` decodes any data URL (base64 or percent-encoded, commas in the payload), keeps its media type, releases the object URL after a delay, and shows a failure as an alert under the button instead of throwing. ([#29](https://github.com/msqd/lydia/issues/29))
- `NavBar` user menu items, desktop and mobile, now go through `linkComponent` and receive their `onClick`, so a `Sign out` item runs its handler and a router link no longer reloads the page. `NavigationItem.onClick` is typed as a mouse event handler, and `linkComponent` is typed by the new exported `LinkComponentType`. ([#30](https://github.com/msqd/lydia/issues/30))
- `DataTable` keys rows by `rowKey` (default `id`), so a stateful cell stays with its row across pages, sorts and filters instead of its position. The transaction date filter and `DateRangeSelector`'s `disablePastDates` / `disableFutureDates` use local calendar days in every time zone, and an invalid date is no bound. New `parseLocalDay` and `localToday` helpers in `Models/Filters`. ([#37](https://github.com/msqd/lydia/issues/37))
- `Tabs` changes panel from its small-screen dropdown when uncontrolled, and the dropdown is no longer inside a `tablist`. Closing a `Drawer` or `Dialog` returns the page to where the user was, including a `Dialog` opened over a `Drawer`. `Dialog`, `Drawer` and `Foldable` use the Headless UI v2 named parts and transition props. ([#38](https://github.com/msqd/lydia/issues/38))
- The explorer tree counts and lists the right transactions: transactions without an `apiName` appear under the `unknown-api` node with their count, a query string or host no longer becomes a tree node, and `/api/user` no longer counts `/api/users/…`. `TransactionsExplorerSidebar` expands and collapses on its own when `expandedNodes` is not given, and `onToggleExpand` alone reports the changes. ([#39](https://github.com/msqd/lydia/issues/39))
- Form fields generate their own ids: `Input` and `Textarea` link their label, help text, corner hint and error without any id passed, joining every description (and the consumer's own `aria-describedby`) in `aria-describedby` and marking themselves invalid for `variant="error"` or an error message; two `SearchInput`s no longer share `id="search"`; `DateRangeSelector` always shows and announces its start-after-end error, with or without a label, and groups its two inputs under that label. ([#41](https://github.com/msqd/lydia/issues/41))
- `Paginator` summary reads "Showing 0 to 0 of 0 results" for an empty list and clamps the last figure to `total`, and its controls no longer jump to the top of the page. ([#42](https://github.com/msqd/lydia/issues/42))
- `Radio` no longer throws when its `id` prop is passed or cleared after the first render. `Checkbox` labels its own input on first render and keeps `indeterminate` and the container click when given a `ref`, object or callback. ([#51](https://github.com/msqd/lydia/issues/51))
- The detail drawer shows the tags of the selected transaction instead of those of the first one opened. ([#55](https://github.com/msqd/lydia/issues/55))
- A minified or very large body no longer freezes the transaction detail drawer: bodies over 100 KB are shown as plain text, JSON over 2 MB is not reformatted, and a body over 2 MB opens collapsed on a 64 KB preview with "Show all" and a download. Highlighting is painted after the drawer opens. ([#57](https://github.com/msqd/lydia/issues/57))
- `DataTable` renders `0` and `false` as text and a plain object as its JSON, drawing "-" only for `undefined`, `null` and `""`; a column missing from `types` is skipped with a `console.error` instead of throwing. ([#62](https://github.com/msqd/lydia/issues/62))
- `PerformanceFacet` shows its reset link whenever the `tpdex` filter has a `min` or `max`, `0` included, and draws a threshold between two marks on the next mark at or below it. A `max` that sat between marks, such as `96`, no longer drew the left thumb at the track start. ([#63](https://github.com/msqd/lydia/issues/63))
- AlertsPage renders no stray "0" for an alert without transactions, starts each alert's transactions list with no search, filter or page carried over, and its drawer description counts the transactions it lists. ([#64](https://github.com/msqd/lydia/issues/64))
- A body nested thousands of levels deep shows a notice in the transaction detail instead of unmounting the page. ([#111](https://github.com/msqd/lydia/issues/111))
- The explorer sidebar builds its API tree in time linear in the number of path segments, instead of seconds for thousands of ID-bearing paths. ([#112](https://github.com/msqd/lydia/issues/112))
- Rendering and filtering the explorer sidebar no longer fail on a request path of thousands of segments: segments past the 64th fold into one leaf. ([#120](https://github.com/msqd/lydia/issues/120))
- Charts render under Node ESM and vitest: the CommonJS `echarts-for-react` default import is unwrapped. Declarations no longer import `.css` files, so a consumer on `skipLibCheck: false` without `vite/client` types compiles. The README `ResponseStatusBadge` example uses `statusCode`, and the consumer check type-checks the README examples.
- The PrismJS theme carries its MIT notice, kept in `@msqd/lydia/styles`. CSS imports survive bundler tree shaking (`sideEffects`), `@msqd/lydia/package.json` is exported, and the integration guide, fonts README and ADR 3 match the package.
- The packed library no longer imports build-machine absolute paths (`date-fns`, `refractor`) nor the extensionless `echarts-for-react/lib/core`: every dependency and its subpaths stays an external import, and `@msqd/lydia` and `@msqd/lydia/Components/Charts` load under Node ESM and vitest. The consumer check now imports every JS export under Node and renders the root and a chart under vitest + jsdom.
- `toEchartsColor` converts `oklch()` strictly: hue in `turn`, `rad` and `grad` is converted, lightness, chroma and alpha are clamped, and an unparseable value, `color-mix()`, `lab()`, `lch()`, `oklab()` or `color()` gives `undefined` (ECharts palette) instead of `NaN`. The theme observer re-resolves chart colours only when a stylesheet or a theme attribute changes, not on any `<head>` mutation.
- `toEchartsColor` rejects a long malformed `oklch()` number in linear time instead of stalling for seconds.


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

[0.6.0]: https://github.com/msqd/lydia/releases/tag/v0.6.0
