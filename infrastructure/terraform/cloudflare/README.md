# Cloudflare (zone settings, typo-domain redirect)

The game is served by **Cloudflare Workers static assets**: `wrangler.jsonc` at the repo root
names the Worker, the asset directory and the custom domains `capivararica.com.br` and `www`,
and `.github/workflows/deploy.yml` runs `wrangler deploy` on `main` (and `wrangler versions
upload` for pull-request preview URLs). wrangler creates the custom-domain DNS records and
certificates in the zone itself.

This Terraform stack manages what wrangler does not: the HTTPS zone settings on both zones,
and the typo-catch zone `capivarica.com.br` (proxied placeholder records plus a 301 redirect
ruleset to the canonical domain, path and query preserved).

State: Cloudflare R2 bucket `capivara-rica-tfstate`, key `cloudflare.tfstate`, locked with
the S3 lockfile. Applied by `deploy.yml` (plan on pull requests, apply on `main`).

## One-time bootstrap (dashboard)

1. Add both domains to the Cloudflare account (Free plan) and set registro.br's nameservers
   to the pair Cloudflare shows. Disable DNSSEC at registro.br first if it is on. Keep the
   three mail-lockdown records registro.br ships (null MX, `v=spf1 -all`, DMARC reject).
2. Create the R2 bucket `capivara-rica-tfstate` (private).
3. Create an R2 S3 API token (Object Read & Write, that bucket only) → it gives an
   Access Key ID and Secret Access Key.
4. Create a Cloudflare API token from the **Edit Cloudflare Workers** template, then add
   Zone · Zone · Read, Zone · DNS · Edit and Zone · Zone Settings · Edit, scoped to the two
   zones.
5. In GitHub → Settings → Environments create **`production`** (Deployment branches: *Selected
   branches*, add `main`) and **`preview`** (no protection rules). Put the three secrets
   `CLOUDFLARE_API_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` into **both**
   environments, and the account id in the repository variable `CLOUDFLARE_ACCOUNT_ID`:

   ```
   gh variable set CLOUDFLARE_ACCOUNT_ID --repo justinharringa/capivara-rica --body <ACCOUNT_ID>
   for e in production preview; do
     gh secret set CLOUDFLARE_API_TOKEN   --repo justinharringa/capivara-rica --env $e
     gh secret set R2_ACCESS_KEY_ID       --repo justinharringa/capivara-rica --env $e
     gh secret set R2_SECRET_ACCESS_KEY   --repo justinharringa/capivara-rica --env $e
   done
   ```

   Pushes to `main` use `production` (apply + deploy); pull requests use `preview` (plan +
   preview version). Because `production` only accepts `main`, nothing but a merge can apply
   or deploy. Fork pull requests receive no secrets at all and skip.
   The deploy workflow's `preflight` job skips everything, and lists what is missing in its
   summary, until the variable and all three secrets exist in the environment in use.

Do not create a Worker, a Pages project or DNS records by hand.

## Local use

```
export CLOUDFLARE_API_TOKEN=…  AWS_ACCESS_KEY_ID=…  AWS_SECRET_ACCESS_KEY=…
terraform -chdir=infrastructure/terraform/cloudflare init \
  -backend-config="endpoints={s3=\"https://<ACCOUNT_ID>.r2.cloudflarestorage.com\"}"
terraform -chdir=infrastructure/terraform/cloudflare plan -var account_id=<ACCOUNT_ID>
npx wrangler deploy --dry-run   # checks wrangler.jsonc without deploying
```

`.terraform.lock.hcl` pins the provider for linux_amd64 (CI) and macOS.
