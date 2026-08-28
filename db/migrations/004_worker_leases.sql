create table if not exists worker_leases(name varchar(120) primary key,owner_id uuid not null,expires_at timestamptz not null,heartbeat_at timestamptz not null default now());
create index if not exists audit_log_created_idx on audit_log(created_at desc);
insert into schema_migrations(version) values('004_worker_leases') on conflict do nothing;
