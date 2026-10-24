# Integrating `@msqd/lydia`

How to consume Lydia from npm in an application, and how to develop against a local clone. Follow it top
to bottom and you get a styled component on screen. The decisions behind it are in
[ADR 3](adr/0003-npm-distribution.md).

## Requirements

| Need | Version | Notes |
| --- | --- | --- |
| `react`, `react-dom` | `^19.1.0` | Peer dependencies. React 18 is not supported: upgrade first. |
| `@headlessui/react` | `^2.2.4` | Peer dependency. One copy shared with your own dialogs, so focus and portals agree. |
| `echarts` | `^6.1.0` | Peer dependency. One copy, not a second ~100 KB gzipped. |
| Node, `pnpm` | current LTS | Lydia is documented with `pnpm`. |
| Tailwind CSS | `^4.1` | Only for option A. Tailwind 3 is not supported. The precompiled path needs no Tailwind. |
| TypeScript | `moduleResolution: "bundler"` or `"nodenext"` | The `.d.ts` files import each other by relative `.js` specifiers, so both resolve them. |
| A bundler | Vite 6+ | Examples use Vite and `@tailwindcss/vite`. Any bundler that handles CSS imports works. |

## 1. Install

```bash
pnpm add @msqd/lydia @headlessui/react echarts
```

A new `react-ts` Vite app already ships React: check that `react` and `react-dom` are `^19.1.0` or newer in
your `package.json`, and upgrade them if not (`pnpm add react@^19.1.0 react-dom@^19.1.0`).

Everything else Lydia needs at runtime (`tailwind-merge`, ...) comes with the package.

## 2. Load the styles

Pick one of two ways. Do not mix them: both carry Tailwind.

### Option A: your own Tailwind 4 build (recommended)

Lydia's tokens and component CSS join your single Tailwind, so you can use Lydia's theme tokens in your own
classes.

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ["react", "react-dom", "@headlessui/react", "echarts", "zrender"] },
});
```

Replace the contents of `src/index.css` with:

```css
/* src/index.css */
@import "tailwindcss";
@import "@msqd/lydia/theme.css";
@import "@msqd/lydia/components.css";
```

```ts
// src/main.tsx
import "./index.css";
```

- `theme.css` holds the fonts and the theme tokens (`@theme static`). It does not import Tailwind.
- `components.css` is plain CSS for the few components that need it (date input, range slider, syntax
  highlighting), written on the theme variables.
- `components.css` also tells Tailwind to scan Lydia's compiled components for class names (an `@source`
  relative to the file itself), so you write no `@source` and no path to `node_modules`, in a monorepo too.
- The fonts are loaded from the package by relative URLs: your bundler emits them with your assets.

### Option B: precompiled stylesheet

No Tailwind in your build. Lydia ships its own compiled Tailwind, theme, component CSS and fonts.

```ts
// src/main.tsx
import "@msqd/lydia/styles";
```

or `@import "@msqd/lydia/styles";` at the top of your CSS. The stylesheet only contains the classes Lydia
itself uses: your own Tailwind classes are not generated. Use option A if you want Tailwind in your own code.

## 3. Fonts

Nothing to do: both options load Lato from the package. Option A resolves the relative `url()` of
`theme.css` through your bundler, which emits the files with your assets; Option B embeds them in the
stylesheet. The licence (SIL OFL) ships in `node_modules/@msqd/lydia/dist/css/fonts/OFL.txt`.

To serve the same family from elsewhere (a CDN, your own file), declare `@font-face` after Lydia's CSS:

```css
@font-face {
  font-family: "Lato";
  src: url("https://cdn.example.com/lato/Lato-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Repeat for weight 700 and the italics. To use another family altogether, redefine `--font-sans`.

## 4. Render a component

```tsx
import { Badge } from "@msqd/lydia/Components/Badges";

export function App() {
  return <Badge color="success">Healthy</Badge>;
}
```

You can import from the root (`@msqd/lydia`), a directory (`@msqd/lydia/Components/Buttons`) or a single
component (`@msqd/lydia/Components/Buttons/Button`). Props and variants are documented in
[Storybook](https://msqd.github.io/lydia/); declarations ship with the package.

`test/consumer/` in the repository is a complete, minimal app doing exactly this. CI builds it from the
packed tarball on every change, so its files are known to work.

## 5. Override the theme

Lydia styles read CSS variables, so retheme by redefining them after Lydia's CSS.

Option A, with Tailwind:

```css
@import "tailwindcss";
@import "@msqd/lydia/theme.css";
@import "@msqd/lydia/components.css";

@theme {
  --color-primary-500: #0f766e;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

Option B, precompiled:

```css
@import "@msqd/lydia/styles";

:root {
  --color-primary-500: #0f766e;
}
```

Tokens you will want:

| Token | Use |
| --- | --- |
| `--color-primary-50` to `-900` | Brand colour: buttons, focus rings, links. |
| `--color-success-*`, `--color-warning-*`, `--color-danger-*` | Status badges, alerts, toasts. |
| `--color-tpdex-*` | One per TPDEX rating. |
| `--color-chart-transactions`, `--color-chart-rest`, `--color-chart-label` | Charts. |
| `--font-sans` | Text font. |

The full list is in `src/theme.css`.

## Develop against a local Lydia

To work on an application and Lydia together, keep the npm version in the application's `package.json` and
point your local install at a Lydia clone. The link is never committed: a lockfile or manifest that points at
your disk breaks CI and everyone else. There is no yalc and no submodule.

### Link

Build Lydia once, in the clone:

```bash
pnpm install
pnpm build
```

In the application:

```bash
pnpm link /path/to/lydia
```

pnpm adds an override (`'@msqd/lydia': link:/path/to/lydia`) to `pnpm-workspace.yaml` and `node_modules/@msqd/lydia`
becomes a symlink to the clone. When `@msqd/lydia` is already a dependency, `package.json` is left untouched
(checked with pnpm 10.34). When it is not, pnpm also adds `"@msqd/lydia": "link:/path/to/lydia"` to
`dependencies`: restore `package.json` too. Equivalent by hand, in `pnpm-workspace.yaml` (or `package.json` under
`pnpm.overrides` for older pnpm):

```yaml
overrides:
  "@msqd/lydia": link:/path/to/lydia
```

Run `pnpm install` after editing it. Do not commit the override or the lockfile changes it causes
(`git restore package.json pnpm-workspace.yaml pnpm-lock.yaml`). To come back to npm, remove the
override and run `pnpm install`.

### The edit loop

The application consumes `dist`, so rebuild Lydia after a change:

```bash
pnpm build
```

Then reload or rebuild the application. A full
`pnpm build` wipes and regenerates `dist`; a running dev server picks the change up on the next request or
after a restart.

### One copy of each UI runtime

The clone has its own `node_modules/react`, and a linked package does not resolve its peers from your
`node_modules` (pnpm warns about it on `pnpm link`: that warning is expected, and is exactly why dedupe is
needed). Lydia's code must use the application's React, never its own: two copies make hooks fail.

`@headlessui/react` and `echarts` are peers for the same reason: a second copy splits focus-trap and portal state, or ships ECharts twice.

`resolve.dedupe: ["react", "react-dom", "@headlessui/react", "echarts", "zrender"]` is **required whenever Lydia is linked**, in every Vite-based
config the application runs: Vite, vitest and Storybook. Do not count on `@vitejs/plugin-react` to set it:
recent versions do not, and a linked clone then fails with `Invalid hook call`.

```ts
// vite.config.ts
resolve: { dedupe: ["react", "react-dom", "@headlessui/react", "echarts", "zrender"] },
```

#### Vitest

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/dom
```

```ts
// vitest.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom", "@headlessui/react", "echarts", "zrender"] },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
});
```

```ts
// vitest.setup.ts
import { vi } from "vitest";

// jsdom has no canvas, and zrender paints on the next frame, after the test: without a context it throws
// "Cannot set properties of null (setting 'dpr')". The context ignores drawing, measures text as empty, and
// returns itself from any call so that gradients accept their colour stops.
const context: object = new Proxy(
  {},
  {
    get: (_target, property) => (property === "measureText" ? () => ({ width: 0 }) : () => context),
    set: () => true,
  },
);
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => context as unknown as CanvasRenderingContext2D);
```

```tsx
// src/App.test.tsx
import { JsonTreeView } from "@msqd/lydia/Components/Formatter/JsonTreeView";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("renders a Lydia component that uses hooks", () => {
  render(<JsonTreeView data={{ hello: "world" }} />);
  expect(screen.getByText(/hello/)).toBeTruthy();
});
```

Without the `dedupe` line this test fails with `Invalid hook call` against a linked clone. Without the setup file, a test that renders a chart passes, then vitest exits 1 on uncaught `TypeError`s from zrender.

#### Storybook

In `.storybook/main.ts`:

```ts
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  // ...
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, { resolve: { dedupe: ["react", "react-dom", "@headlessui/react", "echarts", "zrender"] } }),
};
```

This replaces any alias, `preserveSymlinks` or path workaround for React you needed with a submodule.

#### Check

`pnpm why react` must list one version. In a production build, the React version strings must show a
single version:

```bash
grep -ohE '19\.[0-9]+\.[0-9]+' dist/assets/*.js | sort -u
```

## Security

### Trust model

Every transaction field Lydia renders (URL, headers, bodies, tags, names) comes from captured traffic, so the sender chose it. Lydia renders it as text through React, which escapes it. Two surfaces need your attention.

**HTML-returning helpers.** `formatSplitBarsTooltip`, `formatUnifiedBarsTooltip` and `formatTooltipFromData`, static methods of `ChartTooltipFormatter`, return HTML strings that ECharts writes with `innerHTML`. They escape every value they interpolate. Escape your own values the same way if you write a tooltip formatter of your own.

**URLs.** No exported helper returns a URL. The transaction detail turns an image body into `<img src="data:image/...">` and a PDF body into `<iframe src="data:application/pdf...">`. Links elsewhere (`NavBar`, `Tabs`, `SummarySection`) use the `href` or `to` you pass.

### Content-Security-Policy

Checked in headless Chromium against a built consumer, with `securitypolicyviolation` events collected: the image and PDF previews, a chart tooltip hover and each stylesheet entry. Starting from `default-src 'self'`, Lydia needs:

| Directive | Value | For | Entry |
| --- | --- | --- | --- |
| `img-src` | `data:` | Image body preview | Both |
| `frame-src` | `data:` | PDF body preview | Both |
| `font-src` | `data:` | Lato, embedded as `data:` URIs | `@msqd/lydia/styles` only |

With `theme.css` and `components.css`, your bundler emits the fonts as files served from your own origin, so `font-src 'self'` is enough. Chart tooltips and inline `style` attributes work under `style-src 'self'`: no `'unsafe-inline'` is needed.

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; frame-src data:
```

Add `font-src 'self' data:` to that policy if you import `@msqd/lydia/styles`. Without it the browser blocks the fonts and falls back to a system font.

### Redaction

Lydia shows headers and copies `method + url` as captured. `Authorization`, `Cookie`, `Set-Cookie`, `Proxy-Authorization` and `X-Api-Key` values appear in clear in the headers display, and query-string tokens in the URL appear in the detail and in the clipboard. There is no redaction prop yet: mask these values in the data you pass in.

Report a vulnerability through [SECURITY.md](../SECURITY.md).

## Pitfalls

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Invalid hook call`, or `Cannot read properties of null (reading 'useState')` / `'useContext'` | Two copies of React: Lydia's and the application's (typical with a linked clone, or a monorepo with mixed versions). | `resolve.dedupe: ["react", "react-dom"]` in the Vite, vitest and Storybook configs. Check `pnpm why react` shows one version. |
| Components render unstyled or partly styled, with missing colours, spacing or rings (option A) | `components.css` is not imported, so Tailwind never saw Lydia's class names. | Import `@msqd/lydia/components.css` after `tailwindcss` and `theme.css`. Rebuild. |
| Tokens are missing (`var(--color-primary-500)` undefined) | `theme.css` is not imported, or imported without Tailwind in the same stylesheet. | Import `tailwindcss`, `theme.css` and `components.css` in one CSS entry. |
| Two Tailwinds in the output, resets applied twice | `@msqd/lydia/styles` imported next to your own Tailwind. | Use only one option. |
| `@theme` rejected by the CSS build | Tailwind 3. | Upgrade to Tailwind 4, or use option B. |
| Type or runtime break after `pnpm up` | A release with breaking changes. | Read the `### Breaking` sections of [CHANGELOG.md](../CHANGELOG.md) between your version and the new one before upgrading. |
| Image or PDF body preview stays blank, or Lato does not load, with a CSP violation in the console | The Content-Security-Policy blocks `data:` in `img-src`, `frame-src` or (`@msqd/lydia/styles` only) `font-src`. | Add `img-src data:`, `frame-src data:` and, for `styles`, `font-src data:`, see [Security](#security). |
| A test that renders a chart passes, but vitest exits 1 with `TypeError: Cannot set properties of null (setting 'dpr')` | jsdom has no canvas: zrender paints on the next frame, after the test, on a null context. | Add the `vitest.setup.ts` of [Vitest](#vitest) to `test.setupFiles`. |
| Server-side rendering (`renderToString`) of a page with charts: no error, but the server output carries none of the theme's colours | Charts render on the server. Theme colours are CSS variables, read from the computed style of the document, which only the browser has. | Nothing to fix: the colours resolve on the client, so the chart takes the theme's colours there. Do not rely on them in server output. |
| Changes in the linked clone do not show | `dist` is stale. | `pnpm build` in the clone, then restart the dev server. |

## Upgrading

Lydia is pre-1.0: a minor release may break. Before changing the version range, read the `### Breaking`
sections in [CHANGELOG.md](../CHANGELOG.md) for every release between yours and the target, apply them, then
build and run your tests.
