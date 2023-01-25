create or replace function if_modified_func() returns trigger as $body$
begin
    if new."updatedBy" is null then
      RAISE EXCEPTION 'Audit trigger requires updatedBy to be set on table %s on %s. On INSERT, please set createdBy and updatedBy to the same user. On UPDATE, please set updatedBy.', tg_table_name::text, tg_op;
    end if;

    if tg_op = 'UPDATE' then
        insert into "Audit" ("tableName", "rowId", "userId", "action", "oldValues", "newValues")
        values (tg_table_name::text, new."id", new."updatedBy", 'u', hstore(old.*) - hstore(new.*), hstore(new.*) - hstore(old.*));
        return new;
    elsif tg_op = 'INSERT' then
        insert into "Audit" ("tableName", "rowId", "userId", "action", "newValues")
        values (tg_table_name::text, new."id", new."updatedBy", 'i', hstore(new.*));
        return new;
    end if;
end;
$body$
language plpgsql;
