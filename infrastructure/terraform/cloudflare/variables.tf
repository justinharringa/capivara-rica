variable "account_id" {
  description = "Cloudflare account id (not a secret; shown on every zone's overview page)."
  type        = string
}

variable "primary_zone" {
  description = "The canonical domain the game is served from."
  type        = string
  default     = "capivararica.com.br"
}

variable "alias_zone" {
  description = "Typo-catch domain; every request redirects to the primary zone."
  type        = string
  default     = "capivarica.com.br"
}

variable "contact_local_part" {
  description = "Local part of the public contact address on the primary zone (contato@…)."
  type        = string
  default     = "contato"
}

variable "contact_destination" {
  description = "Inbox the contact address forwards to. Not a secret: it is visible in the public repo on purpose, and Cloudflare verifies it by e-mail before delivering anything."
  type        = string
  default     = "capivararica@harringa.com"
}
