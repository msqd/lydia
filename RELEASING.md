# Releasing

## Changelog fragments

Every PR that changes `src/` adds one file, `changelog.d/<issue>.<type>.md`, instead of editing `CHANGELOG.md`.

- `<type>` is `breaking`, `added`, `changed` or `fixed`: the sections of `CHANGELOG.md`.
- The content is the entry text, without the leading `- `. It may span several lines.
- The issue number becomes a link to the issue. For a change with no issue, use `+<slug>.<type>.md`: the entry gets no link.
- CI fails a PR that changes `src/` without a new fragment. A PR that needs none carries the `no-changelog` label.

## Prerequisites

[`uv`](https://docs.astral.sh/uv/): the changelog is built with `uvx towncrier`, no Python install needed.

## Steps

1. Branch `release-<version>` from an up-to-date `main`.
2. Set `version` in `package.json`.
3. Run `pnpm changelog`. It reads the version from `package.json`, writes the section into `CHANGELOG.md` and deletes the fragments. Check the result.
4. Commit as `chore(release): <version>` and open a PR into `main`.
5. Once merged, tag the merge commit: `git tag v<version>` and `git push origin v<version>`.
6. Publish the GitHub release for the tag, with the new `CHANGELOG.md` section as notes: `gh release create v<version> --notes-file <file>`.

## Publishing to npm

[`publish.yml`](.github/workflows/publish.yml) publishes `@msqd/lydia` on every `v*` tag, through npm trusted publishing (GitHub OIDC): no token is stored, provenance is automatic.

1. `check-tag` fails unless the tag is `v<version>` from `package.json` and its commit is an ancestor of `origin/main`.
2. `gates` runs the test workflow.
3. `build` has no `id-token`: it installs, builds, packs and uploads the tarball. If the version is already on npm, the publish is skipped.
4. `publish` runs under the `npm` environment (a required reviewer approves it) with `id-token: write`. It checks out nothing, installs nothing and builds nothing: it downloads the tarball, checks its version against the tag, and runs `npm publish <tarball> --access public` with an exact pinned npm (`NPM_VERSION`, trusted publishing needs >= 11.5.1).

Run manually (`workflow_dispatch`), on any ref, it stops after `build` with `npm publish --dry-run`: nothing is published.

Prerequisites, set once in the GitHub repository settings:

- The repository is public. npm does not generate provenance for private repositories.
- An environment named `npm`, with a required reviewer.
- A ruleset on `v*` tags that only admins can create, update or delete.
- Default workflow permissions set to read.

`prepublishOnly` runs `pnpm build`, so a publish by hand never ships a stale `dist/`. `pnpm pack` and `npm publish <tarball>` do not run it: CI builds once.

npm only lets you configure a trusted publisher on a package that already exists, so the first release is manual, in this order:

1. Release 0.5.0 through steps 1 to 4 (merged release PR).
2. From a checkout of the release commit on `main`, run `pnpm install --frozen-lockfile && npm publish --access public` (`prepublishOnly` builds), with 2FA.
3. Push the tag (step 5). Its run sees the version on npm and skips the publish, green. Then step 6.
4. On npmjs.com, in the package settings, add a trusted publisher: GitHub Actions, organization/user `msqd`, repository `lydia`, workflow file `publish.yml`, environment `npm`. A new configuration must complete its first successful publish within 2 days, so do it shortly before the next release.
5. From then on, pushing the tag publishes the package once the `npm` environment is approved. Step 6 stays.
