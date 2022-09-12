-- This migration creates a role that is used by a Kafka instance run by the SRE team to save RPC stats to this rpcstats DB.
-- This role should only have access to the tables that are required by their queries.
-- We create a user that assigned to this role outside of Prisma on each db:
--   CREATE USER rpc_kafka_connect WITH PASSWORD 'add a pass';
--   GRANT fullaccess_rpcstats TO rpc_kafka_connect;

-- When performing a migrate reset in Prisma, the role will already exist so let's skip if already exists.
DO
$do$
BEGIN
    IF EXISTS (SELECT rolname FROM pg_catalog.pg_roles WHERE rolname = 'fullaccess_rpcstats') THEN
        RAISE NOTICE 'Role "fullaccess_rpcstats" already exists. Skipping.';
    ELSE
        CREATE ROLE fullaccess_rpcstats;
        -- If you are looking to drop this role, this should be helpful:
        --   DROP OWNED BY fullaccess_rpcstats;
        --   DROP ROLE IF EXISTS fullaccess_rpcstats;
    END IF;
END
$do$;

GRANT CONNECT ON DATABASE rpcstats TO fullaccess_rpcstats;

GRANT USAGE ON SCHEMA public TO fullaccess_rpcstats;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fullaccess_rpcstats;
