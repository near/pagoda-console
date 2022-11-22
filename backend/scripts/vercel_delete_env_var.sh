#!/bin/sh

# Deletes an environment variable in Vercel.

if [ -z "$VERCEL_TEAM_ID" ]
then
    echo "Missing VERCEL_TEAM_ID variable";
    exit 1;
fi;

if [ -z "$VERCEL_AUTH_TOKEN" ]
then
    echo "Missing VERCEL_AUTH_TOKEN variable";
    exit 1;
fi;

if [ -z "$VERCEL_PROJECT_NAME" ]
then
    echo "Missing VERCEL_PROJECT_NAME variable";
    exit 1;
fi;

if [ -z "$BRANCH_NAME" ]
then
    echo "Missing BRANCH_NAME variable";
    exit 1;
fi;

if [ -z "$1" ]
then
    echo "usage: ./vercel_delete_env_var.sh <name>";
    exit 1;
fi;

VAR_NAME=$1

# Attempt to update the env var in case it already exists.
# Helpful for writing filters in jq: https://gist.github.com/ipbastola/2c955d8bf2e96f9b1077b15f995bdae3
ENV_ID=$(curl -X GET "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_NAME}/env?gitBranch=${BRANCH_NAME}&teamId=${VERCEL_TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_AUTH_TOKEN}" \
    | jq .envs \
    | jq -c ".[] | select( .key == \"${VAR_NAME}\" )" \
    | jq .id -r)

echo ENV_ID $ENV_ID

if [ -z "$ENV_ID" ]
then
    echo "failed to find env var"
    exit 0
fi

echo "attempting to delete env var"

curl -X DELETE "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_NAME}/env/${ENV_ID}?teamId=${VERCEL_TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_AUTH_TOKEN}"