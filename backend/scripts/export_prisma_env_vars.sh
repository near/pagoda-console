#!/bin/bash

#* This script is helpful before immediately calling `prisma.sh`.
#* In order to get the exported variables to stick properly, you will
#* need to prefix the script command with a `.` or the word `source`
#* in order to "source" the variables.
#*
#* e.g. `. ./prisma_env_vars.sh ...` or `source ./prisma_env_vars.sh ...`

if [ -z "$3" ]
then
    echo "usage: source ./prisma_env_vars.sh <user> <password> <url> <optional: db_connection_suffix>";
    exit 1;
fi;

# TODO update new module script to append to this file
# Sets env vars to connect to each Prisma database.
export DATABASE_URL=postgresql://$1:$2@$3/devconsole$4
export ALERTS_DATABASE_URL=postgresql://$1:$2@$3/alerts$4
export ABI_DATABASE_URL=postgresql://$1:$2@$3/abi$4
export RPCSTATS_DATABASE_URL=postgresql://$1:$2@$3/rpcstats$4