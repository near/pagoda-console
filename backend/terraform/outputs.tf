output "database_public_ip_address" {
  value = module.postgres.database_public_ip_address
}

output "database_connection_name" {
  value = module.postgres.database_connection_name
}

output "database_secret_suffix" {
  value = local.database_secret_suffix
}

output "database_instance_name" {
  value = module.postgres.database_instance_name
  sensitive = true
}

output "api_public_url" {
  value = module.api.api_public_url
}

output "api_name" {
  value = module.api.api_name
}
