# Deployment guide

## Primary topology: ChatGPT Sites + D1

x402 Agent Gateways deploys as one Vinext/Cloudflare Site. `.openai/hosting.json` declares the logical `DB` D1 binding, and the packaged `drizzle/` migrations initialize the durable challenge and payment ledger.

Keep the deployment private until judge access is deliberately configured and tested. A successful owner session is not evidence that judges can open the Site.

## Baseline testnet configuration

Use verified recipients before any real-wallet acceptance. Empty recipient values select built-in testnet demo sinks; those addresses are not merchant-controlled and must not receive assets of value.

```text
FACILITATOR_PUBLIC=true
X402_SAMPLE_PRICE_ATOMIC=1000

# Optional custom testnet facilitator. Empty uses the public default.
X402_FACILITATOR_URL=
X402_FACILITATOR_TIMEOUT_MS=15000
X402_FACILITATOR_BEARER_TOKEN=

# Base Sepolia merchant/test recipient
X402_EVM_PAY_TO=
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Solana Devnet transaction construction and recipient
SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
X402_SOLANA_PAY_TO=

# Read-only reconciliation timeout for known transaction hashes
X402_RECONCILE_RPC_TIMEOUT_MS=8000

# Native Gno Pearl v1 adapter
G402_SELF_TEST_MODE=true
G402_PAYMENT_MODE=direct
G402_ENABLE_SETTLEMENT=true
G402_ALLOW_MAINNET=false
GNO_NETWORK_ID=gno:pearl-1
GNO_CHAIN_ID=pearl-1
GNO_RPC_URL=https://rpc.pearl.testnets.gno.land
GNO_ASSET=gno.land/r/gnoland/wugnot
GNO_DENOM=ugnot
```

For a merchant Gno deployment, set `G402_SELF_TEST_MODE=false` and provide a verified `G402_MERCHANT_ADDRESS`. Do not enable `G402_PAYMENT_MODE=realm` until `contracts/gno/g402pay` has been deployed, its package path verified, and `G402_CONTRACT_PATH` configured.

For Solana, provision and verify the recipient's associated token account for the exact configured USDC mint before a live settlement. Address syntax alone is insufficient operational readiness.

## Facilitator configuration

If `X402_FACILITATOR_URL` is empty, the app uses the public x402 facilitator and treats it as testnet-only. A custom URL must:

- use HTTPS
- contain no username or password
- contain no query string or fragment
- expose x402 v2 `/supported`, `/verify`, and `/settle` behavior expected by the SDK

Set `X402_FACILITATOR_BEARER_TOKEN` only through the hosted secret configuration. Never put it in `.env.example`, source control, a URL, logs, or client-rendered props. Rail discovery returns only the facilitator origin.

Challenge creation checks `/supported` and rejects a facilitator that does not advertise the exact scheme/network pair.

## Mainnet configuration

Mainnet is a staged promotion, not a single switch. Keep every flag below false for the hackathon demonstration.

### Ethereum

All conditions are required:

```text
X402_ALLOW_EVM_MAINNET=true
X402_ENABLE_EVM_MAINNET_SETTLEMENT=true
X402_ETHEREUM_PAY_TO=0x...
ETHEREUM_MAINNET_RPC_URL=https://...
X402_FACILITATOR_URL=https://your-production-facilitator.example
```

The recipient must be verified, the HTTPS reconciliation RPC must be configured, and the facilitator must advertise `eip155:1` with exact-payment support. The public default facilitator does not satisfy the production-facilitator gate.

### Solana

All conditions are required:

```text
X402_ALLOW_SOLANA_MAINNET=true
X402_ENABLE_SOLANA_MAINNET_SETTLEMENT=true
X402_SOLANA_MAINNET_PAY_TO=...
SOLANA_MAINNET_RPC_URL=https://...
X402_FACILITATOR_URL=https://your-production-facilitator.example
```

Verify the recipient and its mainnet USDC associated token account. The facilitator must advertise the configured Solana mainnet CAIP-2 identifier.

### Gno

Gno mainnet is independent of the v2 gates. It requires `G402_ALLOW_MAINNET=true`, `G402_ENABLE_SETTLEMENT=true`, explicit `GNO_NETWORK_ID=gno:mainnet`, the matching chain/RPC configuration, and a verified merchant address.

No mainnet activation is complete until two-person configuration review, live capability checks, chain-native monitoring, limits, and rollback drills are recorded.

## Release order

1. Install from the committed lockfile in a clean environment.
2. Run the full test, typecheck, production build, audit, and clean D1 migration checks.
3. Confirm the exact testnet recipients and, for Solana, the required USDC ATA.
4. Confirm every mainnet flag is false and no production secret is present in source or generated client assets.
5. Save and deploy a private Site version from the exact tested commit.
6. Check deployment status and authenticated `/api/health`, `/api/v2/rails`, `/webmcp`, `/pay`, `/wallet`, and `/scan` responses.
7. Complete manual wallet acceptance on Base Sepolia, Solana Devnet, and Gno Pearl as applicable. Record the server-issued payment IDs and transaction identifiers without exposing keys.
8. Verify the protected-resource retry with `X-Payment-Id` and exact receipt lookup.
9. Grant judge access, then test the URL from a non-owner session.

Do not publish claims, a demo video, or Devpost answers until the manual evidence matches them.

## HTTP smoke checks

- `GET /api/v2/rails` lists five rails, reports mainnet readiness, and exposes no facilitator secret.
- `POST /api/v2/challenges` for Base Sepolia or Solana Devnet returns 201, server-issued challenge/payment IDs, structured terms, and `Payment-Required`.
- `POST /api/v2/review` rejects changed payer/resource/unsigned payload; for Solana it returns a fresh-blockhash payload, atomically replaces the stored message hash, and keeps the identifiers/requirements unchanged.
- `POST /api/v2/settle` preserves pending or response-mismatch states without unlocking the resource. An identical retry with a known transaction hash reconciles finalized chain data without a second facilitator settlement.
- A transaction-less unknown outcome stays manual pending and is not automatically submitted again.
- `GET /api/demo/multichain-paid-data` without a payment ID returns 402 discovery guidance.
- The same GET with a matching settled `X-Payment-Id` returns the paid response.
- `GET /api/health` verifies D1 and the native Gno configuration.

The paid-resource GET does not emit final EVM/Solana `Payment-Required` terms by itself. Wallet-specific terms come from the challenge preflight.

## Indexing model

The Site does not run an infinite worker. `/scan` bootstraps a bounded recent Gno range when empty. Authenticated `POST /api/internal/index` advances a bounded batch. Each block is replay-safe; checkpoints move only after its statements are written. Forks are retained and canonical flags rewind to a common ancestor.

EVM and Solana settlement records originate in the facilitator ledger. Pending records with a known transaction hash can be finalized on an identical retry: EVM reconciliation checks finalized receipt/input/Transfer log, and Solana reconciliation checks finalized status and the latest stored message hash. Immediate facilitator successes are not independently indexed by default, and transaction-less unknown outcomes cannot be auto-reconciled. Do not represent every facilitator record as an independent finality proof.

For continuous Gno indexing, deploy the optional Node/PostgreSQL worker and point web and worker at one PostgreSQL database. That is a separate topology with migrations under `db/migrations`.

## Platform notes

This repository builds with Vinext for the Cloudflare runtime. It is not a drop-in Vercel build. A Vercel port requires a standard Next build, PostgreSQL-compatible persistence, and authenticated scheduled indexing or a persistent external worker.

## Monitoring and recovery

Alert on D1 errors, facilitator timeouts, settlement records stuck in `settling` or `broadcast`, response-binding mismatches, Gno RPC chain mismatch, index lag, reorgs, and any mainnet flag change. Preserve challenge, payment, audit, block, transaction, and event rows during incidents.

Never rewrite a payment fingerprint or manually mark a pending facilitator response settled. Identical retries may perform read-only reconciliation only when a valid transaction hash is already stored; they never call facilitator settlement again. A transaction-less unknown outcome requires an operator to investigate external facilitator and chain records before any manual state correction.
