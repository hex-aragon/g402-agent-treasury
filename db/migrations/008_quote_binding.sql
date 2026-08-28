alter table payments add column if not exists service_quote_id uuid;
create index if not exists payments_service_quote_idx on payments(service_quote_id);
insert into schema_migrations(version) values('008_quote_binding') on conflict do nothing;
