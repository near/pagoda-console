# Ref to cloud run attributes: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service#attributes-reference
output "api_public_url" {
  value = google_cloud_run_service.console_api.status.url
}
