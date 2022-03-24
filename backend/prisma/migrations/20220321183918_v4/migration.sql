create extension hstore;

create table "Audit" (
    "id" serial not null,
    "tableName" text not null,
    "rowId" integer not null,
    "userId" integer not null,
    "actionTimestamp" timestamp not null default current_timestamp,
    "action" text not null check (action in ('i','u')),
    "oldValues" hstore,
    "newValues" hstore,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

create or replace function if_modified_func() returns trigger as $body$
begin
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

-- IMPORTANT - make sure these tables have an unique field named `id`. Otherwise, it may be impossible to determine which row the audit row references.
create trigger "TeamAudit" after insert or update on "Team" for each row execute procedure if_modified_func();
create trigger "ProjectAudit" after insert or update on "Project" for each row execute procedure if_modified_func();
create trigger "EnvironmentAudit" after insert or update on "Environment" for each row execute procedure if_modified_func();
create trigger "ContractAudit" after insert or update on "Contract" for each row execute procedure if_modified_func();
