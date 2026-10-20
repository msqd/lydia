Testing Guide
============

This document provides information about the testing setup in the Lydia project.

Test Types
---------

The project uses several types of tests:

1. **Unit Tests**: Using Vitest to test individual functions and components
2. **Component Tests**: Using Storybook Test Runner to test component stories
3. **Browser Tests**: Running the stories themselves in Chromium through Vitest's browser mode

Test Commands
------------

The following test commands are available:

- ``make test`` - Run unit tests
- ``make test-update`` - Run unit tests and update snapshots
- ``make test-storybook`` - Run Storybook tests
- ``make test-all`` - Run all tests (unit and Storybook tests)

Writing Tests
-----------

Unit Tests
~~~~~~~~~~

Unit tests are written using Vitest and React Testing Library. Tests should be placed in a ``__tests__`` directory next to the files being tested or with a ``.test.tsx`` suffix.

.. code-block:: tsx

   // Button.test.tsx
   import { render, screen } from '@testing-library/react';
   import { Button } from './Button';
   import { expect, test } from 'vitest';

   test('renders a button with text', () => {
     render(<Button>Click me</Button>);
     expect(screen.getByText('Click me')).toBeInTheDocument();
   });

Component Tests with Storybook
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Component tests can be written directly in Storybook stories using the ``play`` function:

.. code-block:: tsx

   export const WithInteractionTest: Story = {
     args: {
       children: "Click Me",
       onClick: fn(),
     },
     play: async ({ canvasElement, args }) => {
       const canvas = within(canvasElement);
       const button = canvas.getByText("Click Me");
       
       // Verify button is in the document
       expect(button).toBeInTheDocument();
       
       // Click the button
       await userEvent.click(button);
       
       // Verify onClick was called
       expect(args.onClick).toHaveBeenCalled();
     },
   };

Browser Tests
~~~~~~~~~~~~~

Stories run as tests in a real Chromium browser through Vitest's browser mode, so a story's
``play`` function is its test. Run them with ``pnpm test:storybook``, optionally naming a component.

There is no visual regression or screenshot comparison. Rendering is covered by DOM snapshots in
the unit tests instead.

Commands
--------

- ``pnpm test``: unit tests only (builds the library first)
- ``pnpm test:storybook``: story tests only, in Chromium
- ``pnpm test:all``: unit and story tests; ``make test-all`` is the same
- ``make qa``: types, lint, ``pnpm test:all``, then the Storybook and library builds

Story tests need Playwright's Chromium: ``pnpm exec playwright install chromium`` and, for the system
libraries, ``pnpm exec playwright install-deps chromium``.

Setup in CI
-----------

CI runs the same tests as ``make qa``, so both test types are run:

.. code-block:: yaml

   # Example CI workflow
   - name: Run all tests
     run: make test-all

Test Configuration
----------------

- **Vitest configuration**: ``vitest.config.ts``, which defines both the ``unit`` and ``storybook``
  projects
- **Storybook browser-test setup**: ``.storybook/vitest.setup.ts``

One Vitest configuration runs both projects, so unit tests and story tests share a single runner.
