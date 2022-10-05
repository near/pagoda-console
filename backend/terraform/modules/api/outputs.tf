# Ref to cloud run attributes: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service#attributes-reference
output "api_public_url" {
  # Note this is a single element list, it's confusing but we need the [0] here.
  value = google_cloud_run_service.console_api.status[0].url
}

output "api_name" {
  value = google_cloud_run_service.console_api.name
}
