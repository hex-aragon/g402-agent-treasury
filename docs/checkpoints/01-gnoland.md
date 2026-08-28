# Checkpoint 01 — GnoLand g402

Status: facilitator and g402pay realm code-complete for local/mock staging; live-chain promotion is blocked only by an operator staging address/key, faucet funds and Adena acceptance.

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
- native-GNOT `g402pay.Pay` realm with direct-EOA enforcement, atomic merchant forwarding, immutable receipts and events
- realm-mode facilitator/Adena transaction construction and exact contract-path, send, ID, recipient, amount, resource-hash and nonce verification
- contract event indexing with confirmation and reorg rollback

## External blockers

1. The current execution host does not have the official `gno`/`gnokey` release binaries or a funded staging key, so the realm cannot be compiled and uploaded here.
2. A live Adena realm-call transaction on the selected staging RPC is still required for wallet/browser acceptance.
3. Database, staging merchant and facilitator keys are absent from the hosted runtime.

## Live staging acceptance

Run the staging E2E script, complete one Adena signature in the wallet, settle only on staging, confirm settled status, retrieve the sample with x-payment-id, then test duplicate, altered fingerprint, expiry, approval, RPC outage and reorg cases.
