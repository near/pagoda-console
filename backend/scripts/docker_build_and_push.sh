#!/bin/sh

if [ -z "$1" ]
then
    echo "usage: ./docker_build_and_push.sh <dev|latest>";
    exit 1;
fi;

# Build and push the docker container
docker build -t gcr.io/near-dev-platform/developer-console-api:$1 .
docker push gcr.io/near-dev-platform/developer-console-api:$1
