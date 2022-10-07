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
  description = "The environment name. Used to determine which environment secrets to use."

  validation {
    condition     = contains(["preview", "dev", "prod"], var.environment)
    error_message = "Allowed values for environment are \"preview\", \"dev\" or \"prod\"."
  }
}

variable "namespace" {
  type        = string
  description = "Optional unique name for this environment. Mainly used to uniquely name multiple preview environments. Will be used to name the database, secrets and api instances."
}

variable "prisma_migration_command" {
  type    = string
  default = "npm run -w database migrate:deploy"
}

variable "database_password" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "frontend_base_url" {
  type        = string
  description = "Base url of the frontend this backend is connected to (e.g. https://console.pagoda.co)"
  nullable    = false
}

variable "api_image" {
  type        = string
  description = "Docker image tag that should be used for console API"
  nullable    = false
}

variable "ems_vpc_access_connector" {
  type        = string
  description = "VPC to connect to EMS provisioning service"
  nullable    = false
}

variable "ems_provisioning_service_url" {
  type     = string
  nullable = false
}

variable "deletion_protection" {
  type    = bool
  default = true
}

variable "api_service_account" {
  type        = string
  description = "Cloud run service account. Will be granted access to database secrets after creation."
  nullable    = false
}
