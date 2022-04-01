#!/bin/sh

docker build -t devcon-snapshot -f ./tests/playwright/scripts/Dockerfile.snapshot .

# Copy the playwright report from the container to host.
id=$(docker create devcon-snapshot)
docker cp $id:/app/playwright-report .
docker rm -v $id

# Note this is ran on the host machine
npx playwright show-report ./playwright-report