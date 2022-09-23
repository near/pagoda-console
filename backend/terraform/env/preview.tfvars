environment                  = "preview"
prisma_migration_command     = "npm run prisma:migrate:reset"
ems_vpc_access_connector     = "projects/pagoda-shared-infrastructure/locations/us-east1/connectors/dev-connector1"
ems_provisioning_service_url = "http://ems-provisioning.dev.gcp.pagoda.co"

# Since preview environments are short-lived, it's a hassle having deletion protection.
deletion_protection = false
