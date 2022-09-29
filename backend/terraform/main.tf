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
  zone    = "us-east1-b"
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
      DB_USER=postgres
      DB_PASS=${var.database_password}
      DB_URL=${module.postgres.database_public_ip_address}
        . ./scripts/export_prisma_env_vars.sh &&
      ${var.prisma_migration_command}
    EOT
  }

  # Note that deleting databases is an async operation. We must sleep after deleting so we give time for the deletion to happen before we delete the db instance.
  provisioner "local-exec" {
    when    = destroy
    command = <<EOT
      psql postgresql://postgres:${self.triggers.database_password}@${self.triggers.database_public_ip_address} -f ../scripts/drop_databases.sql &&
      sleep 30
    EOT
  }
}

# Note this is only creating database secrets that need to be generated per environment. Runs once and will need to be updated manually if password changes.
# All other secrets are created manually.
# We could create other secrets in terraform but if we create the secret versions then the secret values would be saved to state.
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
      ../scripts/gcp_new_secret.sh postgresql://postgres:${var.database_password}@localhost/devconsole?host=/cloudsql/${module.postgres.database_connection_name} DATABASE_URL_${local.database_secret_suffix} &&
      ../scripts/gcp_new_secret.sh postgresql://postgres:${var.database_password}@localhost/abi?host=/cloudsql/${module.postgres.database_connection_name} ABI_DATABASE_URL_${local.database_secret_suffix} &&
      ../scripts/gcp_new_secret.sh postgresql://postgres:${var.database_password}@localhost/alerts?host=/cloudsql/${module.postgres.database_connection_name} ALERTS_DATABASE_URL_${local.database_secret_suffix} &&
      ../scripts/gcp_new_secret.sh postgresql://postgres:${var.database_password}@localhost/rpcstats?host=/cloudsql/${module.postgres.database_connection_name} RPCSTATS_DATABASE_URL_${local.database_secret_suffix} &&
   
      ../scripts/gcp_access_secret.sh DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account} &&
      ../scripts/gcp_access_secret.sh ABI_DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account} && 
      ../scripts/gcp_access_secret.sh ALERTS_DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account} &&
      ../scripts/gcp_access_secret.sh RPCSTATS_DATABASE_URL_${local.database_secret_suffix} ${var.api_service_account}
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
