# Deployment guide

Production is [https://g402-agent-treasury.vercel.app](https://g402-agent-treasury.vercel.app). Vercel runs the Next.js application and API routes, and a dedicated Neon PostgreSQL database holds durable application and Scan state.

No real-wallet payment has yet been completed and recorded for this release on Base Sepolia, Solana Devnet, or Gno Pearl. A live page and passing automated tests are not evidence of live settlement or merchant revenue.

## Current topology and limitation

| Component | Platform | Current role |
| --- | --- | --- |
| Web and API | Vercel Next.js | Public UI, WebMCP, facilitator APIs, health, and Scan queries |
| Database | Dedicated Neon PostgreSQL | Migrations, challenges, payments, Scan data, checkpoints, leases, and audit records |
| Gno indexing | Protected Vercel Cron route | One bounded `/api/cron/index` run daily at 03:00 UTC |
| Railway | Not provisioned | Persistent topology is code-ready but blocked by the current free-plan resource limit |

Vercel Hobby cron is limited to one run per day. Production Scan data is therefore a daily snapshot, not a continuously advancing explorer or complete chain archive. Transactions mined after a run may remain absent until a later run, and the checkpoint can lag Pearl between invocations.

`vercel.json` schedules `GET /api/cron/index` at 03:00 UTC. The route:

- requires `Authorization: Bearer <CRON_SECRET>` and returns 401 when it is absent or wrong;
- runs one exported, bounded `runIndexerTick()` batch;
- uses a 300-second function ceiling with `INDEXER_TICK_MAX_MS=240000`;
- returns 503 on indexing failure.

Set `INDEXER_MODE=scheduled` on Vercel. If a checkpoint falls outside `INDEXER_BOOTSTRAP_DEPTH`, scheduled mode reanchors to a recent confirmed window. Previously stored canonical history is preserved and the intentionally skipped range is logged, but skipped historical transactions are not reconstructed.

## Vercel and Neon variables

Use Vercel secrets for all credentials. The production-specific baseline is:

```text
NODE_ENV=production
APP_URL=https://g402-agent-treasury.vercel.app
DATABASE_URL=<dedicated-neon-postgres-url>
DATABASE_POOL_MAX=5

CRON_SECRET=<high-entropy-secret>
INDEXER_MODE=scheduled
INDEXER_BOOTSTRAP_DEPTH=100
INDEXER_BATCH_SIZE=100
INDEXER_MAX_REORG_DEPTH=100
INDEXER_CONFIRMATIONS=2
INDEXER_TICK_MAX_MS=240000
INDEXER_LEASE_SECONDS=60
INDEXER_READY_MAX_LAG=20000
INDEXER_READY_MAX_AGE_MS=90000000
```

The worker ensures its effective lease covers a bounded tick even when the configured lease minimum is 60 seconds. `INDEXER_READY_MAX_LAG=20000` and `INDEXER_READY_MAX_AGE_MS=90000000` (25 hours) are allowances for the daily snapshot. They do not promise real-time indexing. Use much tighter readiness limits for a persistent worker.

The Pearl variables, access keys, recipient settings, and facilitator settings are listed in `.env.example`. Keep every mainnet gate explicitly false:

```text
G402_ALLOW_MAINNET=false
X402_ALLOW_EVM_MAINNET=false
X402_ENABLE_EVM_MAINNET_SETTLEMENT=false
X402_ALLOW_SOLANA_MAINNET=false
X402_ENABLE_SOLANA_MAINNET_SETTLEMENT=false
AKASH_ALLOW_MAINNET=false
FILECOIN_ALLOW_MAINNET=false
COSMOS_ALLOW_MAINNET=false
```

`CRON_SECRET`, `DATABASE_URL`, API keys, and facilitator bearer tokens are server-only. Never prefix them with `NEXT_PUBLIC_`, put them in URLs, or expose them in client props or logs. `NEXT_PUBLIC_GNO_RPC_URL` is browser-visible and must be credential-free HTTPS.

## Migrations

PostgreSQL migrations live under `db/migrations`; `scripts/migrate.ts` records completed versions in `schema_migrations`. Apply required migrations before deploying dependent code:

```bash
npm ci
DATABASE_URL='<target-postgres-url>' npm run db:migrate
```

Use a trusted secret-injected environment, verify the migration ledger afterward, and back up the database before non-additive changes. Never edit an applied migration or automatically seed production.

## Health and monitoring

- `GET /api/live` is dependency-free liveness. HTTP 200 does not prove database, RPC, payment, or indexer readiness.
- `GET /api/health` checks PostgreSQL, Pearl RPC and chain ID, required configuration, checkpoint error, age, and lag.
- Scheduled-mode readiness uses the documented 20,000-block and 25-hour allowances.

Monitor the daily cron result and duration, unauthorized or failed cron responses, `index_failed` and reanchor logs, `indexer_checkpoints.last_error`, checkpoint age and lag, Neon errors, and migration failures. A rendered `/scan` page does not prove the latest cron succeeded.

## Railway provisioning status

The Dockerfiles, Compose configuration, migrations, persistent worker, health routes, and PostgreSQL lease are ready. Provisioning a new isolated project with:

```bash
railway init --name g402-agent-treasury --json
```

was blocked by Railway with:

```text
Free plan resource provision limit exceeded. Please upgrade to provision more resources!
```

No existing Railway project was modified, deleted, or reused. Do not repurpose an unrelated project to bypass the limit.

## Railway topology after a plan upgrade

| Service | Build | Exposure | Role |
| --- | --- | --- | --- |
| `web` | `Dockerfile.web` | Public domain and `/api/live` healthcheck | Next.js UI/API and database-backed queries |
| `indexer` | `Dockerfile.worker`, one replica | Private; no domain or HTTP healthcheck | Continuous bounded indexing and reorg recovery |
| `Postgres` | Railway PostgreSQL | Private | Shared durable state and worker lease |

After upgrading Railway:

1. Create a new isolated `g402-agent-treasury` project and verify its identity before adding resources. Leave pre-existing projects untouched.
2. Add private Railway PostgreSQL, then add `web` and one `indexer` service from the same repository commit.
3. Configure `web` with `Dockerfile.web`, pre-deploy command `npm run db:migrate`, and healthcheck `/api/live`.
4. Configure `indexer` with `Dockerfile.worker`, no public domain, and restart-on-failure.
5. Set `DATABASE_URL=${{Postgres.DATABASE_URL}}` as a private reference on both services.
6. Copy the reviewed Pearl, access, recipient, facilitator, and explicit mainnet-lock variables.
7. Set `INDEXER_MODE=persistent` on both web and indexer. Compose already overrides both services to persistent mode.
8. Start with `INDEXER_READY_MAX_LAG=10` and `INDEXER_READY_MAX_AGE_MS=120000`, then tune from measured behavior.
9. If Neon records must move, take a consistent backup, restore it privately, run migrations, and compare migration versions, payment counts, and checkpoint state before enabling Railway writers. Never operate Neon and Railway PostgreSQL as independent production writers.
10. Deploy and migrate `web` first. Start `indexer` only after the migration ledger is current; verify lease renewal, continuous checkpoint progress, restart recovery, and `/api/health`.
11. Keep Vercel serving until Railway smoke checks and data comparison pass. Cut traffic over only after setting and verifying the final HTTPS `APP_URL`.

Persistent-worker controls:

```text
INDEXER_MODE=persistent
INDEXER_INTERVAL_MS=4000
INDEXER_BOOTSTRAP_DEPTH=100
INDEXER_BATCH_SIZE=20
INDEXER_MAX_REORG_DEPTH=100
INDEXER_CONFIRMATIONS=2
INDEXER_TICK_MAX_MS=45000
INDEXER_LEASE_SECONDS=60
INDEXER_READY_MAX_LAG=10
INDEXER_READY_MAX_AGE_MS=120000
```

The Railway indexer has no HTTP server. Monitor its process, structured logs, lease heartbeat, checkpoint freshness and lag, reorg alerts, and reverted payments.

## Acceptance and rollback

Before promotion, run `npm test`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`. Verify `/api/live`, `/api/health`, unauthenticated cron rejection, rail discovery, challenge binding, pending-payment behavior, the scheduled `/scan` label, and every mainnet lock.

Run staged checks against the actual production URL:

```bash
STAGING_BASE_URL=https://g402-agent-treasury.vercel.app \
STAGING_FACILITATOR_KEY='<secret-if-required>' \
npm run e2e:staging
```

Do not claim successful real-wallet payment acceptance until the transaction, facilitator result, durable payment record, and chain evidence have actually been captured and reviewed.

For Vercel rollback, restore the prior application deployment without deleting or rewriting Neon rows. For a failed Railway transition, stop Railway writers before returning traffic to Vercel or reconciling data. Schema rollback requires a reviewed forward migration or tested restore; never rewrite payment fingerprints or manually mark an unknown result settled.
