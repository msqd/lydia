# Contributing

Contributions are welcome. By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report security vulnerabilities as described in [SECURITY.md](SECURITY.md), never in a public issue.

Lydia is a React, TypeScript and Vite component library, shared as the frontend base of several API observability projects. Open an issue before a large change.

## Prerequisites

- Node.js, at the version in [`.nvmrc`](.nvmrc).
- [pnpm](https://pnpm.io). Use it for dependencies and scripts; do not use `npm`, `npx` or `yarn`.
- Playwright's Chromium, for the story tests, once per machine: `pnpm exec playwright install chromium`, then `pnpm exec playwright install-deps chromium` (system libraries, needs root).
- [`uv`](https://docs.astral.sh/uv/), only to build the changelog with `pnpm changelog` (see [RELEASING.md](RELEASING.md)).

Install with `pnpm install --frozen-lockfile`.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm test <name>` | Unit tests; omit the name to run them all. It builds the library first (`pretest`). |
| `pnpm test:storybook <name>` | Story tests in a browser; omit the name to run them all. |
| `pnpm test:all` | Unit and story tests. |
| `pnpm test:update` | Update the unit snapshots. |
| `pnpm storybook` | Build Storybook. Check that it builds; the development server is `pnpm dev`. |
| `pnpm build` | Build the library. |
| `pnpm check` | Lint and format `src/`, **rewriting files** (`biome check --write`), then type-check. |
| `pnpm check-ci` | The same lint and format check without rewriting. |
| `pnpm types` | Type-check. |
| `make qa` | Types, lint, all tests, and both builds. |

Prefer scoped runs (`pnpm test Button`) so that you do not touch unrelated work. Do not ignore `act(...)` warnings.

## Language

Everything is in English: code, comments, documentation, commits, issues and pull requests.

## Code

- Write clear code in strict TypeScript, without implicit types. Comment only what is complex or non-obvious, never what the code already says.
- Do not copy code to modify it: factor it.
- Keep each change focused on one concern. Suggest next steps instead of folding them in.
- Components are simple, isolated, functional, with hooks and no class components, and have one responsibility. Split a component that does too much.
- `Components` holds user interface elements: pure and stateless, no data fetching or updating. They receive props and render.
- Follow HTML and DOM standards and accessibility: semantic elements, ARIA attributes where needed. Extend the matching `ComponentProps` type so that users can override the underlying element's props.
- Styling uses Tailwind CSS 4 with CSS variables for colors. The theme is configured with CSS directives in `src/main.css`, not in a `tailwind.config` file. To use `@apply` in a CSS file, `@import "@/main.css";`.

## Tests and stories

Every added or changed component updates its tests and its stories. Each component has its own story file with examples. Write unit tests with Vitest and React Testing Library, and snapshot tests when testing rendering (update them with `pnpm test:update`).

## Commits and pull requests

- Commits are atomic and follow [Conventional Commits](https://www.conventionalcommits.org).
- A pull request that changes `src/` adds one changelog fragment, `changelog.d/<issue>.<type>.md`, instead of editing `CHANGELOG.md`; see [RELEASING.md](RELEASING.md). A pull request that needs none carries the `no-changelog` label.
- Open the pull request against `main`, and fill in its template.

### Features from other projects

A feature pull request that arrives without a Ready issue gets one before acceptance. When its behavior has more than one state, the issue carries a state table and the maintainers validate a Storybook mockup before implementation goes further. Acceptance testing verifies a decided behavior; it does not design one.

An ADR merges with the code that implements it, in the same pull request or after it, never ahead of a feature that has not passed acceptance testing.

## Licensing

Lydia is licensed under the [Mozilla Public License 2.0](LICENSE). Your contribution is licensed under the same terms (inbound = outbound).

Lydia takes no code or design from Tailwind UI / Tailwind Plus. Components are written here; do not contribute anything derived from them.
