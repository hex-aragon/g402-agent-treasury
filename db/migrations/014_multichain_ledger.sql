do $$
begin
  if exists (
    select 1
    from payments
    where source = 'facilitator'
    group by nonce
    having count(*) > 1
  ) then
    raise exception using
      errcode = '23505',
      message = 'cannot add payments_facilitator_challenge_unique: duplicate facilitator challenge nonces exist';
  end if;

  if exists (
    select 1
    from payments
    where source = 'facilitator' and tx_hash is not null
    group by network, tx_hash
    having count(*) > 1
  ) then
    raise exception using
      errcode = '23505',
      message = 'cannot add payments_facilitator_network_tx_unique: duplicate facilitator network/transaction pairs exist';
  end if;
end $$;

create unique index if not exists payments_facilitator_challenge_unique on payments(nonce) where source='facilitator';
create unique index if not exists payments_facilitator_network_tx_unique on payments(network,tx_hash) where source='facilitator' and tx_hash is not null;
create index if not exists payments_network_asset_created_idx on payments(network,asset,created_at desc);
create index if not exists payments_network_tx_idx on payments(network,tx_hash);
insert into schema_migrations(version) values('014_multichain_ledger') on conflict do nothing;
