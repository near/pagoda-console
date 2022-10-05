project_id                   = "near-dev-platform"
environment                  = "prod"
frontend_base_url            = "https://console.pagoda.co"
ems_vpc_access_connector     = "projects/pagoda-shared-infrastructure/locations/us-east1/connectors/prod-us-east1-connector"
ems_provisioning_service_url = "http://ems-provisioning.prod.gcp.pagoda.co"

# TODO below is an example of where to set the specific secret version for each environment.
# TODO you only need to set a specific version if it's greater than 1.
# mixpanel_token_version = "2"
