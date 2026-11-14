---
name: renovate-triage
description: Triage the open Renovate / dependency PRs for capivara-rica from evidence, not titles. Classify each by merge posture, read the upstream notes, require `CI gate` green on the current head, merge what passes the LOW RISK rubric (squash, pinned to the reviewed head), then verify the push-to-main run and tell the owner which deploy is waiting for approval. Merging here is not a deploy; the `production` environment approval is. Works from a cloud session (GitHub MCP connector plus Playwright), attended or unattended. Use when asked to triage, review or clear dependency PRs or the Dependency Dashboard (#4), or when the Daily Renovate Triage routine reaches this repo.
---

# Renovate Triage: capivara-rica

A Svelte 5 + Vite static site, deployed as Cloudflare Workers static assets
with a small Terraform stack for the zone. Background: `CLAUDE.md`
(Infrastructure), `docs/rulesets/README.md` (what gates a merge) and the
`description` block at the top of `renovate.json` (the policy).

## The path to production: merge, then approve, then deploy

```
PR merged to main ──▶ deploy.yml run WAITS for the owner's approval
   (production environment) ──▶ terraform plan + apply ──▶ npm build
   ──▶ wrangler deploy ──▶ capivararica.com.br
```

- **Merging a PR is not a deploy.** Nothing reaches Cloudflare until the owner
  approves the `Deploy` run. Triage never approves a deployment: that is the
  owner's click, in the GitHub UI, and there is no tool for it here.
- **But a merge queues a deploy.** `deploy.yml` has
  `concurrency: deploy-production`, so several merges leave one run waiting,
  for the newest commit. Tell the owner what is waiting and what it contains.
- **Two things apply on merge once approved**: the Terraform provider version
  (`applies-on-merge` label) and `cloudflare/wrangler-action`. Both are manual
  by `renovate.json`; see Phase 1.

## What gates a PR, and what does not

`ci.yml` runs on every PR, and the `main` ruleset requires its `CI gate` job
(`docs/rulesets/README.md`). The ruleset is imported and active (id 26781158,
checked 2026-11-09), and the repo allows auto-merge, so Renovate's automerge
rules do merge on their own. **Check `CI gate` yourself anyway** before any
merge you make: a ruleset can be switched off in Settings without a trace in
Git.

| Job | Covers |
|---|---|
| `check` | `npm run check` (svelte-check), `npm test` (vitest, incl. the content-coverage and save-migration tests), `npm run data:check`, a production build, `npm run size` (bundle budget), `npm run ceilings` (fails once a `renovate.json` ceiling's reason is gone) |
| `a11y` | Playwright's Chromium plays an E2E build from the start screen to the end screen, auditing every screen with axe in light and dark; then `npm run save:smoke` on the same build (a game saved through idb-keyval survives a reload and resumes unchanged); then Lighthouse score floors on the production build |
| `renovate-validate` | `renovate-config-validator --strict` on `renovate.json` |
| `terraform-validate` | `fmt -check` and `validate` with the backend disabled: schema only, no plan |
| `CI gate` | needs all of the above, `if: always()` |

Not covered by any PR check:
- **saves from an older release.** `npm run save:smoke` proves a save written
  and read by the *same* build survives a reload, through idb-keyval (it drops
  the localStorage copy first, because `src/lib/save.ts` writes one and
  swallows storage errors). Older save shapes are the migration test's job
  (`src/engine/migrate.test.ts`, in `check`), which runs without a browser;
- **the Terraform plan against the live zone.** It runs in the deploy, after
  approval;
- **`cloudflare/wrangler-action`.** It appears only in `deploy.yml`.

## Preflight: what can this session reach?

Run once, before Phase 0. It prints nothing but `preflight ok` when every URL
answers. A URL that does not is an **environment gap**, not a property of any PR.

```bash
bad=0
for u in https://capivararica.com.br/ \
         https://raw.githubusercontent.com/ \
         https://api.github.com/; do
  c=$(curl -sS -m 12 -o /dev/null -w '%{http_code}' "$u" 2>/dev/null) || true
  case "$c" in 2??|3??|4??) ;; *) echo "UNREACHABLE ($c) $u"; bad=1 ;; esac
done
[ "$bad" = 0 ] && echo "preflight ok"
```

`UNREACHABLE (000)` means the egress allow list refuses the host, or it is down:
a timeout looks the same. Any HTTP status, including 403 or 404, means the host
answered. Probe the path the skill needs, not the site root (a root can fail
while the path works). **curl and WebFetch resolve differently:** on 2026-11-14
WebFetch failed with `ENOTFOUND` for `tailscale.com` while curl returned 200, so
when WebFetch fails for a host, try curl before calling the notes unreachable.

## What counts as new (notifications)

The routine has no memory of earlier runs, so "new" has to come from dates
GitHub itself keeps. Never use `updated_at`: Renovate rebases, Cloudflare and CI
bot comments, and PR-body refreshes all move it without anything changing.

- Consider only PRs authored by `renovate[bot]` or `dependabot[bot]`. The owner's
  and Claude's own PRs are not dependency triage.
- **New** = `created_at` within the last 36 hours. **Head changed** = the
  committer date of the PR's last commit (`pull_request_read` `get_commits`)
  within the last 36 hours. Use 36, not 24, so one late or skipped run does not
  lose a PR; a PR may then appear twice, which is acceptable.
- Judge a PR on the run that sees its checks finished. A PR whose checks are
  still pending is neither held nor new: leave it for the next run.
- **Parked** = the `blocked-upstream` label, or the owner's newest comment says it
  is held. A parked PR is news only if its diff grew beyond the dependency's own
  files, or its checks went from green to red. A Renovate rebase is not news.
- **Blocker cleared** is news only if the event that cleared it (a release, a
  merged PR) is dated inside the window. If it cleared earlier, it appears once
  in the Monday digest as `unblocked: <repo>#<n>`, not daily.
- **On Mondays (UTC)** add a digest, and leave it out when both lists are empty:
  `held >7 days:` bot PRs that need the owner and are not parked, aged from
  `created_at` or the owner's newest comment, whichever is later (ignore bot
  activity and rebases); and `new this week:` bot PRs created or head-changed in
  the last 7 days that need the owner, so a lost day costs at most a week.
- **An environment gap** is notified only when it changed a decision this run (notes
  unreachable so a PR was held, a smoke step that could not run). Otherwise it
  appears only in the Monday digest.

## Phase 0: Inventory

Connector first (`mcp__github__*`); `gh` porcelain is not available in a
cloud session and `gh api` is for search only.

- `list_pull_requests` (owner `justinharringa`, repo `capivara-rica`, state
  `open`), fields `number,title,user,labels,head,updated_at`
- `issue_read` #4: the Dependency Dashboard (Rate-Limited, Pending Approval,
  Open)

**Do not filter on the `renovate` label.** Security PRs from
`vulnerabilityAlerts` carry `security` alone. There is no *Pending
Approval* section: `dependencyDashboardApproval` is off. TypeScript 7 produces
no PR and no Dashboard entry at all, because `renovate.json` holds TypeScript
below 7 with an `allowedVersions` ceiling. Its lifter is `npm run ceilings` in
the `check` job, which fails the moment svelte-check's peer range admits
TypeScript 7. **A red `ceilings` step is that signal, not a fault in the PR it
appears on:** the owner lifts the ceiling, and every PR stays red until then.

## Phase 1: Classify

Decide the bucket **before** reading the diff. The bucket sets what you may do.

| Bucket | Recognise by | Triage does |
|---|---|---|
| **Renovate auto-merges** | `npm dev dependencies` minor/patch; `GitHub Actions` minor/patch/digest | Normally merged already. If still open more than a day after `CI gate` went green, find out why (auto-merge not allowed on the repo? ruleset missing? a red job?) and report |
| **Ask first** | any **major** (`major-update` label: Node.js, Svelte, Vite, vitest, svelte-check, any action); `Cloudflare Terraform provider` (applies on merge); `wrangler-action (deploy)`; anything that edits `wrangler.jsonc`, `deploy.yml` or `public/_headers` | Gather the evidence below, then notify. Do not merge |
| **Candidate LOW RISK** | `idb-keyval` minor/patch; `security` PRs on a non-major; a `npm dev dependencies` pin or lock-file PR; an auto-merge PR whose only problem was the merge transport | Apply the rubric |

A Node major deserves one extra line in the notification: `.nvmrc` is read by
both `ci.yml` and `deploy.yml`, so a green `check` already proves the build on
the new Node, but it is still the environment every deploy will build on.

## Phase 2: Read the notes

**A PR with no release notes has not been reviewed yet.** In order, stopping
at the first that answers:

1. The PR body (Renovate attaches notes for most npm packages).
2. WebFetch of `https://github.com/<owner>/<repo>/releases/tag/<tag>`.
   Svelte: `sveltejs/svelte` (`svelte@<v>`); Vite: `vitejs/vite` (`v<v>`,
   notes in `packages/vite/CHANGELOG.md`); vitest: `vitest-dev/vitest`;
   svelte-check: `sveltejs/language-tools` (`svelte-check-<v>`);
   vite-plugin-pwa: `vite-pwa/vite-plugin-pwa`; idb-keyval: `jakearchibald/idb-keyval`.
3. Anonymous `curl -s https://api.github.com/repos/<owner>/<repo>/releases/tags/<tag>`
   (rate-limited; a 403 means move on).
4. Node: `https://nodejs.org/en/blog/release/v<major>.<minor>.<patch>`.
5. Cloudflare provider: `cloudflare/terraform-provider-cloudflare` releases;
   look for resource renames, attribute changes and `cloudflare_ruleset`,
   `cloudflare_dns_record` or `cloudflare_zone_setting` entries, the three
   resource types `infrastructure/terraform/cloudflare/main.tf` uses.

The connector's release tools refuse repos outside this session; upstreams are
public, so WebFetch/curl is the route. **"Notes not read" is not an outcome.**
If every route fails, report "notes unreachable" and name each route tried.

Look for: breaking, removed, a minimum Node bump, a Svelte 5 runes behaviour
change, a Vite config-shape change, a changed service-worker default
(`vite-plugin-pwa`). Then check whether the code uses the item:
`grep -rn '<symbol>' src/ vite.config.ts svelte.config.js`.

## Phase 3: LOW RISK rubric

Merge only if **every** line holds. Otherwise ask or hold, and name the line
that failed.

- [ ] Bucket is *Candidate LOW RISK*
- [ ] Notes read (Phase 2), nothing breaking that the code uses, shown by grep
- [ ] `CI gate` is **SUCCESS on the current head SHA**
      (`pull_request_read` method `get_check_runs`). Pending is not success
- [ ] Files touched are only `package.json`, `package-lock.json`, `.nvmrc`, or
      version strings and SHAs in `.github/workflows/*.yml`, and they match
      the title
- [ ] One commit, authored by Renovate; no hand edits on the branch
- [ ] `main`'s latest push run of `CI` is green
      (`actions_list` method `list_workflow_runs`, branch `main`)
- [ ] **For `idb-keyval` or anything touching the save path:** the `a11y`
      job's `Save and reload` step passed on the PR's head (it is part of
      `CI gate`, so a green gate implies it; open the job to confirm the step
      ran rather than being skipped). To rerun it in the sandbox:
      `npm ci && VITE_E2E=1 npm run build && PW_CHROMIUM_PATH=<chromium> npm run save:smoke`

Merge (squash; every Renovate PR here is one commit): `merge_pull_request`
with `merge_method: "squash"` and `expectedHeadSha: <the head you reviewed>`.
Merge one PR at a time and run Phase 4a before the next: two npm PRs merged
together conflict in `package-lock.json`.

## Phase 4a: Verify a merge (minutes later)

A merge triggers `CI` on `main` and a `Deploy` run that waits for approval.

1. `CI` on the merge commit must be green: `actions_list`, workflow `ci.yml`,
   branch `main`, event `push`.
2. The `Deploy` run shows `waiting`. Do not try to approve it. Tell the owner,
   in one line: what the waiting deploy contains and whether it is just the
   merged PR or several.

A red `main` run after a merge means notify, with the run ID. Do not "fix
forward" from triage.

## Phase 4b: Verify a deploy (after the owner approves)

Run this when the owner says a deploy went out, or when `Deploy` on `main`
has a `success` conclusion newer than your last check.

```bash
curl -sSI https://capivararica.com.br/ | grep -i 'HTTP/\|content-security-policy\|cf-cache-status'
curl -sSI https://www.capivararica.com.br/ | grep -i 'HTTP/'
curl -sSI 'https://capivarica.com.br/jogar?x=1' | grep -i 'HTTP/\|location'   # 301 to the primary host
```

Healthy: `200` on both hosts with the strict CSP from `public/_headers`;
`301` from the typo domain keeping path and query. Then a headless check in
Chromium (Playwright is installed in the sandbox): the page loads with no
console errors other than the known Cloudflare `beacon.min.js` CSP violation
(injected by Cloudflare Web Analytics until it is disabled in the dashboard;
if that line is gone, say so, it means the owner turned it off), the service
worker registers at `/`, and `manifest.webmanifest` is served. `window.__game`
is **not** exposed in the production build (DEV or `VITE_E2E=1` only), so a
play-through needs the sandbox build above, not the live site.

For a deploy that included the Cloudflare provider or `wrangler-action`, also
read the run's **Terraform plan** summary: a provider-only bump should say
`No changes`.

## Unattended (routine) mode

The Daily Renovate Triage routine runs this skill with nobody watching, from
the parent of the repo clones, so neither this file nor `CLAUDE.md` is
auto-loaded; the routine prompt points here. It has the GitHub connector,
`gh api` (REST only: `gh` porcelain fails with `GraphQL is not available from
Claude Code sessions`), the sandbox's preinstalled Playwright and Chromium
(`/opt/pw-browsers/chromium`), npm, and no owner on hand. Differences from an
attended run:

- **Auto-merge PRs are not yours.** `npm dev dependencies` minor/patch and
  `GitHub Actions` minor/patch/digest merge themselves through GitHub native
  auto-merge once `CI gate` passes. Skip them. Report one only if it is still
  open more than a day after `CI gate` went green, with the reason (auto-merge
  not enabled on the PR, the ruleset disabled, a red job).
- **Merge only *Candidate LOW RISK* PRs that pass every line of Phase 3, one at
  a time,** with Phase 4a after each.
- **`idb-keyval` is a normal candidate.** Its save-path line is met by the
  `a11y` job's `Save and reload` step, which is inside `CI gate`. Never
  improvise a different browser driver in its place: if that step did not
  run, hold the PR.
- **A red `ceilings` step** (see Phase 0) is notified once, on the day it
  first appears, as the TypeScript ceiling being ready to lift. It holds every
  PR, including the auto-merge ones, until the owner acts.
- **Phase 4b runs when there is something new to verify:** a `Deploy` run on
  `main` that completed `success` in the last 24 hours and whose commits
  include a Renovate merge. Find the commits by comparing it with the previous
  successful run:

  ```bash
  R=justinharringa/capivara-rica
  gh api "repos/$R/actions/workflows/deploy.yml/runs?branch=main&status=success&per_page=2" \
    --jq '.workflow_runs[] | "\(.id) \(.head_sha) \(.updated_at)"'
  gh api repos/$R/compare/<previous-sha>...<newest-sha> \
    --jq '.commits[] | "\(.author.login // .commit.author.name) \(.commit.message | split("\n")[0])"'
  ```

  A Renovate merge is a commit authored by `renovate[bot]` (squash-merged, so
  one commit per PR). The curl checks and the headless load run as written. Report the result; it
  is notified only on failure.
- **A failed `Deploy` run is the owner's, not triage's.** The owner approved
  it and saw it fail. Mention it in the notification only when its commits
  include a Renovate merge (a provider bump failing `Terraform apply`, a
  `wrangler-action` bump failing the deploy step), naming the run, the failed
  step and the PR. Otherwise it goes in the report. On 2026-11-09 run
  42540865774 failed at `Terraform apply` on #17, a hand-written PR: report
  only.

**May do:** read anything; build and run the site in the sandbox; run the
Phase 4b checks against production; merge PRs that pass every line of Phase 3.

**Never:**
- approve a deployment or a `production` environment review, or re-run,
  cancel or dispatch `Deploy`: the approval is always the owner's click
- push commits, push tags, re-run workflows, or comment on, close or edit PRs
- touch Cloudflare or Terraform state directly
- tick Dependency Dashboard boxes (`renovate.json` REBASE POLICY: never
  "rebase all")
- merge anything Ask first, or anything with `CI gate` red or pending.
  Never merge on the reasoning "the failure is unrelated"

**Notify (one line per item, inside the routine's single notification), only
when:**
1. **A `Deploy` run is waiting for approval because of a merge this run
   made**: the run, and what it contains (just that PR, or several commits).
   The owner has to click for the merge to reach players at all.
2. A PR needs the owner: Ask first, or held because its own
   change broke a check. Notify on the first run that sees it as needing the owner, or when its head changes (see *What counts as new*). A PR that is merely still held stays out of
   the notification.
3. `main` CI went red after a merge (Phase 4a), with the run ID.
4. Phase 4b failed on a deploy that carried a Renovate merge.
5. The `ceilings` step turned red (once, on the first day).
6. A `security`-labelled PR merged but its `Deploy` run has waited for approval
   more than 7 days: the fix is not live.

Everything else is silent: auto-merged PRs, merged LOW RISK PRs whose checks
passed, routine holds, a waiting deploy this run did not cause. Message shape:
`capivara-rica: <action needed> — #<n> <title>: <one-line evidence>`.

See *What counts as new* for the Monday digest and for environment gaps.

## Known false alarms

| Observation | Why it's fine |
|---|---|
| A Cloudflare `beacon.min.js` CSP violation in the console on production | Injected by Cloudflare Web Analytics until it is disabled in the dashboard (Phase 4b). If it disappears, say so: it means the owner turned it off |
| Renovate PRs closed as "autoclosed" (#7, #8, #13) | Renovate closes a PR whose update was superseded or regrouped; the newer PR carries it |
| A `Deploy` run that never ran for a merge | `concurrency: deploy-production` keeps only the newest waiting run, so an older waiting run is cancelled when a newer merge queues |
