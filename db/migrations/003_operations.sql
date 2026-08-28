create table if not exists rate_limit_buckets(key_hash char(64) not null,window_start timestamptz not null,count integer not null,primary key(key_hash,window_start));
create table if not exists indexer_jobs(id uuid primary key,network varchar(80) not null,from_height bigint not null,to_height bigint not null,status varchar(20) not null check(status in('queued','running','complete','failed')),attempts integer not null default 0,last_error varchar(500),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists indexer_jobs_claim_idx on indexer_jobs(status,created_at);
insert into schema_migrations(version) values('003_operations') on conflict do nothing;
