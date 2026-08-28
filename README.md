# x402 Agent Gateways

Production-oriented, staging-safe payment infrastructure for autonomous agents. One Next.js control plane and four isolated protocol packages provide:

- GnoLand g402 facilitator, Adena wallet, policy engine, payment explorer and reorg-aware indexer
- Akash OpenAI-compatible inference plus bounded GPU/container purchases
- Filecoin/IPFS content-addressed upload, paid search/retrieval and proof receipts
- Cosmos-native bank/IBC facilitator with feegrant and Keplr DirectSign

Every mainnet or fund-moving integration is disabled by default.

## Monorepo

| Path | Responsibility |
| --- | --- |
| app | dashboards and versioned HTTP APIs |
| lib | Gno facilitator and shared web/runtime services |
| packages/x402-core | canonical hashing, budget and circuit primitives |
| packages/akash | pricing, routing, metering, settlement and deployments |
| packages/filecoin | CID, storage pricing, IPFS/Filecoin Pay/Paych adapters |
| packages/cosmos | CAIP-2 registry, Protobuf verifier, policy and Keplr |
| worker | Gno indexer, Akash lifecycle and Filecoin proof reconciliation |
| db/migrations | ordered PostgreSQL schema |
| docs/checkpoints | completion state and external blockers |

## Local run

~~~bash
cp .env.example .env.local
npm ci
# Set DATABASE_URL, then:
npm run db:migrate
npm run dev
~~~

Mock Akash and Filecoin are enabled by the example environment. All settlement flags remain false. Docker users can run docker compose up --build; opt into workers with the indexer, akash-live or filecoin-live profiles only after configuring their networks.

## Quality gates

~~~bash
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
~~~

The CI workflow also builds all four container images. A manual staging workflow runs all product probes when the STAGING_BASE_URL repository variable is set.

## API surface

- Gno: /api/v1/verify, /api/v1/settle, /api/v1/agents, /api/v1/policies, /api/v1/approvals, /api/v1/payments
- Shared: /api/v1/service-budgets, /api/health, /api/metrics
- Akash: /api/akash/v1/models, /api/akash/v1/chat/completions, /api/akash/v1/deployments
- Storage: /api/storage/v1/upload, /api/storage/v1/search, /api/storage/v1/cids/:cid
- Cosmos: /api/cosmos/v1/chains, /api/cosmos/v1/verify, /api/cosmos/v1/settle, /api/cosmos/v1/policies

The first call to a paid route returns HTTP 402 with a Payment-Required header and quote-bound requirements. The retry supplies quote, payment and idempotency headers.

## Deployment and safety

Import the repository into GitHub and Vercel for the web/control plane. Run the three persistent workers on a container platform with the same PostgreSQL database. Apply migrations from one trusted release job, not from concurrent web instances.

Read docs/DEPLOYMENT.md, docs/RELEASE_CHECKLIST.md and each product runbook/threat model. Checkpoint documents state exactly which live credentials and manual chain tests remain. Gno, Akash, Filecoin and Cosmos mainnet locks are independent.

## License

Apache-2.0 for off-chain code. Network-specific contracts, realms, providers and data are governed separately by their upstream terms.
