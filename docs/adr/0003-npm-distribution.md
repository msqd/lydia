# 3. Lydia is distributed on npm as `@msqd/lydia`

Date: 2026-10-19. Status: accepted.

## Context

A consumer used lydia from git: a private submodule plus `link:`. That costs a CI deploy key, no CI on
fork PRs and workarounds for a duplicated React. harp is the next consumer.

## Decision

### Package

Published on npm as `@msqd/lydia`, public. The scope is free and the `msqd` org exists. The rename
from `lydia` is breaking: every `lydia/...` import becomes `@msqd/lydia/...`.

The internal alias follows the name, `@msqd/lydia` and `@msqd/lydia/*` to `src/`. tsc keeps path
aliases in the emitted `.d.ts` and leaves relative imports extensionless, so
`scripts/relativize-declaration-imports.mjs` rewrites every specifier in `dist/**/*.d.ts` to a relative
path ending in `.js`. The declarations then resolve under `bundler` and `nodenext` without depending on
`package.json#exports`.

The tarball holds `dist` and nothing else. The build emits no declaration for `*.test.ts` and no
module for `*.test-d.*` or `*.samples.*`; `src` is not shipped. The library holds components, not a
demo app: sample data lives for Storybook and tests only.

### CSS

Tailwind CSS 4 stays. Two ways to consume it:

| Consumer | Import | Result |
|---|---|---|
| No Tailwind 4 build | `@msqd/lydia/styles` | Precompiled: Tailwind, theme, components, fonts |
| Own Tailwind 4 build | `@msqd/lydia/theme.css`, `@msqd/lydia/components.css`, `@source` on `@msqd/lydia/dist` | Lydia's tokens and classes inside the consumer's single Tailwind |

- `theme.css` holds the fonts and `@theme static`, with no `@import "tailwindcss"`. `main.css`
  (Tailwind plus theme) only feeds the precompiled build and Storybook.
- Component CSS is plain CSS on theme variables. It has no `@import` of Tailwind or `main.css`, and
  no `@apply`. `@reference` was tried first: referencing a file the consumer also imports turns its
  theme into reference-only, and the tokens are no longer emitted.
- `@source` points at `dist`: the JS is minified, identifiers are mangled, but class literals survive, and Tailwind skips
  `node_modules` unless told.
- `dist/css` mirrors the layout of the CSS sources under `src`, so the relative imports hold.

### Peer range

`react` and `react-dom` stay `^19.1.0`. harp upgrades from React 18 on its side first.

## Consequences

- A consumer needs Tailwind `^4.1` to use the sources; `styles` needs nothing.
- CI packs the tarball and builds a fresh Vite, React 19 and Tailwind 4 app from it: type-check,
  render, one Tailwind in the output, one React.
- Fonts are still referenced as `/fonts/...`, served by the consumer; `dist/fonts` holds the files.
- Publishing itself and the integration guide (`docs/integration.md`) follow this decision.
