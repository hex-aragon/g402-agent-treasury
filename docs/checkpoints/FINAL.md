# Final implementation checkpoint

Status: the Gno facilitator and Scan are deployed on Pearl as a Vercel Next.js application backed by dedicated Neon PostgreSQL. Scan currently runs as a bearer-protected bounded snapshot once daily at 03:00 UTC; the Railway persistent-indexer topology is code-ready but not deployed. All mainnet movement remains disabled. Akash, Filecoin and Cosmos remain separately gated local/mock products.

## Delivered in order

1. GnoLand g402: official TM2/Adena transaction verification, PostgreSQL-backed challenges, exact WUGNOT facilitator, paid sample, wallet, explorer and reorg-aware indexer.
2. Akash x402: OpenAI-compatible inference, quote/metering, provider routing, bounded deployments and lifecycle worker.
3. Filecoin/IPFS x402: raw CID upload, paid search/retrieval, Pay/Paych adapters, receipts and proof reconciliation.
4. Cosmos native x402: CAIP-2 registry, DirectSign bank/IBC/feegrant verification, Keplr flow, policy and idempotent settlement.

Shared delivery includes PostgreSQL migrations `001`–`015` as the authoritative schema. Migration `015_railway_scan` adds the checkpoint, canonical block, transaction, and event structures used by scheduled and persistent indexing. Shared delivery also includes persistent rate limiting, audit events, metrics/alerts, CI, dashboards, probes, threat models, and runbooks.

## Current verification on 2026-09-03

- root `npm test`: 118/118 passed
- strict TypeScript: passed
- recorded real-wallet payments: 0 across Base Sepolia, Solana Devnet, and Gno Pearl

## Historical verification on 2026-08-28

- clean offline `npm ci`: 169 packages installed from the committed lockfile
- tests: 53/53 passed in the root `npm test` command (service 21, chain/facilitator 32)
- strict TypeScript: passed
- `npm audit --audit-level=high --offline`: 0 vulnerabilities
- Drizzle schema check: passed
- At that checkpoint, the hosting build and deployment status remained release-workflow gates; the active build target is now Vercel Next.js.

## External acceptance blockers

- Each advertised testnet rail still needs a recorded user-authorized wallet acceptance on the exact release build before any live-settlement claim. The service never receives that key.
- The optional `g402pay` realm is not deployed; direct WUGNOT mode is the active rail.
- Vercel Next.js with dedicated Neon PostgreSQL is the active deployment. Its protected `/api/cron/index` route runs one bounded Scan snapshot daily at 03:00 UTC. Continuous indexing remains a future Railway persistent-worker deployment.
- Live credentials remain absent for AkashML/Console, Filecoin Calibration/IPFS/Lotus and a selected Cosmos testnet/Keplr account.
- Load, chaos/reorg, backup restore and independent security review are release gates, not silently waived.

See `docs/RELEASE_CHECKLIST.md` for the exact promotion sequence. Keep every mainnet allow flag false on Pearl.
