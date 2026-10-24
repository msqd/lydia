The contributor rules are in [CONTRIBUTING.md](CONTRIBUTING.md). Read it first.

## Tool-specific rules

The project uses `pnpm` for dependencies and scripts, avoid using `npm`, `npx`, `yarn`, etc.  Do not use commands like
`cd /path/to/project/` since we are already in the project directory.

Avoid using commands that would require permissions or interactions from the user, when possible. Storybook runs in
the background, never use commands to start it, just ensures it builds.

Always prefer scoped test runs/updates so that it does not conflict with other changes. Do not ignore "act(...)" warnings.

When giving feedback to the user after a task is completed, always stay short and succint. A few lines bullet points is
enough.

Never include references to Claude, Anthropic or any AI assistant in commit messages, pull request titles or
descriptions, code comments or documentation.
