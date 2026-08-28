insert into agents(id,name,wallet_address,status) values('11111111-1111-4111-8111-111111111111','Pearl Demo Agent','g1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq','active') on conflict do nothing;
insert into agent_policies(id,agent_id,enabled,network,allowed_recipients,allowed_assets,max_per_payment,daily_budget,monthly_budget,approval_threshold,valid_from,valid_until)
values('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111',true,'gno:pearl-1',array['g1pppppppppppppppppppppppppppppppppppppp'],array['gno.land/r/gnoland/wugnot'],1000000,10000000,100000000,250000,now(),now()+interval '10 years') on conflict do nothing;
insert into service_budgets(agent_id,service,per_request,daily_budget,monthly_budget,enabled)
values
  ('11111111-1111-4111-8111-111111111111','akash-inference',1000000,10000000,100000000,true),
  ('11111111-1111-4111-8111-111111111111','akash-deployment',5000000,20000000,200000000,true),
  ('11111111-1111-4111-8111-111111111111','filecoin-storage',2000000,10000000,100000000,true),
  ('11111111-1111-4111-8111-111111111111','filecoin-retrieval',1000000,5000000,50000000,true)
on conflict(agent_id,service) do nothing;
insert into cosmos_agent_policies(id,agent_id,enabled,allowed_networks,allowed_recipients,allowed_denoms,allowed_fee_granters,allowed_ibc_channels,max_per_payment,daily_budget,monthly_budget)
values('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111',true,array['cosmos:localnet-1'],array['cosmos1pppppppppppppppppppppppppppppppppppppp'],array['uatom'],array[]::text[],array['channel-0'],1000000,10000000,100000000)
on conflict(id) do nothing;
