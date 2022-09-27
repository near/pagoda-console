#!/bin/sh

# Redeploy an existing branch deployment in Vercel. Prints/outputs the branch's URL.

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

if [ -z "$2" ]
then
    echo "usage: ./vercel_upsert_env_var.sh <name> <value>";
    exit 1;
fi;

VAR_NAME=$1
VAR_VALUE=$2

# For reference: https://vercel.com/docs/rest-api#endpoints/projects/create-one-or-more-environment-variables
RESPONSE=$(curl -X POST "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_NAME}/env?teamId=${VERCEL_TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"${VAR_NAME}\",\"value\":\"${VAR_VALUE}\",\"target\":[\"preview\"],\"type\":\"encrypted\",\"gitBranch\":\"${BRANCH_NAME}\"}")

ERROR=$(echo "$RESPONSE" | jq .error)

if [ -z "$ERROR" ]
then
    echo ''
    echo 'created env var'
    exit 0
fi

ERROR_CODE=$(echo "$ERROR" | jq .code -r)
# echo ERROR_CODE $ERROR_CODE

if [ "$ERROR_CODE" == 'ENV_ALREADY_EXISTS' ]
then
    echo "env var already exists... attempting to update"

    # Attempt to update the env var in case it already exists.
    # Helpful for writing filters in jq: https://gist.github.com/ipbastola/2c955d8bf2e96f9b1077b15f995bdae3
    ENV_ID=$(curl -X GET "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_NAME}/env?gitBranch=${BRANCH_NAME}&teamId=${VERCEL_TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_AUTH_TOKEN}" \
        | jq .envs \
        | jq -c ".[] | select( .key == \"${VAR_NAME}\" )" \
        | jq .id -r)

    echo ENV_ID $ENV_ID

    curl -X PATCH "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_NAME}/env/${ENV_ID}?teamId=${VERCEL_TEAM_ID}" \
        -H "Authorization: Bearer ${VERCEL_AUTH_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"key\":\"${VAR_NAME}\",\"value\":\"${VAR_VALUE}\",\"target\":[\"preview\"],\"type\":\"encrypted\",\"gitBranch\":\"${BRANCH_NAME}\"}"
fi