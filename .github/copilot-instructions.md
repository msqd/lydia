## Overview

The Lydia  Project is a component library built with React, TypeScript, and Vite. It is designed to be used by multiple
API observability projects: HARP Proxy, ApiLab, ... as the frontend base.


## Project Structure

The project uses `pnpm` for dependencies and scripts, avoid using `npm`, `npx`, `yarn`, etc.  Do not use commands like
`cd /path/to/project/` since we are already in the project directory.

Avoid using commands that would require permissions or interactions from the user, when possible. Storybook runs in
the background, never use commands to start it, just ensures it builds.

* Run storybook tests: `pnpm test:storybook <name>` (omit name to test all stories)
* Run unit tests: `pnpm test <name>` (omit name to test all)
* Build storybooks: `pnpm storybook`
* Build library: `pnpm build`
* Check linting and formating: `pnpm check`
* Check types: `pnpm types`

Always prefer scoped test runs/updates so that it does not conflict with other changes. Do not ignore "act(...)" warnings.

When giving feedback to the user after a task is completed, always stay short and succint. A few lines bullet points is
enough.


## Language

Always answer in english, never use french. All code, comments, texts, documentation and other human texts should be in
english. This is very important!

Write clear, concise, and well-documented code. All code and comments should be in English, never in French. Do not
write comments if they only paraphrase the code. Comments should only explain complex and non-obvious behaviours or
choices. Otherwise, omit the comment.

Use strict TypeScript for type safety and better developer experience, but do not add implicit types.
Don't repeat yourself, you're not allowed to copypaste code from functions to modify it, it should be factored.

Each change should be focused and address a single concern or feature at a time. Suggest next steps if there are
multiple things to do. Every time you add, edit, change a component, update the associated tests and storybooks.

Include snapshot tests when testing component rendering. You can update snapshots using the "-u" flag for vitest.

When writing components, always have html and dom standards in mind, along with accessibility. Use semantic HTML
elements and ARIA attributes when necessary. If possible, let the user override properties of the underlying standard
dom element by passing the props and extending the correct ComponentProps type.


## React Components

Write simple and isolated components. Use functional components and hooks. Avoid class components. Each component
should have one responsibility and only one. Avoid complex components that do too many things at once. If a component 
is too complex, break it down into smaller components.

Write storybooks for components. Each component should have its own storybook file, with examples. Write unit tests for
components and utility functions. Use Vitest and React Testing Library.

In the `Components` folder, we should find user interface elements (buttons, inputs, etc.) that should not contain any
data fetching/updating logic. These components should be pure and stateless. They should only receive props and render
the user interface.


## Styling & TailwindCSS

Components are styled using TailwindCSS 4 (Tailwind4, TailwindCSS4). You should use CSS variables for colors, etc.
The configuration file `tailwind.config.css` is not used anymore in TailwindCSS4; now, configuration of the theme uses
css directives. You can find the configuration in `src/main.css`.

To be able to use `@apply` in css files, you only need to `@import "@/main.css";`.


## Repository

The project use git for version control. Each commit should be atomic and commit messages should follow Conventional
Commits. When writing commit messages, look at the indexed changes in git and do not include references to Copilot,
Claude or other AI agents.
