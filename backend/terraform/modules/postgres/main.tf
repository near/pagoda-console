resource "google_sql_database_instance" "console_db" {
  name             = var.database_instance_name
  database_version = "POSTGRES_13"

  # If you would like to delete this SQL instance, you must explicitly set this to false and terraform apply then terraform destroy.
  deletion_protection = var.deletion_protection

  # TODO setup replica_configuration for prod

  settings {
    tier = var.database_tier
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

resource "google_sql_user" "console_db_users" {
  name     = "postgres"
  instance = google_sql_database_instance.console_db.name
  password = var.database_password
}
