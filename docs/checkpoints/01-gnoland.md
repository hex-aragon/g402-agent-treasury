# Checkpoint 01 — GnoLand g402

Status: code-complete for local/mock staging; live-chain promotion is blocked by wallet acceptance and deployment credentials.

## Completed

- x402 v2 exact validation for gno chain IDs
- Adena connection and browser Sign request for native/GRC20 transfers
- official gno-js-client/TM2 transaction decoding, sign-byte reconstruction, secp256k1 verification and signer-address derivation
- resource, chain, nonce, expiry, ID, recipient, asset and amount binding
- PostgreSQL idempotency, replay protection and durable approvals
- agent allowlists, per-payment, daily/monthly budgets and approval threshold
- persistent block/checkpoint indexer, confirmations, rewind and reverted payments
- shared rate limiting, audit, metrics/alerts, migrations/seed and paid sample
- explorer, wallet, CI, Docker/Vercel files, threat model and runbook

## External blockers

1. The official codec and signed-vector tests pass locally; a live Adena extension transaction on the selected staging RPC is still required for wallet/browser acceptance.
2. Database, staging merchant, facilitator keys and operator RPC credentials are absent here.
3. Vercel API access is blocked in this execution environment; the repo remains directly importable.

## Live staging acceptance

Run the staging E2E script, complete one Adena signature in the wallet, settle only on staging, confirm settled status, retrieve the sample with x-payment-id, then test duplicate, altered fingerprint, expiry, approval, RPC outage and reorg cases.
