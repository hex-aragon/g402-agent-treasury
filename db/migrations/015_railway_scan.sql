alter table indexer_checkpoints
  add column if not exists chain_height bigint not null default 0,
  add column if not exists last_error text;

alter table indexed_blocks
  add column if not exists block_time timestamptz,
  add column if not exists tx_count integer not null default 0;

alter table indexed_blocks drop constraint if exists indexed_blocks_pkey;
alter table indexed_blocks
  add constraint indexed_blocks_pkey primary key(network,height,block_hash);

create unique index if not exists indexed_blocks_canonical_height_unique
  on indexed_blocks(network,height)
  where canonical;
create index if not exists indexed_blocks_hash_idx on indexed_blocks(block_hash);

create table if not exists chain_transactions(
  tx_hash varchar(128) primary key,
  network varchar(80) not null,
  height bigint not null,
  tx_index integer not null,
  block_hash varchar(128) not null,
  block_time timestamptz,
  code integer not null default 0,
  log text,
  memo text,
  signer varchar(160),
  recipient varchar(160),
  asset varchar(220),
  amount text,
  kind varchar(24),
  payment_id varchar(128),
  nonce varchar(128),
  resource_hash char(64),
  canonical boolean not null default true,
  indexed_at timestamptz not null default now()
);

create index if not exists chain_transactions_height_idx
  on chain_transactions(network,height desc,tx_index desc);
create index if not exists chain_transactions_payment_idx
  on chain_transactions(payment_id);
create index if not exists chain_transactions_signer_idx
  on chain_transactions(signer);
create index if not exists chain_transactions_recipient_idx
  on chain_transactions(recipient);

create table if not exists chain_events(
  id varchar(180) primary key,
  tx_hash varchar(128) not null,
  network varchar(80) not null,
  height bigint not null,
  event_type varchar(300) not null,
  attributes jsonb not null default '{}',
  canonical boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists chain_events_tx_idx on chain_events(tx_hash);
create index if not exists chain_events_height_idx on chain_events(network,height);

insert into schema_migrations(version)
values('015_railway_scan')
on conflict do nothing;
