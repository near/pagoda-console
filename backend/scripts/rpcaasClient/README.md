## Generated RPCaaS Client

### Forwarding EMS dev instance to localhost

Follow the insctructions here, to setup a port forwarding from the EMS instance to the localhost: https://nearinc.atlassian.net/wiki/spaces/EAP/pages/96010677/RPCaaS+API+token+operations+manual

### Swagger Codegen

Swagger Codegen needs to be installed:

`brew install swagger-codegen`

Official GH: https://github.com/swagger-api/swagger-codegen

### Generating the client

Run the script with the swagger json endpoint as an argument:

`./generate_rpcaas_client.sh http://127.0.0.1:8082/openapi.json`
