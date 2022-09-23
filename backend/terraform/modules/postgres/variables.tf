variable "database_instance_name" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "database_password" {
  type      = string
  sensitive = true
  nullable  = false
}

variable "database_tier" {
  type        = string
  description = "Size of database instance"
  # The first number is CPU, second is RAM in MB: https://cloud.google.com/sql/docs/mysql/instance-settings
  # Don't want the db to be too small because it will affect the number of available db connections: https://stackoverflow.com/a/51097061 and https://cloud.google.com/sql/docs/quotas#postgresql
  default = "db-custom-4-26624"
}
