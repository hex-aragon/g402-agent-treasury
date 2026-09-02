# g402 operations runbook

## Deployment gates

For the Site topology, confirm the packaged Drizzle migration applies to the `DB` D1 binding. Pass tests, typecheck, Sites checkpoint build, deployment status, health and Pearl E2E. Keep mainnet false everywhere. The PostgreSQL seed is only for the optional disposable container environment.

For realm mode, first run `gno fmt`, `gno lint` and `gno test` using the official binary for the target release, deploy with `npm run contract:gno:deploy`, query the package source, and complete the acceptance list in `docs/GNO_CONTRACT.md`. Enable `G402_PAYMENT_MODE=realm` only after the deployed path and merchant receipt have been independently verified.

## Emergency stop

`G402_ENABLE_SETTLEMENT=false` stops the native Gno broadcaster only. To stop new v2 EVM/Solana challenge and settlement requests, set `FACILITATOR_PUBLIC=false` and redeploy with no public API key; use a separately controlled bearer key only if recovery access is required. Verify health, record the actor and incident ID, and do not delete rows.

If the on-chain realm is suspected, also set `G402_PAYMENT_MODE=direct`, keep settlement disabled, and reconcile every `G402Payment` event against merchant balance changes before recovery. A deployed realm is immutable; a contract defect requires a new package path and explicit configuration change.

## Alerts and first response

Page on settlement failure spikes, indexer lag above 20 blocks, any reorg, database errors above 1%, or rate-limit saturation above 10% for five minutes.

1. Disable settlement if funds, signatures, chain state or RPC consistency are uncertain.
2. Preserve application, database and RPC logs.
3. Classify affected payment IDs and block range.
4. Reconcile against two RPCs before changing status.
5. Run a bounded authenticated Scan sync and recover only after the checkpoint follows the canonical chain.

## Reorg and stuck states

Stop settlement if a reorg exceeds the configured maximum depth. Scan locates a common ancestor, preserves orphaned blocks as non-canonical, marks affected payments reverted and replays. Never manually advance checkpoints.

- approval_required: confirm approver and fingerprint, then approve. Retry atomically moves to settling.
- Gno settling: search logs and mempool by payment memo. Do not rebroadcast until absence is proven under the native Gno procedure.
- v2 settling/broadcast with transaction hash: resend only the identical settlement request to trigger read-only EVM/Solana chain reconciliation. The handler must not call facilitator settlement again.
- v2 settling/broadcast without transaction hash: treat as manual pending. Search facilitator and chain records using the server-issued payment/challenge IDs, but do not automatically re-submit.
- v2 known transaction: EVM reconciliation requires a finalized receipt, exact EIP-3009 call and Transfer log; Solana requires finalized status and the latest review-time message hash.
- reverted: deny resource access and investigate; do not auto-refund before canonical ownership is confirmed.

## D1 recovery

1. Disable settlement but leave `/scan` and verification available.
2. Record the checkpoint, chain tip and last canonical block hash.
3. If the stored parent differs, use the indexer rewind path; never delete fork rows.
4. Re-run `POST /api/internal/index` in bounded batches until lag is acceptable.
5. Confirm payment confirmations and paid-resource authorization after reconciliation.

## Database and credentials

Export or back up D1 according to the hosting plan and test restore procedures. Validate unique IDs, fingerprints, nonces and checkpoint hashes. Retain audit rows per policy and delete expired challenges/rate buckets only in bounded batches. Rotate facilitator and webhook keys independently; never place them in Git, tickets or browser storage. PostgreSQL deployments should additionally enable point-in-time recovery.

## Mainnet unlock

Mainnet unlock is outside this release. Ethereum and Solana each require their family-specific allow and settlement flags, verified merchant configuration, production facilitator support, reconciliation RPCs, external review, limits, and two-person approval. Gno separately requires its allow/settlement flags, explicit mainnet chain configuration, a live Adena acceptance vector, redundant RPC review, and the same operational gates.
