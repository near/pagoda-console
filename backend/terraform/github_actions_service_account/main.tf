#* This script should be ran by an owner.
# TODO create a service account with least permissions for Github actions.
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.36.0"
    }
    null = {
      source  = "hashicorp/null",
      version = "3.1.1"
    }
  }

  backend "gcs" {
    bucket = "terraform-pagoda-console-dev"
    prefix = "github-service-account"
  }
}

provider "null" {}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  terraform_state_bucket = "terraform-pagoda-console-dev"
}

resource "google_service_account" "github-actions" {
  account_id   = "service-account-id"
  display_name = "Pagoda Console Github Actions Service Account"
}

resource "google_project_iam_member" "tf_state_bucket" {
  project = "developer-platform-dev"
  role    = "roles/storage.legacyBucketOwner"
  member  = "serviceAccount:${google_service_account.github-actions.email}"

  condition {
    title       = "Terraform State Bucket"
    description = "Owner of terraform state bucket"
    expression  = "resource.type == 'storage.googleapis.com/Bucket' && resource.name.startsWith('projects/developer-platform-dev/buckets/${local.terraform_state_bucket}')"
  }
}
