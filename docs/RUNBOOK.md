# g402 operations runbook

## Deployment gates

Apply migrations and use the seed only in disposable staging. Pass tests, typecheck, build, health and staging E2E. Web and worker use the same database. Keep mainnet false everywhere.

## Emergency stop

Set G402_ENABLE_SETTLEMENT=false, redeploy, verify health and leave verification/explorer online. Record actor and incident ID. Do not delete rows. Reconcile transactions already accepted by an RPC by hash.

## Alerts and first response

Page on settlement failure spikes, indexer lag above 20 blocks, any reorg, database errors above 1%, or rate-limit saturation above 10% for five minutes.

1. Disable settlement if funds, signatures, chain state or RPC consistency are uncertain.
2. Preserve application, database and RPC logs.
3. Classify affected payment IDs and block range.
4. Reconcile against two RPCs before changing status.
5. Recover only after the worker reaches canonical head.

## Reorg and stuck states

Stop settlement if a reorg exceeds INDEXER_MAX_REORG_DEPTH. The worker marks replaced blocks non-canonical and affected payments reverted, then replays. Never manually advance checkpoints.

- approval_required: confirm approver and fingerprint, then approve. Retry atomically moves to settling.
- settling: search logs and mempool by payment memo. Do not rebroadcast until absence is proven.
- broadcast: wait for confirmation target; reconcile hash after SLO.
- reverted: deny resource access and investigate; do not auto-refund before canonical ownership is confirmed.

## Database and credentials

Enable point-in-time recovery and test restores daily. Validate unique IDs, fingerprints, nonces and checkpoint hashes. Retain audit rows per policy and delete expired rate buckets only in bounded batches. Rotate facilitator, indexer and webhook keys independently; never place them in Git, tickets or browser storage.

## Mainnet unlock

Mainnet unlock is outside staging. It requires a live Adena staging vector against the pinned official codec, two RPCs, external review, load/reorg tests and two-person approval. Both flags remain independently controlled.
