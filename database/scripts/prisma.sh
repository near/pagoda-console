#!/bin/sh

if [ -z "$1" ]
then
    echo "usage: ./scripts/prisma.sh <sub_command>";
    exit 1;
fi;


rm -rf ./node_modules/.prisma
rm -rf ./node_modules/@prisma

echo "Generating prisma clients..."
npx prisma "$@" --schema="./schemas/core/schema.prisma"
npx prisma "$@" --schema="./schemas/alerts/schema.prisma"
npx prisma "$@" --schema="./schemas/abi/schema.prisma"
npx prisma "$@" --schema="./schemas/rpcstats/schema.prisma"
