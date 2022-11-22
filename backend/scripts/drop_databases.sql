-- Drops all databases within an environment. 
-- This is useful if you want to destroy a SQL instance.
-- TODO automatically append to this file when a devconsole module is created
DROP DATABASE IF EXISTS devconsole WITH (FORCE);
DROP DATABASE IF EXISTS alerts WITH (FORCE);
DROP DATABASE IF EXISTS abi WITH (FORCE);
DROP DATABASE IF EXISTS rpcstats WITH (FORCE);