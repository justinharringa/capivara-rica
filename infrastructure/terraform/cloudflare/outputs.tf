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
