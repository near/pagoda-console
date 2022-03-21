create extension hstore;

create table "Audit" (
    "id" serial not null,
    "tableName" text not null,
    "userId" integer not null,
    "actionTimestamp" timestamp not null default current_timestamp,
    "action" text not null check (action in ('i','u')),
    "oldValues" hstore,
    "newValues" hstore,
    "updatedColumns" text[],
    "query" text,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

create or replace function if_modified_func() returns trigger as $body$
begin
    if tg_op = 'UPDATE' then
        insert into "Audit" ("tableName", "userId", "action", "oldValues", "newValues", "updatedColumns", "query")
        values (tg_table_name::text, new."updatedBy", 'u', hstore(old.*), hstore(new.*),
               akeys(hstore(new.*) - hstore(old.*)), current_query());
        return new;
    elsif tg_op = 'INSERT' then
        insert into "Audit" ("tableName", "userId", "action", "newValues", "query")
        values (tg_table_name::text, new."updatedBy", 'i', hstore(new.*), current_query());
        return new;
    end if;
end;
$body$
language plpgsql;

create trigger "TeamAudit" after insert or update on "Team" for each row execute procedure if_modified_func();
create trigger "TeamMemberAudit" after insert or update on "TeamMember" for each row execute procedure if_modified_func();
create trigger "ProjectAudit" after insert or update on "Project" for each row execute procedure if_modified_func();
create trigger "EnvironmentAudit" after insert or update on "Environment" for each row execute procedure if_modified_func();
create trigger "ContractAudit" after insert or update on "Contract" for each row execute procedure if_modified_func();
