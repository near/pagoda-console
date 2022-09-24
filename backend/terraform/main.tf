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
  }
}

provider "null" {}

provider "google" {
  project = var.project_id
  region  = var.region
  # TODO enable to have the same zone as current sql instances
  # zone    = "us-east1-b"
}

locals {
  instance_name_suffix   = "${var.environment}${var.namespace != null ? "-${var.namespace}" : ""}"
  database_secret_suffix = upper(local.instance_name_suffix)
}

module "postgres" {
  source = "./modules/postgres"

  database_instance_name = "console-db-${local.instance_name_suffix}"
  database_password      = var.database_password

  deletion_protection = var.deletion_protection
}


resource "null_resource" "db_migration" {
  # Trick to get terraform to run this db migration script every run.
  triggers = {
    always_run                 = "${timestamp()}"
    database_password          = var.database_password
    database_public_ip_address = module.postgres.database_public_ip_address
  }

  provisioner "local-exec" {
    command = <<EOT
      cd .. &&
      source ./scripts/export_prisma_env_vars.sh postgres ${var.database_password} ${module.postgres.database_public_ip_address} &&
      ${var.prisma_migration_command}
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOT
      apt-get update &&
      apt-get install --yes --no-install-recommends postgresql-client
      psql postgresql://postgres:${self.triggers.database_password}@${self.triggers.database_public_ip_address} -f ../scripts/drop_databases.sql
    EOT
  }
}

# Note this is only creating database secrets that need to be generated.
# All other secrets are created manually.
# We could create these secrets in terraform but if we create the secret versions then the secret values would be saved to state.
# We would then need to encrypt the terraform state file in the gcp bucket: 
# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret_version
resource "null_resource" "env_secrets" {
  triggers = {
    database_connection_name = module.postgres.database_connection_name
    database_secret_suffix   = local.database_secret_suffix
    project_id               = var.project_id
  }

  provisioner "local-exec" {
    command = <<EOT
      ../scripts/new-gcp-secret.sh postgresql://postgres:${var.database_password}@localhost/devconsole?host=${module.postgres.database_connection_name} DATABASE_URL_${local.database_secret_suffix} &&
      ../scripts/new-gcp-secret.sh postgresql://postgres:${var.database_password}@localhost/abi?host=${module.postgres.database_connection_name} ABI_DATABASE_URL_${local.database_secret_suffix} &&
      ../scripts/new-gcp-secret.sh postgresql://postgres:${var.database_password}@localhost/alerts?host=${module.postgres.database_connection_name} ALERTS_DATABASE_URL_${local.database_secret_suffix} &&
      ../scripts/new-gcp-secret.sh postgresql://postgres:${var.database_password}@localhost/rpcstats?host=${module.postgres.database_connection_name} RPCSTATS_DATABASE_URL_${local.database_secret_suffix} &&
   
      ../scripts/gcp-secret-access.sh DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account} &&
      ../scripts/gcp-secret-access.sh ABI_DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account} && 
      ../scripts/gcp-secret-access.sh ALERTS_DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account} &&
      ../scripts/gcp-secret-access.sh RPCSTATS_DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account}
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOT
      gcloud secrets delete --quiet --project ${self.triggers.project_id} DATABASE_URL_${self.triggers.database_secret_suffix};
      gcloud secrets delete --quiet --project ${self.triggers.project_id} ABI_DATABASE_URL_${self.triggers.database_secret_suffix};
      gcloud secrets delete --quiet --project ${self.triggers.project_id} ALERTS_DATABASE_URL_${self.triggers.database_secret_suffix};
      gcloud secrets delete --quiet --project ${self.triggers.project_id} RPCSTATS_DATABASE_URL_${self.triggers.database_secret_suffix};
    EOT
  }
}

module "api" {
  source = "./modules/api"

  depends_on = [
    null_resource.db_migration,
    null_resource.env_secrets
  ]

  region                       = var.region
  environment                  = var.environment
  database_secret_suffix       = local.database_secret_suffix
  api_name                     = "console-api-${local.instance_name_suffix}"
  api_image                    = var.api_image
  frontend_base_url            = var.frontend_base_url
  database_connection_name     = module.postgres.database_connection_name
  ems_vpc_access_connector     = var.ems_vpc_access_connector
  ems_provisioning_service_url = var.ems_provisioning_service_url
}