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

variable "database_secret_suffix" {
  type     = string
  nullable = false
}

variable "api_name" {
  type        = string
  description = "Used to name the cloud run instance (e.g. console-api-preview-ci-cd, console-api-dev, console-api-prod, etc)"
  nullable    = false
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

variable "database_connection_name" {
  type     = string
  nullable = false
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

variable "mixpanel_token_version" {
  type     = string
  nullable = false
  default  = "1"
}

variable "mailgun_api_key_version" {
  type     = string
  nullable = false
  default  = "1"
}

variable "rpc_api_keys_api_key_version" {
  type     = string
  nullable = false
  default  = "1"
}
