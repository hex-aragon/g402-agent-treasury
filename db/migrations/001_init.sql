create extension if not exists pgcrypto;
create table if not exists schema_migrations(version text primary key,applied_at timestamptz not null default now());
create table if not exists payments(
 id uuid primary key,payment_id varchar(128) not null unique,fingerprint char(64) not null unique,
 nonce varchar(128) not null,tx_hash varchar(128),network varchar(80) not null,payer varchar(80) not null,
 pay_to varchar(80) not null,asset varchar(220) not null,amount numeric(78,0) not null check(amount>0),
 status varchar(24) not null check(status in('verifying','verified','approval_required','settling','broadcast','settled','failed','reverted')),
 error varchar(500),merchant_id uuid,agent_id uuid,policy_id uuid,block_height bigint,block_hash varchar(128),
 confirmations integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(network,payer,nonce)
);
create index if not exists payments_created_at_idx on payments(created_at desc);
create index if not exists payments_tx_hash_idx on payments(tx_hash);
create index if not exists payments_agent_budget_idx on payments(agent_id,status,created_at);
create table if not exists indexer_checkpoints(network varchar(80) primary key,height bigint not null,block_hash varchar(128) not null,parent_hash varchar(128),updated_at timestamptz not null default now());
create table if not exists indexed_blocks(network varchar(80) not null,height bigint not null,block_hash varchar(128) not null,parent_hash varchar(128),canonical boolean not null default true,indexed_at timestamptz not null default now(),primary key(network,height));
create table if not exists audit_log(id uuid primary key,actor varchar(160) not null,action varchar(100) not null,target varchar(300),metadata jsonb not null default '{}',created_at timestamptz not null default now());
insert into schema_migrations(version) values('001_init') on conflict do nothing;
