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
