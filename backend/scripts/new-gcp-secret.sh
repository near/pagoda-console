#!/bin/sh

# Creates a new GCP secret with an initial version and
# gives the principal (e.g. cloud run service account) access.

if [ -z $3 ]
then
    echo "usage: ./new-gcp-secret <value> <name> <cloud run service account (e.g. 123-compute@developer.gserviceaccount.com)>";
    exit 1;
fi;

SECRET_VALUE=$1
SECRET_NAME=$2
SERVICE_ACCOUNT=$3

# TODO switch to using near-dev-platform project
echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME\
    --data-file=-\ # This argument is important so GCP creates the first secret version.
    --project "developer-platform-dev"

./gcp-secret-access $SECRET_NAME $SERVICE_ACCOUNT