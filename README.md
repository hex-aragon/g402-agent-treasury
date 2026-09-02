# g402 Agent Treasury — WebMCP + GnoLand

An agent-native payment desk and runnable x402 facilitator for the Gno.land **Pearl testnet**. WebMCP lets an AI agent inspect the live gateway, search canonical activity, prepare tightly bounded payment terms, move the shared UI to human review, and verify the final receipt. Adena keeps the signing decision with the person. Gno mainnet remains locked.

**Live app:** https://x402-agent-gateways.gentle-berry-8248.chatgpt.site

**WebMCP workspace:** `/webmcp`

The active hosted product verifies Adena `SignTx` transactions, atomically claims challenges and nonces in Cloudflare D1, broadcasts exact WUGNOT transfers through the official TM2 RPC client, unlocks a sample paid API, and indexes canonical blocks and g402 receipts.

The repository also contains separately gated Akash, Filecoin/IPFS and Cosmos packages. Their live provider or chain integrations are not enabled in the hosted Gno product.

## Active Gno product

| Surface | What it does |
| --- | --- |
| `/webmcp` | Five top-level WebMCP tools, shared agent activity and human payment review handoff |
| `/wallet` | Adena challenge → sign → verify → settle → paid retry flow |
| `/scan` | Persistent Pearl blocks, transactions, addresses and g402 receipt search |
| `/developers` | Runnable facilitator request formats and endpoints |
| `/console` | D1, settlement lock and index checkpoint status |
| `/api/health` | D1 connectivity, live RPC chain ID and mainnet lock probe |

The hosted self-test pays the connected wallet back to itself so no merchant address is invented or custody key is required. A merchant deployment disables `G402_SELF_TEST_MODE` and sets its own `G402_MERCHANT_ADDRESS`.

## WebMCP Challenge addition — September 2, 2026

This repository existed as a GnoLand x402 facilitator and Scan before the challenge extension. The following product work was added for the WebMCP Challenge after August 25, 2026:

- top-level imperative WebMCP registration through `document.modelContext.registerTool`
- five narrow tools that reuse the live facilitator, health, Scan and receipt APIs
- a shared `/webmcp` workspace that displays browser capability, prepared terms and recent tool calls
- a verifiable agent-to-human handoff: the agent prepares one challenge and the wallet consumes those exact terms
- WebMCP-path fail-closed checks for Pearl, direct WUGNOT, fixed 1,000 amount, self-recipient and mainnet lock, followed by server verification of the issued challenge and signed transaction
- an exact payment-receipt lookup that avoids downloading the full payment ledger
- deterministic WebMCP tests for tool schemas, unsafe configurations, tampered terms and bounded outputs

### Site tools

| Tool | Side effect | Purpose |
| --- | --- | --- |
| `inspect_g402_gateway` | None | Read live facilitator, indexer and mainnet-lock status |
| `search_gno_activity` | None | Search at most five canonical Pearl transactions |
| `prepare_pearl_payment` | Stores an expiring challenge | Prepare fixed self-test terms; never signs or sends |
| `open_payment_review` | Navigates the shared page | Hand the exact prepared terms to the human review screen |
| `get_payment_receipt` | None | Read one exact durable payment and block receipt |

Suggested agent prompt:

> Check whether the g402 gateway is healthy and mainnet is locked. Show recent Pearl activity. Then prepare a 1000 WUGNOT self-payment for my Adena address and open the human review screen.

The agent cannot sign a transaction. The connected wallet must match the reviewed `payTo`, and the human must explicitly approve Adena. The challenge is rejected before signing if it is expired, changed, on another origin, on another network, uses another asset or amount, or if the live safety lock cannot be verified.

WebMCP is currently a draft Community Group API. This implementation uses the top-level imperative API supported by ChatGPT's in-app browser and Chrome's WebMCP testing mode, and cleans up registrations with an `AbortController` lifecycle.

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

The regression suite includes dedicated WebMCP safety and workflow tests. The CI workflow also checks the optional container topology.

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

[Apache-2.0](LICENSE) for this repository. Network-specific upstream contracts, realms, providers and data remain governed by their respective upstream terms.
