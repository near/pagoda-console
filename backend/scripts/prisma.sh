#!/bin/sh

if [ -z "$1" ]
then
    echo "usage: ./prisma_migrate.sh <sub_command>";
    exit 1;
fi;

npx prisma "$@" --schema="./src/core/prisma/schema.prisma"
npx prisma "$@" --schema="./src/modules/alerts/prisma/schema.prisma"
npx prisma "$@" --schema="./src/modules/abi/prisma/schema.prisma"
