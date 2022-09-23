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
}


module "postgres" {
  source = "./modules/postgres"

  database_instance_name = "console-db-${var.namespace}"
  database_password      = var.database_password

  deletion_protection = var.deletion_protection
}


resource "null_resource" "db_migration" {
  # Trick to get terraform to run this db migration script every run.
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "cd .. && source ./scripts/export_prisma_env_vars.sh postgres ${var.database_password} ${module.postgres.database_public_ip_address} && ${var.prisma_migration_command}"
  }
}

module "api" {
  source = "./modules/api"

  depends_on = [
    null_resource.db_migration
  ]

  region                       = var.region
  environment                  = var.environment
  api_name                     = "console-api-${var.namespace}"
  api_image                    = var.api_image
  frontend_base_url            = var.frontend_base_url
  database_connection_name     = module.postgres.database_connection_name
  ems_vpc_access_connector     = var.ems_vpc_access_connector
  ems_provisioning_service_url = var.ems_provisioning_service_url
}
