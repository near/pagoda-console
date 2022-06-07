-- This migration creates a role that is used by the Data Platform team to run the Alerts Indexer.
-- This role should only have access to the tables that are required by their queries.
-- We create a user that assigned to this role outside of Prisma on each db:
--   CREATE USER data_alerts_indexer WITH PASSWORD 'add a pass';
--   GRANT read_alerts TO data_alerts_indexer;

-- When performing a migrate reset in Prisma, the role will already exist so let's skip if already exists.
DO
$do$
BEGIN
    IF EXISTS (SELECT rolname FROM pg_catalog.pg_roles WHERE rolname = 'read_alerts') THEN
        RAISE NOTICE 'Role "read_alerts" already exists. Skipping.';
    ELSE
        CREATE ROLE read_alerts;
        -- If you are looking to drop this role, this should be helpful:
        --   DROP OWNED BY read_alerts;
        --   DROP ROLE IF EXISTS read_alerts;
    END IF;
END
$do$;

-- Grant access to the specific database depending on environment.
DO
$do$
BEGIN
    IF EXISTS (SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = 'pgdb') THEN
        -- local
        GRANT CONNECT ON DATABASE pgdb TO read_alerts;
    ELSE
        -- dev, prod
        GRANT CONNECT ON DATABASE devconsole TO read_alerts;
    END IF;
END
$do$;

GRANT USAGE ON SCHEMA public TO read_alerts;

GRANT SELECT ON TABLE "Alert" TO read_alerts;
GRANT SELECT ON TABLE "FnCallRule" TO read_alerts;
GRANT SELECT ON TABLE "TxRule" TO read_alerts;
GRANT SELECT ON TABLE "EventRule" TO read_alerts;
GRANT SELECT ON TABLE "AcctBalRule" TO read_alerts;
GRANT SELECT ON TABLE "Contract" TO read_alerts;
GRANT SELECT ON TABLE "Environment" TO read_alerts;