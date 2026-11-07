# Cloudflare (DNS, Pages, redirects)

Manages everything inside the two zones `capivararica.com.br` (canonical) and
`capivarica.com.br` (typo catch, 301 to canonical): the Pages project the game deploys to,
its custom domains, DNS records, the redirect ruleset and the HTTPS zone settings.

State: Cloudflare R2 bucket `capivara-rica-tfstate`, key `cloudflare.tfstate`, locked with
the S3 lockfile. Applied by `.github/workflows/deploy.yml` (plan on pull requests, apply on
`main`), never by hand except for the first bootstrap below.

## One-time bootstrap (dashboard)

1. Add both domains to the Cloudflare account (Free plan) and set registro.br's nameservers
   to the pair Cloudflare shows. Disable DNSSEC at registro.br first if it is on.
2. Create the R2 bucket `capivara-rica-tfstate` (private).
3. Create an R2 S3 API token (Object Read & Write, that bucket only) → GitHub secrets
   `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
4. Create a Cloudflare API token with: Account · Cloudflare Pages · Edit; Zone · Zone · Read;
   Zone · DNS · Edit; Zone · Zone Settings · Edit; scoped to the two zones → GitHub secret
   `CLOUDFLARE_API_TOKEN`.
5. Put the account id in the GitHub repository variable `CLOUDFLARE_ACCOUNT_ID`.
   The workflow is skipped while that variable is empty, so the repo stays green until then.

Do not create the Pages project or DNS records by hand; Terraform owns them.

## Local use

```
export CLOUDFLARE_API_TOKEN=…  AWS_ACCESS_KEY_ID=…  AWS_SECRET_ACCESS_KEY=…
terraform -chdir=infrastructure/terraform/cloudflare init \
  -backend-config="endpoints={s3=\"https://<ACCOUNT_ID>.r2.cloudflarestorage.com\"}"
terraform -chdir=infrastructure/terraform/cloudflare plan -var account_id=<ACCOUNT_ID>
```

`.terraform.lock.hcl` pins the provider for linux_amd64 (CI) and darwin_arm64.
