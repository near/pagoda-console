#!/bin/sh

if [ -z "$1" ]
then
    echo "usage: ./docker_build_and_push.sh <dev|latest|branch_name> <optional: gcp project id>";
    exit 1;
fi;

PROJECT_ID="$2"
if [ -z "$2" ]
then
    PROJECT_ID="near-dev-platform"
fi;

TAG="gcr.io/$PROJECT_ID/developer-console-api:$1"

echo "Docker tag: $TAG"

# Build and push the docker container
docker build -t "$TAG" .
docker push "$TAG"
