# Repository rulesets

GitHub stores rulesets in repository settings, not in Git. The JSON here is the
source of truth: edit it here, then re-import it. The layout is copied from
[justinharringa/knuckles](https://github.com/justinharringa/knuckles/tree/main/docs/rulesets).

## `main.json`: keep `main` green

| Rule | Why |
|---|---|
| Require a pull request, 0 approvals | Nothing lands on `main` without CI running first. With one maintainer, a required approval could never be satisfied. |
| Require status check `CI gate` | The only required check. See below. |
| **Not** "require branches to be up to date" | It flips Renovate's `rebaseWhen: auto` to `behind-base-branch` for every PR: every push to main rebases every open PR and re-runs CI for each. |
| Block force-push and deletion | `main` is what `deploy.yml` ships. |
| Bypass: none | Nobody bypasses, the owner included: a merge with the check red, pending or missing is refused by GitHub, not by anyone's judgment. If CI is down and you must merge, temporarily set the ruleset to Disabled in Settings, merge, and re-enable it. The JSON has had no bypass since 2026-11-14; a live ruleset imported earlier still has the admin bypass until it is re-imported. |

This ruleset gates the **merge**. The **deploy** is gated separately by the
`production` GitHub Environment (deployment branch `main`, required reviewer =
the owner), so an auto-merged Renovate PR still needs a human click before it
reaches Cloudflare.

### Why one gate check instead of requiring each job

The required check is the `result` job in `ci.yml`, named `CI gate`. It
`needs:` every other job and runs `if: ${{ always() }}`, so:

- any job that failed or was cancelled fails the gate, including when the whole
  run is cancelled (with `!cancelled()` the gate would be *skipped*, and GitHub
  counts a skipped required check as passing);
- a job added later behind a path filter counts as a pass when skipped;
- a new job only needs adding to the gate's `needs:` list, never to the ruleset.

The ruleset binds the context to the GitHub Actions app (`integration_id`
15368), so no other app can post a `CI gate` status. No workflow other than
`ci.yml` may trigger on `pull_request` or `push`, or it could post one too.

### Known gaps

- **A green PR can still make `main` red.** Two PRs can each pass against an
  older `main` and conflict once both merge. Renovate's auto-merged branches are
  rebased first (`rebaseWhen: auto`), so this only applies to PRs merged by
  hand. The push-to-main `ci.yml` run and the deploy's own build catch it.
- **A GitHub-side scheduling stall shows up as a missing gate, not a red one.**
  A run with `total_count: 0` jobs carries no information about the code:
  `gh api repos/justinharringa/capivara-rica/actions/runs/<id>/jobs --jq .total_count`.
- **The deploy is not gated by the ruleset.** `deploy.yml` runs after merge,
  behind the environment approval, and its Terraform plan runs against live
  state only there.

## Applying it

Order matters: if the ruleset is imported before `CI gate` has ever reported,
every open PR blocks.

1. Confirm `CI gate` shows up and passes on a PR (it comes from `ci.yml`).
2. **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, choose
   `docs/rulesets/main.json`. Or:

   ```bash
   gh api -X POST repos/justinharringa/capivara-rica/rulesets --input docs/rulesets/main.json
   # later: gh api -X PUT repos/justinharringa/capivara-rica/rulesets/<id> --input docs/rulesets/main.json
   ```

3. Check the imported status check is bound to the GitHub Actions app
   (`integration_id` 15368).
4. **Settings → General → Allow auto-merge**: on. Renovate's
   `platformAutomerge: true` enables GitHub native auto-merge on each PR its
   rules allow, and GitHub merges once `CI gate` passes.

   ```bash
   gh api repos/justinharringa/capivara-rica --jq .allow_auto_merge   # expect true
   ```

5. Open a trivial PR and confirm it cannot merge until `CI gate` passes.

## Other settings that live outside Git

**Actions must be pinned to a full-length SHA** (Settings → Actions → General,
`sha_pinning_required: true`). Every third-party `uses:` here is SHA-pinned
with a `# vX.Y.Z` comment and Renovate's `GitHub Actions` group keeps the pins
current; the setting turns the convention into enforcement.

```bash
gh api repos/justinharringa/capivara-rica/actions/permissions   # expect sha_pinning_required: true
```

**Dependabot security updates off; Dependabot alerts on** (Settings → Code
security). Renovate's `vulnerabilityAlerts` reads the alerts and opens a
`security`-labelled PR for each advisory; Dependabot's own PRs would only
duplicate them. Turning the *alerts* off would silently stop security PRs
from both bots.

```bash
gh api repos/justinharringa/capivara-rica/automated-security-fixes   # expect enabled: false
gh api -i repos/justinharringa/capivara-rica/vulnerability-alerts    # expect 204
```

**`production` environment**: deployment branches = `main` only, required
reviewers = the owner. That is the deploy gate; keep it even though the
ruleset exists, because the ruleset only gates merges.
