locals {
  environment_upper = upper(var.environment)
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
      #* You can find these annotations through GCP console. Go to the cloud run revision and click on the "yaml" tab.
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"

        "run.googleapis.com/vpc-access-connector" = var.ems_vpc_access_connector
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"

        "run.googleapis.com/cloudsql-instances" = var.database_connection_name
      }
    }

    spec {
      containers {
        image = var.api_image

        # TODO inject env secret keys/versions, these should be set in the tfvars files, preview envs should have db secrets set to latest and everything else should be set to something specific.
        #* Environment variables
        # Adding a new secret and version is currently a manual process done through gcloud cli or console.
        # Make sure you give the service account for the cloud run application access to the secret.
        # See `scripts/gcp_new_secret.sh` for reference
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

        env {
          name  = "FRONTEND_BASE_URL"
          value = var.frontend_base_url
        }

        env {
          name  = "RPC_API_KEYS_URL"
          value = var.ems_provisioning_service_url
        }

        env {
          name  = "FIREBASE_CLIENT_CONFIG"
          value = var.firebase_client_config
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
              name = "DATABASE_URL_${var.database_secret_suffix}"
              key  = "latest"
            }
          }
        }

        env {
          name = "ABI_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "ABI_DATABASE_URL_${var.database_secret_suffix}"
              key  = "latest"
            }
          }
        }

        env {
          name = "ALERTS_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "ALERTS_DATABASE_URL_${var.database_secret_suffix}"
              key  = "latest"
            }
          }
        }

        env {
          name = "RPCSTATS_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "RPCSTATS_DATABASE_URL_${var.database_secret_suffix}"
              key  = "latest"
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

        env {
          name = "GITHUB_CONNECT_CLIENT_ID"
          value_from {
            secret_key_ref {
              name = "GITHUB_CONNECT_CLIENT_ID_${local.environment_upper}"
              key  = "1"
            }
          }
        }

        env {
          name = "GITHUB_CONNECT_CLIENT_SECRET"
          value_from {
            secret_key_ref {
              name = "GITHUB_CONNECT_CLIENT_SECRET_${local.environment_upper}"
              key  = "1"
            }
          }
        }
      }
    }
  }
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
