---
name: renovate-triage
description: Triage the open Renovate / dependency PRs for capivara-rica from evidence, not titles. Classify each by merge posture, read the upstream notes, require `CI gate` green on the current head, merge what passes the LOW RISK rubric (squash, pinned to the reviewed head), then verify the push-to-main run and tell the owner which deploy is waiting for approval. Merging here is not a deploy; the `production` environment approval is. Works from a cloud session (GitHub MCP connector plus Playwright). Use when asked to triage, review or clear dependency PRs or the Dependency Dashboard (#4).
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
(`docs/rulesets/README.md`). If the ruleset has not been imported yet, nothing
on GitHub enforces the checks: **check them yourself either way.**

| Job | Covers |
|---|---|
| `check` | `npm run check` (svelte-check), `npm test` (vitest, incl. the content-coverage test), `npm run data:check`, a production build, `npm run size` (bundle budget) |
| `renovate-validate` | `renovate-config-validator --strict` on `renovate.json` |
| `terraform-validate` | `fmt -check` and `validate` with the backend disabled: schema only, no plan |
| `CI gate` | needs all of the above, `if: always()` |

Not covered by any PR check:
- **the browser.** No Playwright in CI. The save path (`idb-keyval`, the only
  runtime dependency), the service worker (`vite-plugin-pwa`) and the PWA
  manifest are only exercised by a real browser;
- **the Terraform plan against the live zone.** It runs in the deploy, after
  approval;
- **`cloudflare/wrangler-action`.** It appears only in `deploy.yml`.

## Phase 0: Inventory

Connector first (`mcp__github__*`); `gh` porcelain is not available in a
cloud session and `gh api` is for search only.

- `list_pull_requests` (owner `justinharringa`, repo `capivara-rica`, state
  `open`), fields `number,title,user,labels,head,updated_at`
- `issue_read` #4: the Dependency Dashboard (Rate-Limited, Pending Approval,
  Open)

**Do not filter on the `renovate` label.** Security PRs from
`vulnerabilityAlerts` carry `security` alone. Anything under *Pending
Approval* is a TypeScript major waiting for its dashboard checkbox: not a PR,
nothing to do unless the owner says svelte-check supports it.

## Phase 1: Classify

Decide the bucket **before** reading the diff. The bucket sets what you may do.

| Bucket | Recognise by | Triage does |
|---|---|---|
| **Renovate auto-merges** | `npm dev dependencies` minor/patch; `GitHub Actions` minor/patch/digest | Normally merged already. If still open more than a day after `CI gate` went green, find out why (auto-merge not allowed on the repo? ruleset missing? a red job?) and report |
| **Ask first** | any **major** (`major-update` label: Node.js, Svelte, Vite, vitest, svelte-check, any action); `TypeScript (major)`; `Cloudflare Terraform provider` (applies on merge); `wrangler-action (deploy)`; anything that edits `wrangler.jsonc`, `deploy.yml` or `public/_headers` | Gather the evidence below, then notify. Do not merge |
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
- [ ] **For `idb-keyval` or anything touching the save path:** a Playwright
      smoke on the PR's build passed. Build it in the sandbox
      (`npm ci && VITE_E2E=1 npm run build && npx vite preview`), load the
      page in Chromium, start a game, advance one stop with `window.__game`,
      reload, and confirm the save is still there

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
