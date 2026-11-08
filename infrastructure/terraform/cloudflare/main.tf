# Both zones are added to the Cloudflare account by hand (Add a domain, Free plan) and
# activated by pointing registro.br at Cloudflare's nameservers. Terraform manages the zone
# settings on both, and the typo-catch zone's placeholder records and redirect; the primary
# zone's site records belong to wrangler (see wrangler.jsonc).

data "cloudflare_zone" "primary" {
  filter = {
    name = var.primary_zone
  }
}

data "cloudflare_zone" "alias" {
  filter = {
    name = var.alias_zone
  }
}

locals {
  zones = {
    primary = data.cloudflare_zone.primary.id
    alias   = data.cloudflare_zone.alias.id
  }

  # Applied identically to both zones.
  zone_settings = {
    always_use_https         = "on"
    automatic_https_rewrites = "on"
    min_tls_version          = "1.2"
    ssl                      = "strict"
    brotli                   = "on"
  }
}

# --- Primary zone ------------------------------------------------------------------------
# The site itself is a Workers static-assets deployment (wrangler.jsonc). wrangler owns the
# Worker and, through `routes[].custom_domain`, the apex and www DNS records and certificates
# in this zone, so nothing here points at it; Terraform manages the zone settings only.

# --- DNS + redirect: the typo domain sends everything to the primary --------------------

# A proxied placeholder so the edge answers for the alias zone; the ruleset below redirects.
resource "cloudflare_dns_record" "alias_apex" {
  zone_id = local.zones.alias
  name    = var.alias_zone
  type    = "AAAA"
  content = "100::"
  proxied = true
  ttl     = 1
  comment = "Placeholder; all traffic is redirected to ${var.primary_zone} (managed by Terraform)"
}

resource "cloudflare_dns_record" "alias_www" {
  zone_id = local.zones.alias
  name    = "www.${var.alias_zone}"
  type    = "AAAA"
  content = "100::"
  proxied = true
  ttl     = 1
  comment = "Placeholder; all traffic is redirected to ${var.primary_zone} (managed by Terraform)"
}

resource "cloudflare_ruleset" "alias_redirect" {
  zone_id     = local.zones.alias
  name        = "Redirect to ${var.primary_zone}"
  description = "Typo-catch domain: permanent redirect of every request, path and query preserved."
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules = [{
    ref         = "redirect_to_primary"
    description = "Redirect to ${var.primary_zone}"
    expression  = "true"
    action      = "redirect"
    enabled     = true
    action_parameters = {
      from_value = {
        status_code           = 301
        preserve_query_string = true
        target_url = {
          expression = "concat(\"https://${var.primary_zone}\", http.request.uri.path)"
        }
      }
    }
  }]
}

# --- Zone settings ------------------------------------------------------------------------

resource "cloudflare_zone_setting" "primary" {
  for_each   = local.zone_settings
  zone_id    = local.zones.primary
  setting_id = each.key
  value      = each.value
}

resource "cloudflare_zone_setting" "alias" {
  for_each   = local.zone_settings
  zone_id    = local.zones.alias
  setting_id = each.key
  value      = each.value
}
