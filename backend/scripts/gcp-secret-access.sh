#!/bin/sh

# Gives the cloud run service account access to view the secret.
#
# Example usage:
#
# export PRINCIPAL=<TODO>-compute@developer.gserviceaccount.com	&&\
# ./scripts/gcp-secret-access.sh FIREBASE_CREDENTIALS_PREVIEW $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_ACTIVITY_MAINNET_DATABASE $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_ACTIVITY_MAINNET_HOST $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_ACTIVITY_MAINNET_PASSWORD $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_ACTIVITY_MAINNET_USER $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_MAINNET_DATABASE $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_MAINNET_HOST $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_MAINNET_PASSWORD $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_MAINNET_USER $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_TESTNET_DATABASE $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_TESTNET_HOST $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_TESTNET_PASSWORD $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh INDEXER_TESTNET_USER $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh MAILGUN_API_KEY_PREVIEW $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh MIXPANEL_TOKEN $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh RPC_API_KEYS_API_KEY_PREVIEW $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh TELEGRAM_BOT_TOKEN_PREVIEW $PRINCIPAL &&\
# ./scripts/gcp-secret-access.sh TELEGRAM_SECRET_PREVIEW $PRINCIPAL
#
#* This command is useful for getting a dump of secret names from GCP: `gcloud secrets list --project <my-project> --format="config(name)"`

if [ -z $2 ]
then
    echo "usage: ./gcp-secret-access <secret name> <cloud run service account (e.g. 123-compute@developer.gserviceaccount.com)>";
    exit 1;
fi;

SECRET_NAME=$1
SERVICE_ACCOUNT=$2

# TODO inject project id
gcloud secrets add-iam-policy-binding $SECRET_NAME\
    --member "serviceAccount:$SERVICE_ACCOUNT"\
    --project "developer-platform-dev"\
    --role "roles/secretmanager.secretAccessor"