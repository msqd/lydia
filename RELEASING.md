# Releasing

## Changelog fragments

Every PR that changes `src/` adds one file, `changelog.d/<issue>.<type>.md`, instead of editing `CHANGELOG.md`.

- `<type>` is `breaking`, `added`, `changed` or `fixed`: the sections of `CHANGELOG.md`.
- The content is the entry text, without the leading `- `. It may span several lines.
- The issue number becomes a link to the issue. For a change with no issue, use `+<slug>.<type>.md`: the entry gets no link.
- CI fails a PR that changes `src/` without a new fragment. A PR that needs none carries the `no-changelog` label.

## Prerequisites

[`uv`](https://docs.astral.sh/uv/): the changelog is built with `uvx towncrier`, no Python install needed.

## Push rule

Push only explicit refs: `git push origin <branch>` for PRs, `git push origin v<version>` for the tag; `main` changes only through PRs. Never `--tags`, `--follow-tags`, `--all` or `--mirror`.

## Steps

1. Branch `release-<version>` from an up-to-date `main`.
2. Set `version` in `package.json`. The release PR is the only change that bumps it.
3. Run `pnpm changelog`. It reads the version from `package.json`, writes the section into `CHANGELOG.md`, appends the `[<version>]: …/releases/tag/v<version>` link reference the section heading points to, and deletes the fragments. Check the result.
4. Commit as `chore(release): <version>` and open a PR into `main`.
5. Once merged, tag the squash commit on `main`, not the PR's head: `git tag v<version> <squash-sha>` and `git push origin v<version>`.
6. Publish the GitHub release for the tag, with the new `CHANGELOG.md` section as notes: `pnpm -s release-notes <version> > notes.md`, then `gh release create v<version> --verify-tag --title v<version> --notes-file notes.md`. `pnpm release-notes` prints the section of one version, whichever heading form it has (`## 0.4.0 - …` or `## [x.y.z] - …`).

Storybook deploys from `main` ([`deploy-storybook.yml`](.github/workflows/deploy-storybook.yml)), not from the tag.

## Publishing to npm

[`publish.yml`](.github/workflows/publish.yml) publishes `@msqd/lydia` on every `v*` tag, through npm trusted publishing (GitHub OIDC): no token is stored, provenance is automatic.

1. `check-tag` fails unless the tag is `v<version>` from `package.json` and its commit is an ancestor of `origin/main`.
2. `gates` runs the test workflow.
3. `build` has no `id-token`: it installs, builds and packs. It logs the tarball name and its `sha256`, and uploads the tarball as the `package` artifact. If the version is already on npm, the publish is skipped.
4. `publish` runs under the `npm` environment (a required reviewer approves it) with `id-token: write`. It checks out nothing, installs nothing and builds nothing: it downloads the tarball, checks its sha256, name and version against the build and the tag, and runs `npm publish <tarball> --access public` with the dist-tag `latest`, or `next` for a prerelease version. It then checks that the registry integrity matches the tarball.
5. [`consumer-registry.yml`](.github/workflows/consumer-registry.yml) installs the published version from the registry into the consumer fixture and runs `test/consumer/check.mjs`. It also runs by hand, for a version published by hand: `gh workflow run consumer-registry.yml -f version=<version>`.

Run manually (`workflow_dispatch`), on any ref, the workflow stops after `build` with `npm publish --dry-run`: nothing is published, the tarball is still uploaded.

`prepublishOnly` runs `pnpm build`, so a publish by hand from a checkout never ships a stale `dist/`. `pnpm pack` and `npm publish <tarball>` do not run it: CI builds once. A release is never published from a checkout: the first one below publishes the CI tarball.

## Before the first tag

Each prerequisite, with the command that verifies it:

| Prerequisite | Command | Expected |
| --- | --- | --- |
| The repository is public (npm does not generate provenance for private repositories) | `gh api repos/msqd/lydia --jq .visibility` | `public` |
| An environment named `npm`, with a required reviewer | `gh api repos/msqd/lydia/environments --jq '.environments[] \| select(.name == "npm") \| .protection_rules'` | a `required_reviewers` rule |
| A ruleset on `v*` tags that only admins can create, update or delete | `gh api repos/msqd/lydia/rulesets --jq '.[] \| {name, target, enforcement}'` | a `tag` ruleset, `active` |
| Default workflow permissions set to read | `gh api repos/msqd/lydia/actions/permissions/workflow --jq .default_workflow_permissions` | `read` |
| Actions are enabled | `gh api repos/msqd/lydia/actions/permissions --jq .enabled` | `true` |
| Private vulnerability reporting is on | `gh api repos/msqd/lydia/private-vulnerability-reporting --jq .enabled` | `true` |

Create the `npm` environment before the first tag: a missing environment is created on the fly, with no protection.

## First release (0.6.0)

npm only lets you configure a trusted publisher on a package that already exists, so 0.6.0 is published by hand. It is the tarball CI built, not a build from a checkout. 0.6.0 carries no provenance; later versions do.

1. Check the list above, then merge the release PR (Steps 1 to 4).
2. Dispatch the workflow on the merged `main`: `gh workflow run publish.yml --ref main`. Find the run: `gh run list --workflow publish.yml --limit 1 --json databaseId,headSha`. Its `headSha` is the squash commit.
3. When it is green, read the sha256 the `build` job logged: `gh run view <id> --log | grep 'sha256='`.
4. Download the tarball and compare: `gh run download <id> -n package`, then `sha256sum msqd-lydia-0.6.0.tgz`. The two hashes must be equal.
5. Publish it, with 2FA: `npm publish ./msqd-lydia-0.6.0.tgz --access public --otp <code>`.
6. Tag the squash commit and push only the tag (Steps, 5). Its run sees the version on npm, skips the publish and ends green. Run the registry check: `gh workflow run consumer-registry.yml -f version=0.6.0`.
7. Create the GitHub release (Steps, 6), appending the sha256 and the run URL to the notes.

## After the first publish

1. Add the trusted publisher: `npm trust github @msqd/lydia --file publish.yml --repo msqd/lydia --env npm --allow-publish`. A new configuration must complete its first successful publish within 2 days, so do it shortly before the next release.
2. Check it: `npm trust list @msqd/lydia`.
3. In the package settings on npmjs.com, under Publishing access, choose "Require two-factor authentication and disallow tokens". Without it, any npm account with write access to `@msqd` can publish around every GitHub gate.
4. Revoke every token that could publish: `npm token list`, then `npm token revoke <id>`.

From then on, pushing the tag publishes the package once the `npm` environment is approved. Steps 5 and 6 stay.

## Bad publish

Look at what the registry holds first: `npm view @msqd/lydia time dist-tags`.

- **Broken but harmless.** Publish a patch through the normal steps. Then `npm deprecate @msqd/lydia@<bad> "<reason>, use <good>"`, and if `latest` still points at the bad version, `npm dist-tag add @msqd/lydia@<good> latest`.
- **Malicious code or a leaked secret.** `npm unpublish @msqd/lydia@<bad>` works within 72 hours of the publish; after that, contact npm support. The version number is burned: it can never be published again. Rotate the leaked secret, then publish a patch.
- **Compromised maintainer or publisher.** `npm trust revoke` the publisher (`npm trust list @msqd/lydia` shows it), revoke all tokens (`npm token revoke`), rotate 2FA. Check `npm view @msqd/lydia time` for versions nobody released, and their provenance: a release from this repository shows its workflow run, one published around it shows none. Delete rogue tags (`git push origin :refs/tags/v<version>`; the tag ruleset leaves that to admins) and publish a GitHub security advisory.
- **Storybook regression.** Re-run [`deploy-storybook.yml`](.github/workflows/deploy-storybook.yml) on a good ref (`gh workflow run deploy-storybook.yml --ref <good-ref>`), or revert the change on `main`.
