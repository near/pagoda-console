#!/bin/sh

# Build and push the docker container
docker build -t gcr.io/near-dev-platform/developer-console-api .
docker push gcr.io/near-dev-platform/developer-console-api
