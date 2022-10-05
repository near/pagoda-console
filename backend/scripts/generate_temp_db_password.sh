#!/bin/sh
# Generates temporary db secret with a random string attached. The random suffix is needed
# in order to force Terraform to update instance when the temp password is swapped for a real one
TEMP_DB_PASSWORD_PREFIX="TEMP_DB_PASSWORD"
RANDOM_STRING=$(LC_ALL=C tr -dc A-Za-z0-9 </dev/urandom | head -c 13 ; echo '')

TEMP_DB_PASSWORD="${TEMP_DB_PASSWORD_PREFIX}_${RANDOM_STRING}"
echo $TEMP_DB_PASSWORD