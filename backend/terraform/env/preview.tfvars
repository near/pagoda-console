environment = "preview"
# TODO currently we are resetting the db because the migrate dev command requires a user to accept a prompt: https://github.com/prisma/prisma/pull/14641
# We might also want to reset for automated e2e tests.
prisma_migration_command     = "npm run -w database migrate:reset"
ems_vpc_access_connector     = "projects/pagoda-shared-infrastructure/locations/us-east1/connectors/dev-connector1"
ems_provisioning_service_url = "http://ems-provisioning.dev.gcp.pagoda.co"

# Since preview environments are short-lived, it's a hassle having deletion protection.
deletion_protection = false

firebase_client_config = "{\"apiKey\":\"AIzaSyDe_OW8pBVbGXsnt1Azvuhe8dimAWL_L7I\",\"authDomain\":\"developer-platform-dev.firebaseapp.com\",\"projectId\":\"developer-platform-dev\",\"storageBucket\":\"developer-platform-dev.appspot.com\",\"messagingSenderId\":\"766023840763\",\"appId\":\"1:766023840763:web:79d849ea5efeed51e1915e\",\"measurementId\":\"G-N4KF80KNL3\"}"
