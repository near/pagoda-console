#!/bin/sh

#* This script is helpful before immediately calling `prisma.sh`.

if [ -z "$DB_USER" ]
then
    echo "Missing DB_USER variable";
    exit 1;
fi;

if [ -z "$DB_PASS" ]
then
    echo "Missing DB_PASS variable";
    exit 1;
fi;

if [ -z "$DB_URL" ]
then
    echo "Missing DB_URL variable";
    exit 1;
fi;

# TODO update new module script to append to this file
# Sets env vars to connect to each Prisma database.
export DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_URL/devconsole
export ALERTS_DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_URL/alerts
export ABI_DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_URL/abi
export RPCSTATS_DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_URL/rpcstats
