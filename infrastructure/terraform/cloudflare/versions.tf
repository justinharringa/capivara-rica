terraform {
  required_version = ">= 1.10"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.28"
    }
  }

  # State lives in a Cloudflare R2 bucket (S3-compatible). The bucket is the one thing
  # Terraform cannot create for itself; it is made once by hand (see README.md).
  # The endpoint carries the account id, so CI passes it with -backend-config; the
  # credentials are the R2 S3 key pair in AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
  backend "s3" {
    bucket                      = "capivara-rica-tfstate"
    key                         = "cloudflare.tfstate"
    region                      = "auto"
    use_lockfile                = true
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}

# Reads CLOUDFLARE_API_TOKEN from the environment.
provider "cloudflare" {}
