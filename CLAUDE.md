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

## Commands
`npm run check` (svelte-check), `npm test` (vitest), `npm run data:check`, `npm run build`,
`npm run size`. All five must pass before pushing. `npm run data:check -- --release` is the
release gate and fails while any parameter is `memory`/`placeholder`.

## Infrastructure
The site is Cloudflare Workers static assets: `wrangler.jsonc` owns the Worker, the asset
directory and the custom domains (wrangler creates their DNS records). Zone settings and the
typo-domain redirect are Terraform in `infrastructure/terraform/cloudflare/` (provider v5
schema; validate with `terraform validate` before pushing). `.github/workflows/deploy.yml`
plans on PRs, applies on main, then runs `wrangler deploy` (`versions upload` on PRs); it is
skipped while the repo variable `CLOUDFLARE_ACCOUNT_ID` is unset. Never create a Worker, a
Pages project or DNS records by hand; Cloudflare's dashboard calls Pages "legacy".

## Verifying in a browser
Playwright and Chromium are available in the cloud sandbox. `window.__game` exposes the store
for automated play-throughs; the drivers used so far live outside the repo (scratchpad).
