output "primary_zone_name_servers" {
  description = "Set these at registro.br for the primary domain."
  value       = data.cloudflare_zone.primary.name_servers
}

output "alias_zone_name_servers" {
  description = "Set these at registro.br for the typo-catch domain."
  value       = data.cloudflare_zone.alias.name_servers
}

output "zone_status" {
  description = "Both should read 'active' once registro.br points at Cloudflare."
  value = {
    (var.primary_zone) = data.cloudflare_zone.primary.status
    (var.alias_zone)   = data.cloudflare_zone.alias.status
  }
}

output "email_routing_status" {
  description = "Should read 'ready' once the registrar's null MX and SPF records are gone and Cloudflare's are in place."
  value       = cloudflare_email_routing_dns.primary.status
}

output "destination_verified" {
  description = "When the forwarding inbox clicked Cloudflare's verification link; null means contato@ does not deliver yet."
  value       = cloudflare_email_routing_address.contact_destination.verified
}
