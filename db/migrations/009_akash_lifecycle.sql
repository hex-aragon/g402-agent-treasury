alter table akash_deployments add column if not exists attempts integer not null default 0;
insert into schema_migrations(version) values('009_akash_lifecycle') on conflict do nothing;
