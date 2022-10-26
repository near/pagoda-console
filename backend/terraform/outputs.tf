output "database_public_ip_address" {
  value = module.postgres.database_public_ip_address
}

output "api_public_url" {
  value = module.api.api_public_url
}