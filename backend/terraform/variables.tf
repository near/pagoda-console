variable "project_id" {
  type    = string
  default = "developer-platform-dev"
}

variable "region" {
  type    = string
  default = "us-east1"
}

variable "environment" {
  type        = string
  description = "The environment that you want to deploy to"
  # default     = "preview"

  validation {
    condition     = contains(["preview", "dev", "prod"], var.environment)
    error_message = "Allowed values for environment are \"preview\", \"dev\", or \"prod\"."
  }
}

variable "namespace" {
  type        = string
  description = "Used to name things uniquely in the preview environment (e.g. sql databases must be namespaced since they are in a shared SQL instance to reduce deployment times)"
  default     = "default"
}

variable "api_name" {
  type        = string
  description = "Used to name the cloud run instance (e.g. console-api-preview-ci-cd, console-api-dev, console-api-prod, etc)"
  nullable    = false
}

variable "sql_instance_name" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "database_user" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "database_password" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "api_image" {
  type        = string
  description = "Docker image tag that should be used for console API"
  nullable    = false
}

variable "frontend_base_url" {
  type        = string
  description = "Base url of the frontend this backend is connected to (e.g. https://console.pagoda.co)"
  nullable    = false
}
