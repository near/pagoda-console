#!/bin/sh

if [ -z $1 ] 
then
    echo "usage: ./generate_rpcaas_client.sh <RPC swagger endpoint>";
    exit 1;
fi;

swagger-codegen generate -i $1 -l typescript-axios -c config.json -o ../../src/core/keys/rpcaas-client