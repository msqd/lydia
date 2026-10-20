# Presentation boundary

Lydia is a **pure presentation library**. Components render from their props and hold no
data-fetching or application logic. The data layer — HTTP services, query/cache wiring, routing,
application state — lives in the **consuming application**, never in Lydia.

## The rule

- A component that needs remote data **receives it as a prop**. The consumer fetches, Lydia renders.
- No imports of a data/query client (e.g. `@tanstack/react-query`) in presentation code.
- No `fetch()` / HTTP calls, no imports from a `Services/*` layer.
- Container/presentational split: keep the presentational component here; the query-bound
  container belongs to the consumer.

Why: one obvious way to use a component (feed it props), snapshot-testable in isolation, reusable
across consumers, and no hidden coupling to how any one app loads its data.

## Where the line sits

| Layer | Home |
| --- | --- |
| `Components/`, `Elements/` — presentation, props-driven | **Lydia** |
| `Models/**/types` — the prop contracts a component renders | **Lydia** (types only, no logic) |
| Data fetching, query/cache, HTTP services, routing, orchestration | **Consumer** |

## Enforcement

The rule is executable: `src/architecture-boundary.test.ts` scans `Components/` and `Elements/`
and fails on any forbidden import or HTTP call. It runs in the `unit` test project — a regression
that pulls logic back into the presentation layer breaks the build.
