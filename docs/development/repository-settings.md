# Repository settings

The settings behind the release gate live in GitHub, not in the code. This page is their reviewed record: the commands that create them, a read-only check, and the rulesets exported as JSON in [`.github/rulesets/`](../../.github/rulesets). It is referenced from the "Before the first tag" checklist of [RELEASING.md](../../RELEASING.md#before-the-first-tag).

Only a repository admin runs the commands, once, by hand. They need `gh` authenticated as an admin, with the `admin:org` scope for the organisation setting. Applying them is tracked in [#21](https://github.com/msqd/lydia/issues/21); this page only records them.

Some settings (the `npm` environment's required reviewer, secret scanning, push protection) may be refused while the repository is private on the Team plan. Run the command without the refused key, and redo it once the repository is public.

## The `npm` environment

No admin bypass, deployments from `v*` tags only. `prevent_self_review` stays `false` while there is one maintainer, or no release can be approved. User id `30586` is `hartym`, the maintainer.

```sh
gh api -X PUT repos/msqd/lydia/environments/npm --input - <<'JSON'
{"reviewers":[{"type":"User","id":30586}],"prevent_self_review":false,"can_admins_bypass":false,"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON
gh api -X POST repos/msqd/lydia/environments/npm/deployment-branch-policies -f name='v*' -f type=tag
```

While the repository is private, GitHub refuses `reviewers` ("Please ensure the billing plan supports the required reviewers protection rule") and refuses `prevent_self_review` without a reviewer. Leave both out:

```sh
gh api -X PUT repos/msqd/lydia/environments/npm --input - <<'JSON'
{"can_admins_bypass":false,"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON
```

Run the first block's PUT again when the repository goes public (#21 step 3) to add the reviewer.

## Rulesets

Both are exported, as returned by `gh api repos/msqd/lydia/rulesets/<id>`, in [`.github/rulesets/`](../../.github/rulesets). The exports are a record, not an input: they hold read-only fields (`id`, timestamps, `_links`, `current_user_can_bypass`). Apply the commands below.

### Release tags

[`release-tags.json`](../../.github/rulesets/release-tags.json). Only the admin role (actor id `5`) creates, moves or deletes `v*` tags.

```sh
gh api -X POST repos/msqd/lydia/rulesets --input - <<'JSON'
{"name":"release tags","target":"tag","enforcement":"active","conditions":{"ref_name":{"include":["refs/tags/v*"],"exclude":[]}},"rules":[{"type":"creation"},{"type":"update"},{"type":"deletion"}],"bypass_actors":[{"actor_id":5,"actor_type":"RepositoryRole","bypass_mode":"always"}]}
JSON
```

### Default branch

[`main.json`](../../.github/rulesets/main.json). A pull request is required, the checks `Run Tests` and `Changelog fragment` must pass, no force push, no deletion. A `Changelog fragment` job skipped by the `no-changelog` label reports success. There is no bypass actor.

```sh
gh api -X POST repos/msqd/lydia/rulesets --input - <<'JSON'
{"name":"main","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":false,"require_code_owner_review":false,"require_last_push_approval":false,"required_review_thread_resolution":false}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":false,"required_status_checks":[{"context":"Run Tests"},{"context":"Changelog fragment"}]}}]}
JSON
```

To change a ruleset, `PUT repos/msqd/lydia/rulesets/<id>` with the new body, then refresh its export in the same pull request.

## Actions policy

Selected actions only, SHA pinning required. GitHub-owned actions, `pnpm/action-setup` and `zizmorcore/zizmor-action` are allowed: add a pattern here when a workflow needs another action.

```sh
gh api -X PUT repos/msqd/lydia/actions/permissions -F enabled=true -f allowed_actions=selected -F sha_pinning_required=true
gh api -X PUT repos/msqd/lydia/actions/permissions/selected-actions -F github_owned_allowed=true -F verified_allowed=false -f 'patterns_allowed[]=pnpm/action-setup@*' -f 'patterns_allowed[]=zizmorcore/zizmor-action@*'
```

## Security features

Dependabot alerts, then secret scanning with push protection.

```sh
gh api -X PUT repos/msqd/lydia/vulnerability-alerts
gh api -X PATCH repos/msqd/lydia -f 'security_and_analysis[secret_scanning][status]=enabled' -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'
```

Two-factor authentication is required for the organisation, in the web UI only: github.com/organizations/msqd/settings/security, "Require two-factor authentication". Members without it are removed from the organisation, so first check that this prints nothing:

```sh
gh api 'orgs/msqd/members?filter=2fa_disabled' -q '.[].login'
```

## Merge settings

Squash merges only, branches deleted on merge, description and topics set.

```sh
gh api -X PATCH repos/msqd/lydia -F allow_merge_commit=false -F allow_rebase_merge=false -F allow_squash_merge=true -F delete_branch_on_merge=true -f description='React component library for API observability UIs'
gh api -X PUT repos/msqd/lydia/topics -f 'names[]=react' -f 'names[]=component-library' -f 'names[]=api-observability' -f 'names[]=tailwindcss' -f 'names[]=typescript'
```

## Verify

Read-only: every command only reads. Each prints the value in the last column once all the settings above are applied.

| Setting | Command | Expected |
| --- | --- | --- |
| Environments | `gh api repos/msqd/lydia/environments --jq '[.environments[].name]'` | `["github-pages","npm"]` |
| `npm` protection | `gh api repos/msqd/lydia/environments/npm --jq '{bypass: .can_admins_bypass, rules: [.protection_rules[].type]}'` | `{"bypass":false,"rules":["required_reviewers","branch_policy"]}`; `["branch_policy"]` only, until the reviewer is added at the flip (#21 step 3) |
| `npm` deployments | `gh api repos/msqd/lydia/environments/npm/deployment-branch-policies --jq '[.branch_policies[] \| {name, type}]'` | `[{"name":"v*","type":"tag"}]` |
| Rulesets | `gh api repos/msqd/lydia/rulesets --jq '[.[] \| {name, target, enforcement}]'` | `main` (`branch`) and `release tags` (`tag`), both `active` |
| Actions policy | `gh api repos/msqd/lydia/actions/permissions --jq '{enabled, allowed_actions, sha_pinning_required}'` | `{"enabled":true,"allowed_actions":"selected","sha_pinning_required":true}` |
| Allowed actions | `gh api repos/msqd/lydia/actions/permissions/selected-actions` | `github_owned_allowed` `true`, `verified_allowed` `false`, `patterns_allowed` `["pnpm/action-setup@*","zizmorcore/zizmor-action@*"]` |
| Dependabot alerts | `gh api repos/msqd/lydia/vulnerability-alerts --silent && echo enabled` | `enabled` (a 404 means off) |
| Secret scanning | `gh api repos/msqd/lydia --jq '.security_and_analysis \| {scan: .secret_scanning.status, push: .secret_scanning_push_protection.status}'` | `{"scan":"enabled","push":"enabled"}` |
| Organisation 2FA | `gh api orgs/msqd --jq .two_factor_requirement_enabled` | `true` |
| Merge settings | `gh api repos/msqd/lydia --jq '{allow_merge_commit, allow_rebase_merge, allow_squash_merge, delete_branch_on_merge}'` | `{"allow_merge_commit":false,"allow_rebase_merge":false,"allow_squash_merge":true,"delete_branch_on_merge":true}` |
| Topics | `gh api repos/msqd/lydia/topics --jq .names` | the five topics above |

Compare a ruleset with its export, ids and timestamps aside:

```sh
gh api repos/msqd/lydia/rulesets/<id> | jq 'del(.id, .node_id, .created_at, .updated_at, ._links, .current_user_can_bypass)' | diff - <(jq 'del(.id, .node_id, .created_at, .updated_at, ._links, .current_user_can_bypass)' .github/rulesets/<file>.json)
```

No output means no drift. The ids are `25812213` (`release-tags.json`) and `25812214` (`main.json`).
