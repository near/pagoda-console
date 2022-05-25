#!/bin/sh

docker build -t devcon-e2e -f ./tests/playwright/scripts/Dockerfile.e2e .

rm -rf ./playwright-report

# Copy the playwright report from the container to host.
id=$(docker create devcon-e2e)
docker cp $id:/app/playwright-report .
docker rm -v $id

# Note this is ran on the host machine
npx playwright show-report ./playwright-report