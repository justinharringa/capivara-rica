# Cloudflare (zone settings, typo-domain redirect, contact address)

The game is served by **Cloudflare Workers static assets**: `wrangler.jsonc` at the repo root
names the Worker, the asset directory and the custom domains `capivararica.com.br` and `www`,
and `.github/workflows/deploy.yml` runs `wrangler deploy` on pushes to `main` only. wrangler
creates the custom-domain DNS records and certificates in the zone itself.

This Terraform stack manages what wrangler does not: the HTTPS zone settings on both zones,
the typo-catch zone `capivarica.com.br` (proxied placeholder records plus a 301 redirect
ruleset to the canonical domain, path and query preserved), and Email Routing on the primary
zone, which forwards `contato@capivararica.com.br` to the maintainer's inbox (`email.tf`; the
inbox is the `contact_destination` variable, deliberately public).

State: Cloudflare R2 bucket `capivara-rica-tfstate`, key `cloudflare.tfstate`, locked with
the S3 lockfile. Planned and applied by `deploy.yml` on pushes to `main`; the plan is in the
job summary.

## One-time bootstrap (dashboard)

1. Add both domains to the Cloudflare account (Free plan) and set registro.br's nameservers
   to the pair Cloudflare shows. Disable DNSSEC at registro.br first if it is on. Keep the
   three mail-lockdown records registro.br ships (null MX, `v=spf1 -all`, DMARC reject).
2. Create the R2 bucket `capivara-rica-tfstate` (private).
3. Create an R2 S3 API token (Object Read & Write, that bucket only) → it gives an
   Access Key ID and Secret Access Key.
4. Create a Cloudflare API token with: Account · Workers Scripts · Edit; Account · Account
   Settings · Read; User · User Details · Read; and on the two zones only: Zone · Zone · Read,
   Zone · DNS · Edit, Zone · Zone Settings · Edit, Zone · Workers Routes · Edit, Zone · Single
   Redirect · Edit (the redirect ruleset; without it the apply fails with a 403 on
   `/rulesets`, found on the first deploy), Zone · Email Routing Rules · Edit; and Account ·
   Email Routing Addresses · Edit (the forwarding inbox is an account-level object). A token
   made before the contact address existed lacks the last two: edit it in the dashboard before
   approving the deploy that adds `email.tf`, or the apply fails with a 403 on
   `/email/routing`.
5. In GitHub → Settings → Environments create **`production`** with Deployment branches set
   to *Selected branches* → `main`, and add yourself under *Required reviewers*: every push to
   `main` then waits for one approval before anything touches Cloudflare (the workflow is a
   single job, so it is exactly one click per push). Put the three secrets into that environment and the account id in a repository
   variable:

   ```
   gh variable set CLOUDFLARE_ACCOUNT_ID --repo justinharringa/capivara-rica --body <ACCOUNT_ID>
   gh secret set CLOUDFLARE_API_TOKEN   --repo justinharringa/capivara-rica --env production
   gh secret set R2_ACCESS_KEY_ID       --repo justinharringa/capivara-rica --env production
   gh secret set R2_SECRET_ACCESS_KEY   --repo justinharringa/capivara-rica --env production
   ```

   Pull requests never receive Cloudflare credentials: `ci.yml` checks them and uploads the
   built site as an artifact; only a push to `main` applies Terraform and deploys. The job's
   first step stops with the missing items named in its summary if the variable or any of
   the three secrets is absent.

6. Before the deploy that enables Email Routing, delete two records registro.br shipped on
   `capivararica.com.br` in the DNS tab: the null MX (`MX 0 .`) and the `TXT "v=spf1 -all"`.
   Cloudflare adds its own MX and SPF when routing is enabled, and a null MX with priority 0
   outranks them, so with both present every message bounces. Keep `_dmarc` (`p=reject`).
   The `email_routing_status` output should then read `ready`.
7. After that apply, open the verification e-mail Cloudflare sends to the forwarding inbox and
   click the link; `destination_verified` turns from `null` into a timestamp and `contato@`
   starts delivering. Test with a message from another account.

Do not create a Worker, a Pages project or DNS records by hand (the two deletions above are the
one exception: those records predate Terraform and are not in its state).

## Local use

```
export CLOUDFLARE_API_TOKEN=…  AWS_ACCESS_KEY_ID=…  AWS_SECRET_ACCESS_KEY=…
terraform -chdir=infrastructure/terraform/cloudflare init \
  -backend-config="endpoints={s3=\"https://<ACCOUNT_ID>.r2.cloudflarestorage.com\"}"
terraform -chdir=infrastructure/terraform/cloudflare plan -var account_id=<ACCOUNT_ID>
npx wrangler deploy --dry-run   # checks wrangler.jsonc without deploying
```

`.terraform.lock.hcl` pins the provider for linux_amd64 (CI) and macOS.
