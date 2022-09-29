# Ref to cloud sql attributes: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance#attributes-reference
output "database_public_ip_address" {
  value = google_sql_database_instance.console_db.public_ip_address
}

output "database_connection_name" {
  value = google_sql_database_instance.console_db.connection_name
}
