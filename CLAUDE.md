# Capivara Rica — notes for Claude

Free, open-source browser life-sim that teaches Brazilian teens compound interest, credit
cards, parcelamento and career investment. Read `docs/DESIGN.md` first; the research behind every
number is in `docs/research/`.

## Hard rules
- Every economic number lives in `data/<country>/*.json` with `value`, `unit`, `asOf`, `source`,
  `status`. Never put a rate, price or wage in code or in a Svelte file.
- `src/engine` is pure TypeScript: no DOM, no UI imports, no `Math.random` (use `rng.ts`
  streams so the ghost sees the same luck), integer centavos only.
- Each event needs logic in `src/engine/events.ts` **and** text in `content/pt-BR/events.json`;
  the `content coverage` test enforces it. Choice tags `capivara` / `capivara2` tell the ghost what to pick.
- No accounts, analytics, ads, purchases, loot boxes or chat. The audience includes children
  under 12; the legal strategy is to collect nothing (see `docs/PRIVACY.md`).
- Credit must never read as a power-up. Costs are shown in reais, with the 100% legal cap modelled.
- The UI store (`src/lib/game.svelte.ts`) clones the engine object after each mutation. Always
  clone the object the engine just mutated, never `this.state`.
- **Saved games survive updates.** Any change to `GameState` (a field added, renamed or removed)
  bumps `CURRENT_SAVE_VERSION` in `src/engine/migrate.ts`, adds a step there that turns the
  previous shape into the new one (fill defaults, rename), and runs `npm run save:fixture` to
  write `src/engine/fixtures/save-v<N>.json`. Older fixtures are never regenerated. The
  migration test replays every fixture and compares its shape to a fresh game, so a new field
  without a step fails CI instead of a player's phone. The storage key is unversioned; the
  version lives inside the save.

## Commands
`npm run check` (svelte-check), `npm test` (vitest), `npm run data:check`, `npm run build`,
`npm run size`. All five must pass before pushing. `npm run data:check -- --release` is the
release gate and fails while any parameter is `memory`/`placeholder`.
Accessibility, in CI and runnable locally with a Chromium: `VITE_E2E=1 npm run build && npm run a11y`
(axe, WCAG 2.x A + AA, every screen, light and dark, through `window.__game`) and
`npm run build && npm run lighthouse` (score floors in `lighthouserc.cjs`). After the same E2E build,
`npm run save:smoke` plays three months, checks the save landed in IndexedDB, drops the
localStorage copy, reloads and resumes, and fails unless the resumed game equals the saved one. In the cloud sandbox
set `PW_CHROMIUM_PATH` and `CHROME_PATH` to the preinstalled browser binary. axe covers only the
automated subset of WCAG; keyboard order and focus visibility are checked by hand. Text colour
tokens in `src/app.css` were chosen to pass 4.5:1 on `--surface-2`, the tightest background.

## Infrastructure
The site is Cloudflare Workers static assets: `wrangler.jsonc` owns the Worker, the asset
directory and the custom domains (wrangler creates their DNS records). Zone settings and the
typo-domain redirect are Terraform in `infrastructure/terraform/cloudflare/` (provider v5
schema; validate with `terraform validate` before pushing). `.github/workflows/deploy.yml`
runs on pushes to main only, as one job inside the `production` GitHub Environment (restricted
to main, required reviewer = the owner, so each push needs one approval): Terraform apply, then
`wrangler deploy`. Pull requests never get Cloudflare credentials; the job stops early with a
clear message if any secret is missing. Third-party actions are pinned to commit
SHAs (Renovate keeps them current); keep it that way in a public repo. Never create a Worker, a
Pages project or DNS records by hand; Cloudflare's dashboard calls Pages "legacy".

## Dependencies and the merge gate
Renovate policy is modelled on justinharringa/knuckles: the `description` block at the top of
`renovate.json` is the rule (nothing may turn "update available" into "no PR"; auto-merge only
where a PR check exercises the bump; `rebaseWhen: auto`, never a ruleset with "require branches
to be up to date"). `ci.yml` ends in one job named `CI gate` that `needs:` every other job and
runs `if: always()`; it is the only status check the `main` ruleset requires
(`docs/rulesets/main.json`, imported by hand, see `docs/rulesets/README.md`). Keep that name.
No workflow other than `ci.yml` may trigger on `pull_request` or `push`. `engines.node` in `package.json` names the same major as `.nvmrc` (CI and the deploy run that version), and a step in the `check` job fails if they differ; on a Node major, raise both in the same PR. The merge gate and the
deploy gate are different things: a merge to main only queues a `Deploy` run that waits for the
owner's approval. To triage open Renovate PRs, run `/renovate-triage`
(`.claude/skills/renovate-triage/SKILL.md`); the Dependency Dashboard is issue #4.

## Verifying in a browser
Playwright and Chromium are available in the cloud sandbox. `window.__game` exposes the store
for automated play-throughs; the drivers used so far live outside the repo (scratchpad).
