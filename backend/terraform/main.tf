# TODO run this gcloud command to gen terraform code: https://cloud.google.com/docs/terraform/resource-management/export
# TODO move TF state to a GCP cloud storage: https://cloud.google.com/docs/terraform/resource-management/store-state
locals {
  environment_upper    = upper(var.environment)
  db_namespaced_suffix = var.environment == "preview" ? "/${var.namespace}" : ""
}

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
}

provider "null" {}

provider "google" {
  // TODO create a separate service account and store it in gcp_key.json: https://cloud.google.com/sdk/gcloud/reference/auth/application-default
  // From Github Actions, we would store the contents of the file in secret manager
  // In the action, output the $ENV_VAR >> terraform/gcp_key.json
  // Then call whatever Terraform commands
  // credentials = file("gcp_key.json")

  // TODO use this for de v and prod
  // project = "near-dev-platform"
  project = var.project_id // "developer-platform-dev"
  region  = var.region     // "us-east1"
  // zone    = "us-east1-b" // Our SQL instances are currently deployed in this zone
}

// you could then use `google_sql_database_instance.console_db.connection_name` for creating the backend env vars
// Because it takes such a long time to create a SQL instance, we should create one for all preview environments
// and namespace the databases by PR. The theory is that there shouldn't be too many PR previews actively running
// at once. So we shouldn't run out of db connections, etc.
resource "google_sql_database_instance" "console_db" {
  name             = var.database_name
  database_version = "POSTGRES_13"

  # TODO setup replica_configuration for prod

  settings {
    # The first number is CPU, second is RAM in MB: https://cloud.google.com/sql/docs/mysql/instance-settings
    tier = "db-custom-4-26624"
    # TODO turn on backups on dev and prod environments
    # backup_configuration {
    #   // should only be false on preview environments, we just don't need it
    #   enabled = true
    # }

    ip_configuration {
      authorized_networks {
        # ANYWHERE is necessary for dynamic ips coming from AWS (alertexer) and github actions (running db migrations)
        name  = "ANYWHERE"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "null_resource" "db_migration" {
  # Trick to get terraform to run this db migration script every run.
  triggers = {
    always_run = "${timestamp()}"
  }

  //* Get the branch name here within a Github action here: https://stackoverflow.com/a/58034787
  // This command should create the Prisma databases and namespace them on git branch if you are deploying a preview environment.
  // Example connection string: postgresql://postgres:password@localhost/abi/feat/dec-11-some-updates?host=/cloudsql/project_id:region:db_name
  provisioner "local-exec" {
    command = "cd .. && source ./scripts/export_prisma_env_vars.sh ${var.database_user} ${var.database_password} ${google_sql_database_instance.console_db.public_ip_address} ${local.db_namespaced_suffix} && npm run prisma:migrate:deploy"
  }
}

resource "google_sql_user" "console_db_users" {
  name     = "postgres"
  instance = google_sql_database_instance.console_db.name
  password = var.database_password
}

resource "google_cloud_run_service" "console_api" {
  name                       = var.api_name
  location                   = var.region
  autogenerate_revision_name = true

  traffic {
    percent         = 100
    latest_revision = true
  }

  template {
    metadata {
      #* You can find these annotations through gcp console. Go to the cloud run revision and click on the "yaml" tab.
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
        # VPC connector for EMS connections. Preview and dev environments share the dev connection.
        #* SRE team must have firewall rules in place in order to connect to the VPC before terraform can successfully create this cloud run resource.
        #* We should confirm with them if they have Terraform files to create the firewall rules or if we should create the firewall rules here.
        # TODO enable VPC
        # "run.googleapis.com/vpc-access-connector" = "projects/pagoda-shared-infrastructure/locations/us-east1/connectors/${var.environment == "prod" ? "prod-us-east1-connector" : "dev-connector1"}"
        # "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.console_db.connection_name # TODO make sure this connection_name is like "near-dev-platform:us-east1:api-console-preview"
      }
    }

    spec {
      containers {
        image = var.api_image

        #* Environment variables
        # Adding a new secret and version is currently a manual process done through gcloud cli or console.
        # Make sure you give the service account for the cloud run application access to the secret.
        #
        # GCP recommends pinning to a secret version rather than using `latest`: https://cloud.google.com/secret-manager/docs/best-practices#administration
        # Consider using a version # instead of latest in order to get repeatable and deterministic builds. It might also be better for preview deployments when one dev needs to modify the secret value but the modification will affect other devs.
        env {
          name  = "TZ"
          value = "US/Pacific"
        }

        env {
          name  = "DEPLOY_ENV"
          value = "DEVELOPMENT"
        }

        env {
          name  = "RECENT_TRANSACTIONS_COUNT"
          value = "10"
        }

        env {
          name  = "MIXPANEL_API"
          value = "https://data.mixpanel.com/api/2.0/export"
        }

        env {
          name = "MIXPANEL_TOKEN"
          value_from {
            secret_key_ref {
              name = "MIXPANEL_TOKEN"
              key  = "1"
            }
          }
        }

        env {
          name  = "TELEGRAM_ENABLE_WEBHOOK"
          value = "true"
        }

        # TODO remove this once it's replaced by EMAIL_ALERTS_NO_REPLY
        env {
          name  = "EMAIL_VERIFICATION_FROM"
          value = "noreply@alerts.console.pagoda.co"
        }

        env {
          name  = "EMAIL_NO_REPLY"
          value = "noreply@console.pagoda.co"
        }

        env {
          name  = "EMAIL_ALERTS_NO_REPLY"
          value = "noreply@alerts.console.pagoda.co"
        }

        env {
          name  = "MAILGUN_DOMAIN"
          value = "alerts.console.pagoda.co"
        }

        env {
          name = "MAILGUN_API_KEY"
          value_from {
            secret_key_ref {
              name = "MAILGUN_API_KEY_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        # TODO unless we generate a preview url with the branch name in the url somewhere. We won't be able to predict what the url will be unless we deploy UI first -> set BE url to '' -> deploy BE with UI url -> update UI with correct BE url.
        env {
          name  = "FRONTEND_BASE_URL"
          value = var.frontend_base_url
        }

        env {
          name = "RPC_API_KEYS_URL"
          # Preview environments also point to the dev instance of EMS.
          value = "http://ems-provisioning.${var.environment == "prod" ? "prod" : "dev"}.gcp.pagoda.co"
        }

        env {
          name = "RPC_API_KEYS_API_KEY"
          value_from {
            secret_key_ref {
              name = "RPC_API_KEYS_API_KEY_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "FIREBASE_CREDENTIALS"
          value_from {
            secret_key_ref {
              name = "FIREBASE_CREDENTIALS_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "DATABASE_URL_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "ABI_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "ABI_DATABASE_URL_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "ALERTS_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "ALERTS_DATABASE_URL_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "RPCSTATS_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "RPCSTATS_DATABASE_URL_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "TELEGRAM_SECRET"
          value_from {
            secret_key_ref {
              name = "TELEGRAM_SECRET_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "TELEGRAM_BOT_TOKEN"
          value_from {
            secret_key_ref {
              name = "TELEGRAM_BOT_TOKEN_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_MAINNET_HOST"
          value_from {
            secret_key_ref {
              name = "INDEXER_MAINNET_HOST"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_MAINNET_DATABASE"
          value_from {
            secret_key_ref {
              name = "INDEXER_MAINNET_DATABASE"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_MAINNET_USER"
          value_from {
            secret_key_ref {
              name = "INDEXER_MAINNET_USER"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_MAINNET_PASSWORD"
          value_from {
            secret_key_ref {
              name = "INDEXER_MAINNET_PASSWORD"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_TESTNET_HOST"
          value_from {
            secret_key_ref {
              name = "INDEXER_TESTNET_HOST"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_TESTNET_DATABASE"
          value_from {
            secret_key_ref {
              name = "INDEXER_TESTNET_DATABASE"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_TESTNET_USER"
          value_from {
            secret_key_ref {
              name = "INDEXER_TESTNET_USER"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_TESTNET_PASSWORD"
          value_from {
            secret_key_ref {
              name = "INDEXER_TESTNET_PASSWORD"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_ACTIVITY_MAINNET_HOST"
          value_from {
            secret_key_ref {
              name = "INDEXER_ACTIVITY_MAINNET_HOST"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_ACTIVITY_MAINNET_DATABASE"
          value_from {
            secret_key_ref {
              name = "INDEXER_ACTIVITY_MAINNET_DATABASE"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_ACTIVITY_MAINNET_USER"
          value_from {
            secret_key_ref {
              name = "INDEXER_ACTIVITY_MAINNET_USER"
              key  = "1"
            }
          }
        }

        env {
          name = "INDEXER_ACTIVITY_MAINNET_PASSWORD"
          value_from {
            secret_key_ref {
              name = "INDEXER_ACTIVITY_MAINNET_PASSWORD"
              key  = "1"
            }
          }
        }
      }
    }
  }

  # The API depends on the db migrations being successful.
  # Terraform cannot automatically infer this dependency.
  depends_on = [
    null_resource.db_migration
  ]
}

# Allows unauthenticated access to the console_api cloud run instance.
data "google_iam_policy" "no_auth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "no_auth" {
  location = google_cloud_run_service.console_api.location
  project  = google_cloud_run_service.console_api.project
  service  = google_cloud_run_service.console_api.name

  policy_data = data.google_iam_policy.no_auth.policy_data
}

# Credentials saved to file: [/Users/jon/.config/gcloud/application_default_credentials.json]

# These credentials will be used by any library that requests Application Default Credentials (ADC).
# WARNING:
# Cannot find a quota project to add to ADC. You might receive a "quota exceeded" or "API not enabled" error. Run $ gcloud auth application-default set-quota-project to add a quota project.


# Updates are available for some Google Cloud CLI components.  To install them,
# please run:
#   $ gcloud components update



# To take a quick anonymous survey, run:
#   $ gcloud survey


// We have a pretty simple deployed environment

// DEV + PROD

// Process
// 1. put the FE into maintenance mode
// 2.
//

// After the Terraform apply command is completed and FE and BE are deployed, we can output the Vercel URL for the deployment
// https://learn.hashicorp.com/tutorials/terraform/outputs?in=terraform/configuration-language#query-outputs
// We should be able to use `terraform output name_of_variable_for_display` or `terraform output` to view everything
// We should create a `outputs.tf` to define the output variables?


/*
For a preview environment

1. create sql db
    * perform prisma migrations from a script
2. build and deploy a backend container with a dev tag
    * there are potentially going to be multiple deployments at once (confirm this is true)
      we will need to capture the output of this deployed image to deploy our code off of it
3. deploy a cloud run instance with image in step 2
    * env var for db from step 1 (TF should be smart enough to get this)


notes:
* probably need to mock things like alertexer? anything else?
* This preview environment is temporary, it should have a name associated with it. Once the PR is merged, TF destroy on preview env should be called.
*/

# After a PR is merged into dev, a github action should run to cleanup the preview environment (drop the namespaced databases, delete the cloud run instance, etc)
# `gcloud sql databases delete DATABASE_NAME --instance=PREVIEW_ENV_INSTANCE`
