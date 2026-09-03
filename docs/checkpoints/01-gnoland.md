# Checkpoint 01 — GnoLand g402

Status: the Pearl direct-WUGNOT facilitator and Scan are deployed in a Vercel Next.js application backed by a dedicated Neon PostgreSQL database. Production runs one bearer-protected bounded Scan snapshot daily at 03:00 UTC; the future Railway persistent topology is code-ready but not deployed. Gno mainnet is locked, and the optional `g402pay` realm is source-complete but not deployed.

## Completed

- x402 v2 exact validation for gno chain IDs
- Adena connection and browser Sign request for native/GRC20 transfers
- official gno-js-client/TM2 transaction decoding, sign-byte reconstruction, secp256k1 verification and signer-address derivation
- resource, chain, nonce, expiry, ID, recipient, asset and amount binding
- PostgreSQL-backed challenges, atomic nonce/payment claims and durable self-test receipts
- shared PostgreSQL rate limiting, audit log and paid sample resource binding
- bounded scheduled/persistent block indexer, fork history, common-ancestor rewind, confirmations and reverted payments
- block/transaction/address/payment search, wallet flow, health and operations dashboard
- PostgreSQL agent allowlists, per-payment/day/month budgets and approval threshold
- native-GNOT `g402pay.Pay` realm with direct-EOA enforcement, atomic merchant forwarding, immutable receipts and events
- realm-mode facilitator/Adena transaction construction and exact contract-path, send, ID, recipient, amount, resource-hash and nonce verification
- contract event indexing with confirmation and reorg rollback

## Remaining external acceptance

1. A user must connect Adena to Pearl, obtain faucet WUGNOT and approve one live `SignTx` in the browser. No private key is held by the service.
2. Realm mode requires the official Pearl `gno`/`gnokey` release, a funded deployer and a separately reviewed deployment path.
3. Recorded real-wallet payments remain 0 for this release. Self-test receipts and automated checks do not prove merchant acceptance or live settlement.

## Current verification

- 118/118 automated tests passed on 2026-09-03.
- Dedicated Neon PostgreSQL is the production state authority, with schema current through `db/migrations/015_railway_scan.sql`.

## Live staging acceptance

Open `/wallet`, connect Adena on `pearl-1`, sign the self-transfer challenge, settle, and retrieve the paid sample. Invoke the protected bounded index route as an operator or wait for the next 03:00 UTC run before expecting the transaction in `/scan`. Then exercise duplicate ID, altered terms, expiry, RPC outage, and reorg recovery. Do not enable realm mode or mainnet during this acceptance.
