#!/bin/sh
# PREVIEW_NAMESPACE is intended to be small and unique and is composed of:
# The first 10 chars in the github branch name after the last '/' followed by
# the first 5 chars in the sha256 of the whole branch name.
BRANCH_NAME=$(echo -n ${GITHUB_HEAD_REF##*/} | cut -c -10)
BRANCH_SHA=$(echo -n $GITHUB_HEAD_REF | sha256sum | cut -c -5)
PREVIEW_NAMESPACE="${BRANCH_NAME}-${BRANCH_SHA}"
echo $PREVIEW_NAMESPACE