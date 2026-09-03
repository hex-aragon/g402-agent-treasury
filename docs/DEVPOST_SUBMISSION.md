# Devpost submission draft

This file is submission copy in progress. Do not turn unchecked evidence into a public claim.

## Project name

**x402 Agent Gateways — Human-approved multichain payments for AI agents**

## Elevator pitch

**EN:** Agents prepare exact x402 payment terms across EVM, Solana, and Gno via WebMCP — humans keep custody and give the final wallet approval. Mainnets stay locked.

**KR:** AI 에이전트가 WebMCP로 EVM·Solana·Gno의 x402 결제 조건을 정확히 준비하고, 사람은 키를 넘기지 않은 채 지갑에서 최종 승인합니다. 메인넷은 잠금 상태로 유지됩니다.

## One-line description

A WebMCP payment workspace where agents prepare exact EVM, Solana, or Gno testnet terms and people retain custody and approve the matching wallet transaction.

## Current deployment and evidence

The working deployment is [https://g402-agent-treasury.vercel.app](https://g402-agent-treasury.vercel.app), running Next.js on Vercel with a dedicated Neon PostgreSQL database as the authoritative store. PostgreSQL migrations are applied through `015_railway_scan`.

A bearer-protected scheduled route runs one bounded Gno Scan snapshot daily at 03:00 UTC. It is not a continuously advancing explorer. The code-ready Railway topology would run a singleton persistent indexer against private PostgreSQL, but it is not deployed.

The automated suite passed 119/119 on 2026-09-04. Recorded real-wallet payments remain 0 across Base Sepolia, Solana Devnet, and Gno Pearl; the passing suite and working URL are not evidence of live settlement.

## Why this is a strong fit for WebMCP

Payments are a coordination problem between machine speed and human authority. An agent can identify a service and prepare protocol details, but visual wallet automation is brittle and custody delegation is risky. x402 Agent Gateways exposes the workflow as seven narrow WebMCP tools: discover rails, prepare server-bound testnet terms, inspect the native Gno gateway, search Pearl activity, open human review, and verify a durable receipt.

The agent handles structured work without screen scraping. The person sees the exact challenge that the agent prepared and remains the only party able to approve the wallet. Mainnet configuration, merchant recipients, signed payload submission, and settlement internals are outside the WebMCP surface.

## How it creates a better user experience

One workspace replaces manual copying between API docs, chain dashboards, wallet screens, and receipt tables. The agent selects the right adapter and prepares a short-lived challenge. The application pauses at the consequential boundary, shows network, asset, amount, recipient, payer, resource, and expiry, and revalidates them with the server immediately before opening the wallet prompt.

EVM users get an EIP-1193/EIP-712 flow built from official x402 EVM definitions, Solana users get Wallet Standard and a v0 transaction built by the official SVM Exact client, and Gno users retain Adena. The interaction changes with the chain, but the agent-facing preparation and receipt model stays consistent.

## What people and agents can do together that was difficult before

The agent can inspect five precise rail definitions, distinguish testnet-ready adapters from independently locked mainnets, and produce wallet-bound payment terms. The person can inspect and authorize those terms without sharing a key. After settlement, both can refer to one payment ID and one durable record rather than reconcile copied transaction details.

This shared challenge is the important collaboration primitive: neither participant silently reconstructs or changes the other's terms.

## How WebMCP was implemented

The top-level React layout registers seven imperative tools with `document.modelContext.registerTool`. Each tool has a strict JSON Schema, bounded output, cancellation support, and annotations that distinguish read-only results from state-changing preparation/navigation. An `AbortController` removes stale registrations.

`list_payment_rails` and `prepare_agent_payment` add the chain-neutral path. Preparation accepts Base Sepolia, Solana Devnet, or Gno Pearl only. It calls same-origin APIs, persists exact server-issued terms to a shared session, and never signs or settles. `open_payment_review` consumes those same terms in the matching wallet UI.

For EVM and Solana, `POST /api/v2/challenges` is a wallet-bound `Payment-Required` preflight. The server generates the challenge ID, payment ID, and EVM authorization nonce where applicable; stores the expected payer, resource, requirements hash, expected payment ID, and Solana unsigned-message hash; and requires the client to echo them unchanged. `/api/v2/review` rechecks the terms immediately before the wallet prompt. For Solana it then uses the official SVM Exact client to refresh the blockhash, atomically replaces the stored message hash, and returns the only payload the wallet may sign.

Verify and settle repeat the checks and use the official x402 HTTP facilitator client. The EVM browser constructs its EIP-3009 payload with viem/EIP-1193 using official x402 authorization types and asset metadata rather than an all-in-one SDK checkout helper. Settlement atomically claims the server-issued IDs and rejects an inconsistent success tuple. A retry with a known transaction hash performs finalized EVM/Solana RPC reconciliation without calling settlement again; a transaction-less unknown outcome remains manual pending. The protected resource unlocks only for the exact durable settled record.

Gno Pearl remains a native v1 adapter using Adena/TM2 direct WUGNOT verification and broadcast. Its optional `g402pay` realm is not deployed.

## Chain support and evidence

| Rail             | Implemented experience                                         | Evidence available now                                                                                        |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Base Sepolia     | EIP-1193, EIP-712/EIP-3009 USDC, v2 facilitator                | Deterministic SDK and mocked-facilitator tests; live wallet settlement still required                         |
| Solana Devnet    | Wallet Standard, SPL USDC, v0 transaction, sponsored fee payer | Deterministic SDK and mocked-facilitator tests; live wallet settlement and recipient ATA check still required |
| Gno Pearl        | Adena, native direct WUGNOT v1, Scan receipt                   | Existing native implementation; manual acceptance must be reconfirmed on the release build                    |
| Ethereum mainnet | v2 adapter path                                                | Locked behind two gates, merchant recipient, and production facilitator support                               |
| Solana mainnet   | v2 adapter path                                                | Locked behind two gates, merchant recipient/ATA, HTTPS RPC, and production facilitator support                |

Do not describe SDK/mock evidence as a live transfer or independent finality proof.

## What already existed vs. challenge work

### Pre-existing foundation

- Gno Pearl facilitator and Adena direct-WUGNOT flow
- original challenge, nonce, payment, audit, and rate-limit persistence, subsequently migrated to authoritative PostgreSQL for the current deployment
- Pearl Scan with reorg-aware canonical history
- paid sample API and operations console
- source- and test-complete but undeployed `g402pay` realm
- separately gated Akash, Filecoin/IPFS, and Cosmos packages

### Added for the WebMCP Challenge

- seven top-level WebMCP tools and shared activity/preparation state
- chain-neutral rail registry for EVM, Solana, and Gno
- official x402 v2 types, HTTP facilitator client, EVM definitions, and SVM Exact payload builder integrated with the chain-neutral adapter
- EIP-1193 and Wallet Standard human review UI
- wallet-bound `Payment-Required` preflight and pre-sign server review
- expected-payer, resource, recipient, amount, asset, unsigned-payload, and settlement-response binding
- server-issued payment ID/nonce binding, review-time Solana blockhash refresh, known-transaction reconciliation, transaction-less manual pending, and exact paid-resource authorization
- independently gated Ethereum and Solana mainnet adapter paths
- deterministic SDK, mocked-facilitator, tamper, replay, and WebMCP safety coverage

## Demo video plan — target 2:40

Record only after at least one real testnet wallet acceptance succeeds on the release deployment.

**0:00–0:15 — Result first**
Show one completed testnet payment, the paid weather response, and the exact receipt tool result. Identify the chain actually shown; do not imply the other rails were live-settled.

**0:15–0:38 — Rail discovery**
Open `/webmcp` and ask the agent to list rails. Show Base Sepolia and Solana Devnet as SDK-ready, Gno Pearl as native, and both mainnets as locked.

**0:38–1:05 — Agent preparation**
Give the agent the relevant wallet address and ask it to prepare the testnet payment. Show the wallet-bound terms appear without a signature prompt.

**1:05–1:40 — Human approval**
Let the agent open review. Connect the matching wallet, compare network, amount, recipient, and resource, then show the human approval. Mention that the server performed the pre-sign review.

**1:40–2:05 — Settlement and receipt**
Show the paid resource retry and ask the agent to retrieve the exact payment ID. Show the returned status and transaction identifier.

**2:05–2:25 — Second family and Gno**
Prepare, but do not falsely settle, the other SDK rail. Briefly show that Gno routes to Adena and retains Scan.

**2:25–2:40 — Close**
Say: “Agents handle discovery and exact preparation. People keep custody and final approval. Mainnet remains independently locked.”

## Final submission checklist

- [x] Application implementation and HTTPS deployment URL exist
- [x] Seven imperative WebMCP tools are implemented
- [x] Devpost 3:2 thumbnail exists at `public/devpost-thumbnail.png`
- [x] Root `LICENSE` and local setup instructions exist
- [x] Gno pre-existing work is separated from challenge additions
- [x] Latest local automated suite passed 119/119 on 2026-09-04
- [ ] Re-run every automated gate on the exact submitted commit and record results
- [ ] Complete and record a real Base Sepolia EIP-1193 settlement
- [ ] Complete and record a real Solana Devnet Wallet Standard settlement after recipient ATA verification
- [ ] Reconfirm the Adena Pearl path on the exact release build
- [ ] Test all seven tools in ChatGPT's in-app browser
- [ ] Publish the GitHub, GitLab, or Bitbucket repository and place its URL here
- [ ] Publish a public YouTube demo under three minutes with audio and place its URL here
- [ ] Grant and verify judge access from a non-owner session
- [ ] Confirm every mainnet gate is false in the submitted deployment

**Repository URL:** pending

**Demo video URL:** pending
**Judge-access verification:** pending

Do not describe `g402pay` as deployed, EVM/Solana automated tests as live transactions, every runtime path as an all-in-one SDK helper, or unreconciled facilitator settlement records as independent chain-finality proofs.
