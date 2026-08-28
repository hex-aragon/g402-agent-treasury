# Akash gateway runbook

## Safe rollout

Start with AKASH_MOCK=true and both deployment flags false. Apply migrations, create agents and service budgets, then run tests/build and the Akash staging E2E. Configure provider JSON/API keys only in secret storage. Inference can be enabled separately from on-chain deployments.

## Inference incidents

For elevated 5xx, inspect circuit state and provider health without logging prompts. Remove a provider from routing, rotate its key, and replay only failed requests with the same idempotency key. A succeeded request is returned from durable cache and must not be billed again.

## Deployment incidents

Disable AKASH_ENABLE_DEPLOYMENTS to stop new workload creation; keep the lifecycle worker running so paid active leases close. If the Console API is unavailable, alert on overdue close_after records and retry DELETE idempotently. Never mark a deployment closed until Console returns success/404 or chain state confirms closure.

Before unlocking live Akash spend, contract-test create, bids, lease and delete response shapes; set an explicit provider allowlist and maximum bid; verify the worker lease; and use a dedicated Console wallet with a bounded balance. AKASH_ALLOW_MAINNET requires two-person approval.

Metrics: alert on provider failure rate above 5%, circuit open, quote-to-consume below 70%, requests stuck processing over five minutes, creating deployments over ten minutes, and any close overdue by five minutes.
