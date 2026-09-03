# g402 operations runbook

## Deployment gates

For current production, PostgreSQL is authoritative. Confirm migrations `001`–`015`, including `015_railway_scan`, are applied to the dedicated Neon database. Pass tests, typecheck, the Next.js production build, Vercel deployment checks, `/api/live`, `/api/health`, unauthenticated cron rejection, an authorized bounded cron run, and Pearl E2E. The latest local baseline is 118/118 tests on 2026-09-03; rerun it on the exact release commit. Keep mainnet false everywhere.

Recorded real-wallet payments remain 0 across Base Sepolia, Solana Devnet, and Gno Pearl. Treat this as an open acceptance gate, not an incident.

Vercel invokes bearer-protected `GET /api/cron/index` once daily at 03:00 UTC. Each invocation runs one bounded tick, so `/scan` is a scheduled snapshot rather than a continuous explorer. After Railway can be provisioned, one persistent worker can provide continuous indexing against private PostgreSQL.

For realm mode, first run `gno fmt`, `gno lint` and `gno test` using the official binary for the target release, deploy with `npm run contract:gno:deploy`, query the package source, and complete the acceptance list in `docs/GNO_CONTRACT.md`. Enable `G402_PAYMENT_MODE=realm` only after the deployed path and merchant receipt have been independently verified.

## Emergency stop

`G402_ENABLE_SETTLEMENT=false` stops the native Gno broadcaster only. To stop new v2 EVM/Solana challenge and settlement requests, set `FACILITATOR_PUBLIC=false` and redeploy with no public API key; use a separately controlled bearer key only if recovery access is required. Verify health, record the actor and incident ID, and do not delete rows.

If the on-chain realm is suspected, also set `G402_PAYMENT_MODE=direct`, keep settlement disabled, and reconcile every `G402Payment` event against merchant balance changes before recovery. A deployed realm is immutable; a contract defect requires a new package path and explicit configuration change.

## Alerts and first response

On Vercel, page on a failed or missed authorized 03:00 UTC cron run, checkpoint age above 25 hours, `indexer_checkpoints.last_error`, any reorg, database errors above 1%, or rate-limit saturation above 10% for five minutes. For a future Railway persistent worker, additionally page on lag above its strict threshold, a stale lease, or stopped checkpoint progress.

1. Disable settlement if funds, signatures, chain state or RPC consistency are uncertain.
2. Preserve application, database and RPC logs.
3. Classify affected payment IDs and block range.
4. Reconcile against two RPCs before changing status.
5. Run one approved bearer-authenticated cron tick and inspect its result. Recover only after the checkpoint follows the canonical chain.

## Reorg and stuck states

Stop settlement if a reorg exceeds the configured maximum depth. Scan locates a common ancestor, preserves orphaned blocks as non-canonical, marks affected payments reverted and replays. Never manually advance checkpoints.

- approval_required: confirm approver and fingerprint, then approve. Retry atomically moves to settling.
- Gno settling: search logs and mempool by payment memo. Do not rebroadcast until absence is proven under the native Gno procedure.
- v2 settling/broadcast with transaction hash: resend only the identical settlement request to trigger read-only EVM/Solana chain reconciliation. The handler must not call facilitator settlement again.
- v2 settling/broadcast without transaction hash: treat as manual pending. Search facilitator and chain records using the server-issued payment/challenge IDs, but do not automatically re-submit.
- v2 known transaction: EVM reconciliation requires a finalized receipt, exact EIP-3009 call and Transfer log; Solana requires finalized status and the latest review-time message hash.
- reverted: deny resource access and investigate; do not auto-refund before canonical ownership is confirmed.

## PostgreSQL and Scan recovery

1. Disable settlement but leave `/scan` and verification available.
2. Record the checkpoint, chain tip and last canonical block hash.
3. If the stored parent differs, use the indexer rewind path; never delete fork rows.
4. On Vercel, invoke one approved bearer-authenticated `GET /api/cron/index` tick at a time and inspect each result. Scheduled mode may intentionally reanchor an old gap rather than reconstruct it; `POST /api/internal/index` does not start indexing and returns 409. On a future Railway deployment, allow only the singleton persistent worker to replay the range.
5. Confirm payment confirmations and paid-resource authorization after reconciliation.

## Database and credentials

Back up the authoritative Neon PostgreSQL database and test restore procedures. Confirm `schema_migrations` includes `015_railway_scan`, then validate unique IDs, fingerprints, nonces, checkpoint hashes, and canonical indexes. Retain audit rows per policy and delete expired challenges or rate buckets only in bounded batches. Enable point-in-time recovery where the Neon plan supports it. Rotate facilitator, cron, and webhook keys independently; never place them in Git, tickets, or browser storage. Legacy hosting database artifacts are not a production recovery source.

## Mainnet unlock

Mainnet unlock is outside this release. Ethereum and Solana each require their family-specific allow and settlement flags, verified merchant configuration, production facilitator support, reconciliation RPCs, external review, limits, and two-person approval. Gno separately requires its allow/settlement flags, explicit mainnet chain configuration, a live Adena acceptance vector, redundant RPC review, and the same operational gates.
