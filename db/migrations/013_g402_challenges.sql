create table if not exists payment_challenges(
 nonce varchar(128) primary key,resource text not null,resource_hash char(64) not null,method varchar(12) not null,
 network varchar(80) not null,chain_id varchar(80) not null,asset varchar(220) not null,denom varchar(80) not null,
 amount numeric(78,0) not null,pay_to varchar(80) not null,payment_mode varchar(16) not null,
 contract_path varchar(256),extra jsonb not null default '{}',expires_at bigint not null,consumed_by varchar(128),created_at timestamptz not null default now()
);
create index if not exists payment_challenges_expiry_idx on payment_challenges(expires_at);
alter table payments add column if not exists resource_hash char(64);
alter table payments add column if not exists source varchar(20) not null default 'facilitator';
insert into schema_migrations(version) values('013_g402_challenges') on conflict do nothing;
