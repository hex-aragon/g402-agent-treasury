# Deployment guide

## Topology

Deploy the root Next.js app to Vercel or a Node 24 container. Attach one PostgreSQL 17-compatible database. Deploy Dockerfile.worker, Dockerfile.akash-worker and Dockerfile.filecoin-worker as independent singleton-capable services; database leases prevent duplicate active workers.

## GitHub and Vercel

1. Push/import the repository and require the CI verify/container jobs.
2. Create preview and staging Vercel environments. Copy keys from .env.example through the provider secret UI.
3. Keep all mainnet and settlement flags false on the first deployment.
4. Run npm run db:migrate once from a protected release job and load db/seed.sql only in disposable staging.
5. Verify /api/health reports all mainnet locks true.
6. Run the four staging scripts and the manual wallet acceptance steps in each checkpoint.
7. Enable one testnet integration at a time.

Vercel duration settings are declared in vercel.json. If the plan cannot support them, run inference/storage routes in the web container instead. Large IPFS uploads need a future presigned/direct-upload service because serverless request size is intentionally bounded.

## Worker deployment

Workers share DATABASE_URL but use separate credentials and network egress. Set one replica initially. Health is the worker lease heartbeat and queue/checkpoint age. Never place Akash Console, Lotus, wallet or provider keys in the web browser.

## Required backups and monitoring

Enable point-in-time recovery, daily restore tests and encrypted secret rotation. Aggregate structured JSON logs from all replicas. Page on settlement failure, index lag, open circuits, overdue deployment closure, Filecoin proof degradation, stuck service requests and any mainnet flag change. Run npm run maintenance on a protected schedule and alert on exit code 2.

## External blockers in this environment

Vercel API calls are blocked by the execution environment, and no owner credentials or live testnet wallets are present. Source, CI, import metadata and deployment docs are complete; no deployment success is claimed.
