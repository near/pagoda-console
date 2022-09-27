#!/bin/sh

#* This script is helpful before immediately calling `prisma.sh`.
#* In order to get the exported variables to stick properly, you will
#* need to prefix the script command with a `.` or the word `source`
#* in order to "source" the variables.
#*
#* e.g. `. ./export_prisma_env_vars.sh ...` or `source ./export_prisma_env_vars.sh ...`

echo "I was given $# argument(s):"
printf "%s\n" "$@"

if [ -z "$3" ]
then
    echo "usage: source ./export_prisma_env_vars.sh <user> <password> <url>";
    exit 1;
fi;

# TODO update new module script to append to this file
# Sets env vars to connect to each Prisma database.
export DATABASE_URL=postgresql://$1:$2@$3/devconsole
export ALERTS_DATABASE_URL=postgresql://$1:$2@$3/alerts
export ABI_DATABASE_URL=postgresql://$1:$2@$3/abi
export RPCSTATS_DATABASE_URL=postgresql://$1:$2@$3/rpcstats