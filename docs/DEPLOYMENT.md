# Deployment guide

## Primary topology: ChatGPT Sites + D1

The Gno facilitator and Scan deploy as one Vinext/Cloudflare Site. `.openai/hosting.json` declares the logical `DB` D1 binding, and the build copies `drizzle/` to `dist/.openai/drizzle` so Sites can apply the schema during deployment.

Required non-secret environment values:

```text
FACILITATOR_PUBLIC=true
G402_SELF_TEST_MODE=true
G402_PAYMENT_MODE=direct
G402_ENABLE_SETTLEMENT=true
G402_ALLOW_MAINNET=false
GNO_NETWORK_ID=gno:pearl-1
GNO_CHAIN_ID=pearl-1
GNO_RPC_URL=https://rpc.pearl.testnets.gno.land
GNO_ASSET=gno.land/r/gnoland/wugnot
GNO_DENOM=ugnot
INDEXER_CONFIRMATIONS=2
```

Do not set a made-up merchant address. Self-test challenges accept the connected Adena address as `payTo`; real merchant deployments set `G402_SELF_TEST_MODE=false` and their verified address in `G402_MERCHANT_ADDRESS`.

Release order:

1. Run `npm ci`, `npm test`, `npm run typecheck`, Drizzle check and the Sites checkpoint build.
2. Update Site environment variables without placing wallet keys or mnemonics in the deployment.
3. Save a Site version and deploy it privately.
4. Verify deployment status, then open `/api/health` and `/scan` while authenticated.
5. Confirm D1 migration, Pearl chain ID, bounded Scan bootstrap and mainnet lock before attempting a wallet signature.

## Indexing model

The Site does not run an infinite worker. `/scan` bootstraps up to eight recent blocks when empty. Authenticated `POST /api/internal/index` advances a bounded batch of up to 30 blocks. Each block is replay-safe; checkpoints move only after its statements are written. Forks are retained and canonical flags are rewound to a common ancestor.

For continuous indexing, deploy the optional Node/PostgreSQL worker and point both web and worker at one PostgreSQL database. That is a separate topology with migrations under `db/migrations`; it is not required by the Sites/D1 product.

## Vercel status

This repository currently builds with Vinext and the Cloudflare runtime. It is therefore not a drop-in Vercel project, and the obsolete `vercel.json` was removed. A Vercel port requires a standard Next build, Neon/PostgreSQL and a scheduler that performs authenticated POST indexing or a persistent external worker.

## Monitoring and recovery

Alert on D1 errors, RPC chain mismatch, settlement failures, index lag above 20 blocks, reorgs and any mainnet flag change. Preserve payment, challenge, audit, block, transaction and event rows during incidents. Never repair a checkpoint by hand; rewind through the documented reconciliation procedure.
