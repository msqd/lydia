======================
Lydia Documentation
======================

Lydia is a React component library built with TypeScript, TailwindCSS 4 and Vite, shared by
several API observability projects as their frontend base.

**It is a pure presentation library.** Components render from their props and hold no data
fetching, no routing and no application logic. The data layer lives in the consuming application.
That boundary is enforced by ``src/architecture-boundary.test.ts``, which fails the build if an
HTTP call or a data-layer import appears anywhere in the library.

The reference documentation is Storybook, built from the source: every component's props and
examples live beside it. These pages cover what Storybook cannot.

Contents
========

.. toctree::
   :maxdepth: 2
   :caption: Using Lydia

   integration

.. toctree::
   :maxdepth: 2
   :caption: Components

   components/filter-components

.. toctree::
   :maxdepth: 2
   :caption: Development

   development/presentation-boundary
   development/component-taxonomy
   development/testing
   testing/index

.. toctree::
   :maxdepth: 1
   :caption: Decisions

   adr/0001-facets-narrow
   adr/0002-nested-facet-values
   adr/0003-npm-distribution

Key features
============

* **UI components**: badges, buttons, cards, data tables, facets, charts
* **Pages and elements**: composed views for transactions, alerts, system topology and overview
* **TypeScript**: fully typed, with the public surface generated per directory
* **TailwindCSS 4**: configured in ``src/main.css``, with no ``tailwind.config.js``
* **Vite**: library build with per-directory exports

Getting started
===============

.. code-block:: bash

   pnpm install
   pnpm storybook       # build the component documentation
   pnpm test            # unit tests

Import components from the package root, or from a per-directory subpath:

.. code-block:: typescript

   import { Button, Card } from "@msqd/lydia";
   import { InputAddon } from "@msqd/lydia/Components/Inputs/InputAddon";

Data comes from the consuming application and reaches a component through its props. There is no
HTTP client here to import.

License
=======

Mozilla Public License 2.0. The bundled Lato font is under the SIL Open Font License 1.1.
