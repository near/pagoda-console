#!/bin/sh

# Creates a new GCP secret with an initial version and
# gives the principal (e.g. cloud run service account) access.

if [ -z $2 ]
then
    echo "usage: ./new-gcp-secret <value> <name>";
    exit 1;
fi;

SECRET_VALUE=$1
SECRET_NAME=$2

# TODO inject project id
# `--data-file=-` file is important so GCP creates the first secret version.
echo "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME\
    --data-file=-\
    --project "developer-platform-dev"