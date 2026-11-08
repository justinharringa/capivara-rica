# --- Contact address: contato@ forwards to the maintainer's inbox -----------------------
# Cloudflare Email Routing, on the primary zone only. Enabling it adds and locks the MX and
# SPF records Cloudflare needs; the registrar's mail-lockdown records (null MX, `v=spf1 -all`)
# must be deleted by hand first, or the null MX keeps winning and every message bounces (step 6
# in infrastructure/terraform/cloudflare/README.md). The DMARC `p=reject` record stays: the
# project sends no mail.
#
# The destination is an ordinary inbox outside this zone. Cloudflare e-mails it a verification
# link when the address is created; until that link is clicked the rule exists but delivers
# nothing (`destination_verified` output below).

resource "cloudflare_email_routing_dns" "primary" {
  zone_id = local.zones.primary
  name    = var.primary_zone
}

resource "cloudflare_email_routing_address" "contact_destination" {
  account_id = var.account_id
  email      = var.contact_destination
}

resource "cloudflare_email_routing_rule" "contact" {
  zone_id = local.zones.primary
  name    = "contato → maintainer"
  enabled = true

  matchers = [{
    type  = "literal"
    field = "to"
    value = "${var.contact_local_part}@${var.primary_zone}"
  }]

  actions = [{
    type  = "forward"
    value = [cloudflare_email_routing_address.contact_destination.email]
  }]

  depends_on = [cloudflare_email_routing_dns.primary]
}
