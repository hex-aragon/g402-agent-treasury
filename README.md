# g402 Facilitator + Scan

An actually runnable x402 facilitator and persistent chain scan for the Gno.land **Pearl testnet**. The active hosted product verifies Adena `SignTx` transactions, atomically claims challenges and nonces in Cloudflare D1, broadcasts exact WUGNOT transfers through the official TM2 RPC client, unlocks a sample paid API, and indexes canonical blocks and g402 receipts. Gno mainnet remains locked.

The repository also contains separately gated Akash, Filecoin/IPFS and Cosmos packages. Their live provider or chain integrations are not enabled in the hosted Gno product.

## Active Gno product

| Surface | What it does |
| --- | --- |
| `/wallet` | Adena challenge → sign → verify → settle → paid retry flow |
| `/scan` | Persistent Pearl blocks, transactions, addresses and g402 receipt search |
| `/developers` | Runnable facilitator request formats and endpoints |
| `/console` | D1, settlement lock and index checkpoint status |
| `/api/health` | D1 connectivity, live RPC chain ID and mainnet lock probe |

The hosted self-test pays the connected wallet back to itself so no merchant address is invented or custody key is required. A merchant deployment disables `G402_SELF_TEST_MODE` and sets its own `G402_MERCHANT_ADDRESS`.

## Monorepo

| Path | Responsibility |
| --- | --- |
| app | dashboards and versioned HTTP APIs |
| lib | Gno facilitator and shared web/runtime services |
| contracts/gno/g402pay | atomic native-GNOT payment realm and on-chain receipts |
| packages/x402-core | canonical hashing, budget and circuit primitives |
| packages/akash | pricing, routing, metering, settlement and deployments |
| packages/filecoin | CID, storage pricing, IPFS/Filecoin Pay/Paych adapters |
| packages/cosmos | CAIP-2 registry, Protobuf verifier, policy and Keplr |
| lib/scan.ts | bounded D1 block indexer with common-ancestor reorg recovery |
| worker | optional PostgreSQL workers for non-Sites deployments |
| drizzle | Cloudflare D1 migrations packaged with the Site |
| db/migrations | ordered PostgreSQL schema |
| docs/checkpoints | completion state and external blockers |

## Local run

~~~bash
cp .env.example .env.local
npm ci
npm run dev
~~~

The local Cloudflare/Vinext runtime creates the configured D1 binding. Set `G402_ENABLE_SETTLEMENT=true` only when intentionally testing against Pearl. For a PostgreSQL/container deployment, set `DATABASE_URL`, run `npm run db:migrate`, and start the optional worker separately.

## Quality gates

~~~bash
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
~~~

The current regression suite contains 51 tests. The CI workflow also checks the optional container topology.

## API surface

- Gno: `/api/v1/challenges`, `/api/v1/verify`, `/api/v1/settle`, `/api/v1/payments`, `/api/v1/scan`
- Shared: /api/v1/service-budgets, /api/health, /api/metrics
- Akash: /api/akash/v1/models, /api/akash/v1/chat/completions, /api/akash/v1/deployments
- Storage: /api/storage/v1/upload, /api/storage/v1/search, /api/storage/v1/cids/:cid
- Cosmos: /api/cosmos/v1/chains, /api/cosmos/v1/verify, /api/cosmos/v1/settle, /api/cosmos/v1/policies

The first call to `/api/demo/paid-data` returns HTTP 402 with a `Payment-Required` header. After settlement, retry with `X-Payment-Id`. Issued terms, expiry, resource hash and optional agent/quote bindings are stored before any signature is accepted.

Set `G402_PAYMENT_MODE=realm` and `G402_CONTRACT_PATH` after deploying `contracts/gno/g402pay` to make challenges use the atomic on-chain payment realm. See `docs/GNO_CONTRACT.md`.

## Deployment and safety

The primary deploy target is ChatGPT Sites with the `DB` D1 binding declared in `.openai/hosting.json`; migrations under `drizzle/` are packaged into the deployment. Scan bootstraps a bounded recent range on first visit and advances through the authenticated sync control. A Node/PostgreSQL deployment remains available as an alternative and requires its persistent worker.

This Vinext/Cloudflare build is not a Vercel build. The obsolete Vercel configuration was removed instead of claiming compatibility. Porting to Vercel requires a standard Next build, Neon/PostgreSQL and an authenticated POST scheduler or external worker.

Read docs/DEPLOYMENT.md, docs/RELEASE_CHECKLIST.md and each product runbook/threat model. Checkpoint documents state exactly which live credentials and manual chain tests remain. Gno, Akash, Filecoin and Cosmos mainnet locks are independent.

## License

Apache-2.0 for off-chain code. Network-specific contracts, realms, providers and data are governed separately by their upstream terms.
