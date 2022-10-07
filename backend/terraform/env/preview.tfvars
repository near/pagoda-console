environment = "preview"
# TODO currently we are resetting the db because the migrate dev command requires a user to accept a prompt: https://github.com/prisma/prisma/pull/14641
# We might also want to reset for automated e2e tests.
prisma_migration_command     = "npm run -w database migrate:reset"
ems_vpc_access_connector     = "projects/pagoda-shared-infrastructure/locations/us-east1/connectors/dev-connector1"
ems_provisioning_service_url = "http://ems-provisioning.dev.gcp.pagoda.co"

# Since preview environments are short-lived, it's a hassle having deletion protection.
deletion_protection = false
