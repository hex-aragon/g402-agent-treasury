# Multichain release checklist

Every item applies to the exact commit and deployment submitted to Devpost. Automated SDK/mock evidence and live-wallet acceptance are recorded separately.

Latest local evidence: 118/118 tests passed on 2026-09-03. This does not replace a rerun on the exact submitted commit. Recorded real-wallet payments remain 0 across Base Sepolia, Solana Devnet, and Gno Pearl.

## Automated gates

- [ ] `npm ci` succeeds from the committed lockfile in a clean directory
- [ ] `npm test` passes on the exact submitted commit, including chain, store, WebMCP, and multichain suites (latest local run: 118/118 on 2026-09-03)
- [ ] `npm run typecheck` passes
- [ ] `npm run build` produces the expected Next.js production build for Vercel
- [ ] `npm audit --audit-level=high` reports no unresolved high/critical vulnerability
- [ ] PostgreSQL migrations `001`–`015` apply to a clean database and are recorded in `schema_migrations`
- [ ] Schema inspection confirms challenge and settlement-claim indexes plus the `015_railway_scan` checkpoint, canonical block, transaction, and event structures
- [ ] Production uses Vercel Next.js and one dedicated Neon PostgreSQL database as the authoritative store
- [ ] Bearer-protected `GET /api/cron/index` is scheduled for 03:00 UTC daily and rejects missing or invalid authorization
- [ ] Scan is described as a bounded daily snapshot; Railway persistent indexing is not described as deployed
- [ ] Generated/browser assets contain no API key, bearer token, wallet secret, or embedded facilitator credential

## Chain-neutral control plane

- [ ] `/api/v2/rails` lists exactly five rails and exposes only the facilitator origin
- [ ] Base Sepolia and Solana Devnet are marked `sdk_ready`, not “live settled”
- [ ] Ethereum and Solana mainnets are marked `locked` with both gates false
- [ ] WebMCP discovers all seven tools
- [ ] `prepare_agent_payment` accepts Base Sepolia, Solana Devnet, and Gno Pearl only
- [ ] Mainnet rail IDs are rejected by WebMCP preparation
- [ ] Agent-prepared terms survive wallet connection without being replaced
- [ ] Challenge ID, payment ID, and EVM authorization nonce are server-issued; clients only echo them
- [ ] `/api/v2/review` rejects changed payer, resource, requirements, and prior Solana unsigned message
- [ ] Solana review refreshes the blockhash, atomically replaces the message hash, preserves identifiers/requirements, and only the returned payload is signed
- [ ] Over-500 KB envelopes, expired challenges, replay mutation, and response-tuple mismatch fail closed
- [ ] Concurrent settlement claims produce one owner and idempotent identical replays
- [ ] A pending row with a valid transaction hash reconciles on-chain on an identical retry without another facilitator settlement
- [ ] A transaction-less unknown outcome remains manual pending and is never automatically re-submitted
- [ ] Chain-indexed rows cannot unlock the multichain resource

## EVM

- [ ] Official x402 EVM definitions and client compatibility fixtures cover Base Sepolia and Ethereum mainnet requirements
- [ ] EIP-712 domain and EIP-3009 `from`, `to`, value, nonce, and validity fields bind to stored terms
- [ ] EVM address comparisons are case-insensitive only where appropriate; asset/network remain exact to the selected rail
- [ ] Wallet rejects or prompts for network switching safely; unknown-chain add is attempted only for the expected error
- [ ] Real EIP-1193 Base Sepolia USDC settlement succeeds through the configured facilitator
- [ ] Its exact payment ID unlocks only the intended resource
- [ ] Known pending EVM reconciliation requires finalized success, exact `transferWithAuthorization` fields, and matching Transfer log
- [ ] Receipt transaction identifier is checked in a Base Sepolia explorer

## Solana

- [ ] Official SVM Exact client fixtures cover Devnet and mainnet requirement construction
- [ ] Wallet Standard signs the exact review-refreshed v0 transaction
- [ ] Fee payer, resource memo, latest message hash, payer, mint, recipient, amount, and 60-second timeout are bound
- [ ] Solana address and mint comparisons remain case-sensitive
- [ ] The configured recipient has the associated token account for the selected USDC mint
- [ ] Real Wallet Standard Solana Devnet USDC settlement succeeds through the configured facilitator
- [ ] Its exact payment ID unlocks only the intended resource
- [ ] Known pending Solana reconciliation requires finalized status and the exact review-time message hash
- [ ] Receipt transaction identifier is checked in a Solana explorer

## Gno

- [ ] PostgreSQL challenge, payment, rate-limit, block, transaction, event, and checkpoint tables exist through migration `015_railway_scan`
- [ ] Adena `SignTx` account, signer, direct WUGNOT fields, memo, nonce, expiry, and resource binding pass
- [ ] Scan bootstraps recent Pearl blocks and searches hash, address, payment ID, and height
- [ ] Duplicate, altered fingerprint, approval, and reorg drills pass
- [ ] One user-authorized Adena Pearl payment is reconfirmed on the exact release build
- [ ] `G402_PAYMENT_MODE=direct`; `g402pay` remains described as undeployed

## Mainnet isolation

- [ ] `X402_ALLOW_EVM_MAINNET=false`
- [ ] `X402_ENABLE_EVM_MAINNET_SETTLEMENT=false`
- [ ] `X402_ALLOW_SOLANA_MAINNET=false`
- [ ] `X402_ENABLE_SOLANA_MAINNET_SETTLEMENT=false`
- [ ] `G402_ALLOW_MAINNET=false`
- [ ] No WebMCP tool or client input can mutate these settings
- [ ] Mainnet enablement documentation requires verified recipients, Solana ATA/RPC, production facilitator support, monitoring, and two-person review

## Security and operations

- [ ] Threat model reviewed independently
- [ ] Custom facilitator URL validation and secret handling tested
- [ ] Rate limits and authorization behavior tested in the deployed environment
- [ ] Point-in-time restore and incident drill recorded
- [ ] Known-hash reconciliation and transaction-less manual-pending limitations are visible in documentation
- [ ] Privacy/legal review completed for stored addresses, payment metadata, and agent activity

## Devpost submission

- [ ] Public GitHub, GitLab, or Bitbucket repository URL added
- [ ] Root license is visible on the public repository page
- [ ] Public YouTube demo is under three minutes and includes audio
- [ ] Demo claims only the live transactions actually shown
- [ ] Submission text distinguishes pre-existing Gno work from challenge additions
- [ ] Working live URL is added
- [ ] Judge access is tested from a non-owner session
- [ ] Required credentials, if any, are placed only in the Devpost submission field
- [ ] All unchecked placeholders are resolved before submission
