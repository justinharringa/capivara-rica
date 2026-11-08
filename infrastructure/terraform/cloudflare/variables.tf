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
