alter table akash_requests drop constraint if exists akash_requests_kind_check;
alter table akash_requests add constraint akash_requests_kind_check check(kind in('inference','deployment','storage','retrieval','search'));
insert into schema_migrations(version) values('011_service_request_kinds') on conflict do nothing;
