# Checkpoint 01 — GnoLand g402

Status: the Pearl direct-WUGNOT facilitator and D1 Scan are release-ready for the private Site. Gno mainnet is locked. The optional `g402pay` realm is source-complete but not deployed.

## Completed

- x402 v2 exact validation for gno chain IDs
- Adena connection and browser Sign request for native/GRC20 transfers
- official gno-js-client/TM2 transaction decoding, sign-byte reconstruction, secp256k1 verification and signer-address derivation
- resource, chain, nonce, expiry, ID, recipient, asset and amount binding
- D1-issued challenges, atomic nonce/payment claims and durable self-test receipts
- shared D1 rate limiting, audit log and paid sample resource binding
- persistent block/checkpoint indexer, fork history, common-ancestor rewind, confirmations and reverted payments
- block/transaction/address/payment search, wallet flow, health and operations dashboard
- optional PostgreSQL agent allowlists, per-payment/day/month budgets and approval threshold
- native-GNOT `g402pay.Pay` realm with direct-EOA enforcement, atomic merchant forwarding, immutable receipts and events
- realm-mode facilitator/Adena transaction construction and exact contract-path, send, ID, recipient, amount, resource-hash and nonce verification
- contract event indexing with confirmation and reorg rollback

## Remaining external acceptance

1. A user must connect Adena to Pearl, obtain faucet WUGNOT and approve one live `SignTx` in the browser. No private key is held by the service.
2. Realm mode requires the official Pearl `gno`/`gnokey` release, a funded deployer and a separately reviewed deployment path.
3. D1 self-test does not claim persistent agent policy/approval administration; that feature remains the PostgreSQL operator mode.

## Live staging acceptance

Open `/wallet`, connect Adena on `pearl-1`, sign the self-transfer challenge, settle, retrieve the paid sample and confirm the transaction in `/scan`. Then exercise duplicate ID, altered terms, expiry, RPC outage and reorg recovery. Do not enable realm mode or mainnet during this acceptance.
