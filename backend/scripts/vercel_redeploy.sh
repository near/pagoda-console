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

if [ -z "$GIT_REPO" ]
then
    echo "Missing GIT_REPO variable";
    exit 1;
fi;

if [ -z "$VERCEL_ORG" ]
then
    echo "Missing VERCEL_ORG variable";
    exit 1;
fi;

curl -v -X POST "https://api.vercel.com/v9/deployments?teamId=${VERCEL_TEAM_ID}&forceNew=1&withCache=1" \
    -H "Authorization: Bearer ${VERCEL_AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${VERCEL_PROJECT_NAME}\",\"gitSource\":{\"ref\":\"${BRANCH_NAME}\",\"repo\":\"${GIT_REPO}\",\"org\":\"${VERCEL_ORG}\",\"type\":\"github\"}}" \
    | jq .alias | jq first -r
    