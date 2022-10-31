 CREATE SCHEMA IF NOT EXISTS meta;
 DROP TABLE IF EXISTS meta."Audit";
 ALTER TABLE "Audit" SET SCHEMA meta;

create or replace function if_modified_func() returns trigger as $body$
begin
    if tg_op = 'UPDATE' then
        insert into meta."Audit" ("tableName", "rowId", "userId", "action", "oldValues", "newValues")
        values (tg_table_name::text, new."id", new."updatedBy", 'u', hstore(old.*) - hstore(new.*), hstore(new.*) - hstore(old.*));
        return new;
    elsif tg_op = 'INSERT' then
        insert into meta."Audit" ("tableName", "rowId", "userId", "action", "newValues")
        values (tg_table_name::text, new."id", new."updatedBy", 'i', hstore(new.*));
        return new;
    end if;
end;
$body$
language plpgsql;