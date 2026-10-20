# Component taxonomy

What is a Page, a Section, an Element, a Component? Lydia has all four, but the line between
them has blurred. This is the one obvious answer, so a given piece of UI has exactly one home.

All four tiers are **presentation only** — they render from their props and never fetch data.
That rule is the [presentation boundary](./presentation-boundary.md); this document is about
*where a component lives*, not *whether it holds logic* (it never does).

## The four tiers

From smallest to largest. Composition only ever flows **downward** — a tier composes the tiers
below it, never a sibling or a tier above.

| Tier | Lives in | Knows about the product? | Is a whole screen? | Example |
| --- | --- | --- | --- | --- |
| **Component** | `Components/` | No — domain-agnostic | No | `Button`, `Badge`, `DataTable`, `Dialog`, `TransactionsChart` |
| **Element** | `Elements/` | Yes — domain-aware | No | `NetworkMap`, `TransactionsFiltersSidebar`, `CircuitBreakerStatus` |
| **Section** | `Pages/<Page>/Sections/` | Yes | No — a region of one screen | `SummarySection`, `HistorySection` |
| **Page** | `Pages/` | Yes | Yes — a route | `OverviewPage`, `AlertsPage`, `TransactionsListPage` |

A **Layout** (`Components/Layouts/`, e.g. `DefaultLayout`) is the chrome — nav bar plus a content
frame — that a Page is rendered *into*. It is a Component: domain-agnostic, it takes the page as
`children`.

### Component — the domain-agnostic building block
Knows nothing about API observability. It would make just as much sense in an unrelated product.
Reusable everywhere. If you renamed "transaction" to "widget" across the product and this
component didn't care, it's a Component. Charts, tables, inputs, badges, typography, dialogs.

### Element — the domain-aware block
Understands the product's concepts (transactions, system topology, facets) but is **not** a whole
screen — it's a self-contained piece a Page or Section drops in. Composed from Components. If it
speaks the domain but you could place several of them on one screen, it's an Element.

### Section — a region of one Page
A labelled band of a single screen (the "summary" band, the "history" band). It composes
Components and Elements into one coherent block, and takes its data as props from its Page. A
Section belongs to exactly one Page and lives under it (`Pages/<Page>/Sections/`). If it were
reusable across pages, it would be an Element instead.

### Page — a whole screen
A route. Composes Sections, Elements and Components into a complete view, and receives all its
data as props (the consuming application fetches and passes it in — see the presentation
boundary). A Page is the top of the ladder; nothing composes a Page except the router/consumer.

## Where does X live? — the decision

1. **Is it a whole screen / route?** → **Page** (`Pages/`).
2. **Is it a region that only makes sense inside one Page?** → **Section** (`Pages/<Page>/Sections/`).
3. **Does it speak the domain (transactions, system, facets) but isn't a screen, and could appear
   in more than one place?** → **Element** (`Elements/`).
4. **Is it domain-agnostic — reusable in any product?** → **Component** (`Components/`).

Data always arrives by props; if you reached for a fetch or a query, you're on the wrong side of
the [presentation boundary](./presentation-boundary.md), not choosing a tier.

## Conventions that keep the ladder clean

- **One home per intent.** A given piece of UI is a Component *or* an Element *or* a Section *or*
  a Page — never two. When unsure between Element and Section, ask "is it tied to one screen?"
  (Section) or "could it appear on several?" (Element).
- **No page-local `Components/` folders.** Sub-parts of a Page/Section that aren't reusable are
  just co-located files under that Page/Section — they don't get a `Components/` sub-folder that
  competes with the top-level `Components/`. If a "page-local component" turns out to be reusable,
  promote it to a real `Component` or `Element`; if it's domain-agnostic, it was a `Component` all
  along.
- **Composition flows down only.** Page → Section → Element → Component. A Component never imports
  an Element; an Element never imports a Section or Page.
- **Sample/mock data is not part of a tier.** It lives in a co-located `*.samples.ts` (excluded
  from the build and the published exports), consumed by stories, tests and the demo — never baked
  into the component. See `AlertsPage.samples.ts`.

## Known gaps (the target we are converging on)

The current tree does not yet fully follow the above. These are being aligned incrementally:

- **`Sections/` is only formalized in `Overview`.** Other pages compose their regions inline. As
  pages are cleaned up, recurring regions become named Sections under their Page.
- **Page-local `Components/` folders exist** (`Overview/Sections/Components/`,
  `Transactions/Detail/Components/`). These are being flattened (co-located files) or promoted to
  real `Elements`/`Components` when reusable.
- **Some domain presentation still lives under `Pages/…/Components/`** (e.g. transaction request/
  response views) while equivalent domain blocks live in `Elements/`. Domain-aware, reusable
  blocks belong in `Elements/`.
