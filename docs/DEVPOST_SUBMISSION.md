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

The automated suite passed 119/119 on 2026-09-10. Recorded real-wallet payments remain 0 across Base Sepolia, Solana Devnet, and Gno Pearl; the passing suite and working URL are not evidence of live settlement.

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

## Devpost story (English)

### Inspiration

Agents have become good at discovering services and reading protocol documents, but payment is still where automation either breaks or becomes dangerous. Driving a wallet UI visually is brittle, and delegating custody by sharing a key is worse. The x402 `Payment-Required` flow gave us machine-readable payment terms, and WebMCP gave us a way to hand a browser agent narrow, typed tools instead of a screen. We wanted to draw the boundary precisely: the agent does the structured preparation at machine speed, and the human remains the only party able to sign.

### What it does

x402 Agent Gateways is a WebMCP payment workspace at [g402-agent-treasury.vercel.app/webmcp](https://g402-agent-treasury.vercel.app/webmcp). The page registers seven narrow WebMCP tools that let an agent discover five payment rails, prepare exact server-bound testnet payment terms on Base Sepolia, Solana Devnet, or Gno Pearl, inspect the native Gno gateway, search Pearl activity, open human review, and verify a durable receipt.

The agent never signs and never settles. The application pauses at the consequential boundary: it shows the person the network, asset, amount, recipient, payer, resource, and expiry that the agent prepared, revalidates them with the server immediately before the wallet prompt, and only then opens the matching wallet — EIP-1193/EIP-712 for EVM, Wallet Standard for Solana, Adena for Gno. Both mainnet adapters exist but stay independently locked. After settlement, agent and human share one payment ID and one durable record.

### How we built it

The app is Next.js 16 (App Router) with React 19, deployed on Vercel with a dedicated Neon PostgreSQL database as the authoritative store (migrations applied through `015_railway_scan`, Drizzle ORM over `postgres`).

The top-level React layout registers the seven tools with `document.modelContext.registerTool`. Each tool has a strict JSON Schema, bounded output, cancellation support, and annotations distinguishing read-only results from state-changing preparation and navigation; an `AbortController` removes stale registrations.

Payments run through a wallet-bound `Payment-Required` preflight at `POST /api/v2/challenges`: the server generates the challenge ID, payment ID, and (for EVM) the authorization nonce, stores the expected payer, resource, requirements hash, and Solana unsigned-message hash, and requires the client to echo them unchanged. `/api/v2/review` rechecks everything immediately before the wallet prompt; for Solana it refreshes the blockhash through the official SVM Exact client and atomically replaces the stored message hash, so the wallet can only sign the payload the server just approved. Settlement uses the official x402 HTTP facilitator client (`@x402/core`, `@x402/evm`, `@x402/svm`), builds the EVM EIP-3009 payload with viem from official x402 authorization types, atomically claims the server-issued IDs, and rejects any inconsistent success tuple. Gno Pearl keeps its native Adena/TM2 direct WUGNOT flow, and a bearer-protected scheduled route takes one bounded Gno Scan snapshot daily.

### Challenges we ran into

- **Making the shared terms tamper-proof in both directions.** Neither the agent nor the page may silently reconstruct terms, so every consequential value is server-issued and must be echoed back unchanged, with requirements hashes checked again at review and settlement.
- **Human approval time versus Solana blockhash expiry.** A person reviewing terms is slower than a blockhash window, so review became the moment the server refreshes the blockhash and atomically swaps the only signable message hash.
- **Retries without double-settlement.** A retry with a known transaction hash performs finalized EVM/Solana RPC reconciliation without calling settlement again; a transaction-less unknown outcome deliberately stays manual pending instead of guessing.
- **Keeping the WebMCP surface narrow.** Signing, settlement internals, mainnet configuration, and merchant recipients were all kept off the tool surface on purpose — the hardest part was deciding what agents must *not* be able to do.
- **Evidence discipline.** Deterministic SDK and mocked-facilitator tests are not live transfers, and our copy has to keep that distinction everywhere.

### Accomplishments that we're proud of

- Seven schema-strict, cancellable WebMCP tools with read-only/state-changing annotations and clean unregistration.
- One consistent agent-facing preparation and receipt model across three very different wallet experiences (EIP-1193, Wallet Standard, Adena).
- The wallet-bound preflight plus pre-sign server review as a collaboration primitive: the agent's prepared terms and the human's approved terms are provably the same terms.
- Mainnet paths implemented but independently gated, so the deployed surface is testnet-only by construction.
- A 119/119 automated suite covering the SDK flows, mocked facilitator, tamper, replay, and WebMCP safety cases, running against a live Vercel + Neon deployment.

### What we learned

- Human-in-the-loop is a protocol-design problem, not a UI checkbox. The pause only means something if the server binds what was prepared to what gets signed.
- WebMCP tools work best when they mirror an API contract rather than a screen: narrow schemas, bounded outputs, and explicit annotations did more for agent reliability than any prompt text.
- Official protocol packages (x402 v2 types, EVM definitions, SVM Exact client) are worth integrating at the adapter level instead of adopting an all-in-one checkout helper, because custody-preserving review needs access to the raw payloads.
- Honest gating is a feature: distinguishing testnet-ready adapters from locked mainnets inside the rail registry lets the agent itself report what is and is not safe to use.

### What's next for blockchain-agent-treasury

- Complete and record real wallet settlements on Base Sepolia (EIP-1193) and Solana Devnet (Wallet Standard, after recipient ATA verification), and reconfirm the Adena Pearl path on the release build.
- Test all seven tools in ChatGPT's in-app browser and other WebMCP hosts.
- Deploy the source- and test-complete `g402pay` Gno realm.
- Stand up the code-ready Railway topology: a singleton persistent indexer against private PostgreSQL instead of the daily bounded snapshot.
- Unlock the Ethereum and Solana mainnet adapters once merchant recipients, HTTPS RPC, and production facilitator support are in place — each behind its own independent gate.

## Built with (Devpost tags, max 25)

`typescript` `next.js` `react` `node.js` `vercel` `neon` `postgresql` `drizzle-orm` `webmcp` `model-context-protocol` `x402` `viem` `zod` `solana` `wallet-standard` `base` `ethereum` `usdc` `eip-712` `eip-3009` `gno` `adena` `json-schema` `cron`

(24 tags.)

## "Try it out" links

- Live app: <https://g402-agent-treasury.vercel.app>
- WebMCP workspace: <https://g402-agent-treasury.vercel.app/webmcp>
- Repository: <https://github.com/hex-aragon/g402-agent-treasury>

## Project media (image gallery, 3:2, up to 15)

Existing: `public/devpost-thumbnail.png` (3:2 thumbnail).

Screenshot shot list to capture at 1920×1280 (all from the live deployment, testnet only):

1. `/webmcp` workspace with the seven registered tools visible.
2. `list_payment_rails` result — Base Sepolia and Solana Devnet SDK-ready, Gno Pearl native, both mainnets shown locked.
3. `prepare_agent_payment` output — wallet-bound terms with no signature prompt.
4. Human review screen — network, amount, recipient, payer, resource, expiry side by side.
5. Wallet prompt next to the review screen (EVM EIP-712 or Solana approval).
6. Durable receipt / payment ID via `verify` tool result.
7. Paid weather resource unlocked after settlement.
8. Gno gateway page with Adena and Pearl Scan.
9. Optional: architecture diagram (agent → WebMCP tools → preflight/review APIs → wallet → facilitator → PostgreSQL receipt).

Do not stage a screenshot that implies a live settlement that has not actually been recorded.

## Video demo link

Pending — record per the plan below only after at least one real testnet wallet acceptance succeeds on the release deployment, publish to YouTube (public, under three minutes, with audio), and paste the URL here and in the checklist.

## Judge-facing form answers

### Live URL (ChatGPT in-app browser / Chrome with WebMCP enabled)

<https://g402-agent-treasury.vercel.app/webmcp>

### Testing instructions for application (seen only by Devpost and judges)

No credentials, login, or payment are required to test the WebMCP surface.

1. Open <https://g402-agent-treasury.vercel.app/webmcp> in ChatGPT's in-app browser, or in Google Chrome with WebMCP enabled. On load the page registers seven tools via `document.modelContext.registerTool`: `list_payment_rails`, `prepare_agent_payment`, `inspect_g402_gateway`, `search_gno_activity`, `prepare_pearl_payment`, `open_payment_review`, `get_payment_receipt`. The page header shows the registered tool count.
2. Read-only tools need no wallet. Ask the agent to "list the payment rails" — it should report Base Sepolia and Solana Devnet as SDK-ready, Gno Pearl as native, and both mainnets as locked. "Inspect the g402 gateway" and "search recent Gno Pearl activity" also work immediately.
3. Preparation needs only an address, not a signature. Ask the agent to prepare a payment on Base Sepolia (any 0x address) or Solana Devnet (any base58 address). Wallet-bound, server-issued terms appear with no signature prompt — the tools cannot sign or settle, and mainnet values are rejected by schema.
4. Optional full flow with a testnet wallet: use an EIP-1193 wallet (e.g. MetaMask) on Base Sepolia with testnet USDC, a Wallet Standard wallet (e.g. Phantom) on Solana Devnet, or Adena for Gno Pearl. Ask the agent to open payment review, compare the displayed network, amount, recipient, and resource against what it prepared, approve in the wallet, then ask the agent for the receipt by payment ID via `get_payment_receipt`.
5. Everything reachable from this page is testnet-only; the daily indexing route is bearer-protected and not needed for judging.

### URL to public code repo

<https://github.com/hex-aragon/g402-agent-treasury>

Made public on 2026-09-04 after a secret scan of the full git history (only `.env.example` with placeholder values was ever committed; no keys or real connection strings in history). GitHub detects the root Apache-2.0 `LICENSE`, so it shows in the About section.

### If submitting on behalf of an organization, what is the organization name?

N/A — individual submission.

### App Status

**Existing.** The Gno-only foundation predates the submission period; everything agent-facing was built during it (see next answer).

### If Existing, explain what you updated during the submission period

> The pre-existing project was a Gno Pearl-only payment gateway: an Adena direct-WUGNOT flow, challenge/nonce/payment persistence, a reorg-aware Pearl Scan, and a paid sample API. During the submission period we built the entire WebMCP and multichain layer on top of it: seven imperative WebMCP tools registered via `document.modelContext.registerTool` with strict schemas, cancellation, and read-only/state-changing annotations; a chain-neutral rail registry covering EVM, Solana, and Gno; integration of the official x402 v2 types, HTTP facilitator client, EVM definitions, and SVM Exact payload builder; EIP-1193 and Wallet Standard human-review UIs; a wallet-bound `Payment-Required` preflight with pre-sign server revalidation; server-issued payment ID/nonce binding, review-time Solana blockhash refresh, and known-transaction reconciliation; independently gated Ethereum/Solana mainnet adapter paths; migration of persistence to authoritative PostgreSQL on Neon with the Vercel deployment; and deterministic SDK, tamper, replay, and WebMCP safety test coverage (119/119).

### Which agent(s) or client(s) did you test your WebMCP tools with?

Verified on 2026-09-04 against the live deployment:

- **Google Chrome with WebMCP enabled** (Claude in Chrome): `/webmcp` reports `data-webmcp="ready"` with all seven tools registered via `document.modelContext.registerTool`.
- **Live tool-backend exercise**: rail discovery returned 5 rails with both mainnets locked; Base Sepolia preparation returned a 201 server-issued challenge; Gno Pearl preparation returned exact 402 WUGNOT terms; Pearl Scan search and receipt lookup returned bounded results; a mainnet preparation attempt was refused with 403 `mainnet_requires_operator_authorization`.
- **Automated suite** (119 tests): WebMCP registration lifecycle, schema rejection, cancellation, tamper, and replay coverage.

Current answer to paste:

> Google Chrome with WebMCP enabled (Claude in Chrome). All seven tools verified registered on the live deployment, with every tool backend exercised end-to-end short of wallet signing: rail discovery (mainnets locked), EVM/Gno preparation, Pearl activity search, receipt lookup, and a refused mainnet attempt. The 119-test automated suite additionally covers registration lifecycle, schema rejection, and cancellation.

Add ChatGPT's in-app browser to this answer only after actually testing there; do not name a client that has not been tested against the release deployment.

**Known issue found and fixed during this testing (2026-09-04, not yet deployed):** live Solana Devnet preparation returned 503 `solana_rpc_wrong_cluster` because the RPC cluster check compared the full genesis hash from `getGenesisHash` against the 32-char truncated CAIP-2 reference (`lib/multichain.ts`, same pattern in `lib/reconciliation.ts`). Fixed by comparing the first 32 chars; test mocks updated to return full-length hashes so the suite now catches this class of bug. Deploy before judging, then re-verify Solana preparation live.

### Which AI tools have you leveraged while working on this project?

> **OpenAI Codex** built the original iteration inside the ChatGPT-hosted project workspace: the x402 agent gateways, the Gno Pearl g402 facilitator and scan indexer, the human-approved WebMCP payment workflow, and the chain-neutral EVM/Solana/Gno payment path. That history is preserved in the archived repository and was merged into this repo.
>
> **Claude Code** (Claude Opus 4.7, then Claude Fable 5.1) handled the public release: the move to GitHub, Vercel, and Neon PostgreSQL, the security-hardening passes, the 119-test automated suite including WebMCP registration, schema-rejection, and cancellation checks, and this submission copy. The Vercel Claude Code plugin and Neon agent skills assisted the deployment and database work.
>
> **Claude in Chrome** (Google Chrome with WebMCP enabled) was the agent client used to exercise the seven tools against the live deployment.
>
> All AI-generated code was reviewed by a person before it shipped. Custody-sensitive flows — server-issued terms, human-only signing, settlement reconciliation — were checked against official x402 SDK behavior and gated by human-run acceptance checks.

Evidence: 13 core commits (2026-08-28 to 2026-09-02) are authored by Codex on the `sites-archive` remote; the 2026-09-03/04 release commits carry Claude Code trailers; `.agents/skills/neon*` is checked in. Drop the Vercel plugin mention if it was not used for the Vercel deployment session. Add ChatGPT's in-app browser here only after it has actually been tested (see the client question above).

### Describe the level of learning you/your team derived from the project

Select the highest tier (e.g. "A great deal" / "Significant new learning"). Justification if a text box appears: first WebMCP integration (imperative `registerTool` lifecycle, schema-strict tool design, read-only vs state-changing annotations) and first use of the official x402 v2 EVM/SVM clients, learned on top of an existing Gno-only codebase.

### Did you gain AI value that you can use in your career?

Select "Yes." If a text box appears: designing narrow, custody-preserving tool surfaces for agents — server-bound terms, human-only signing, honest capability reporting — is directly reusable in any agent-payments or agent-automation work.

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
- [x] Latest local automated suite passed 119/119 on 2026-09-10
- [ ] Re-run every automated gate on the exact submitted commit and record results
- [ ] Complete and record a real Base Sepolia EIP-1193 settlement
- [ ] Complete and record a real Solana Devnet Wallet Standard settlement after recipient ATA verification
- [ ] Reconfirm the Adena Pearl path on the exact release build
- [x] Verify all seven tools register and their backends respond on the live deployment in Chrome with WebMCP enabled (2026-09-04)
- [ ] Deploy the Solana genesis-hash cluster-check fix and re-verify Solana Devnet preparation live
- [ ] Test all seven tools in ChatGPT's in-app browser
- [x] Publish the GitHub, GitLab, or Bitbucket repository and place its URL here (public since 2026-09-04, Apache-2.0 detected)
- [ ] Publish a public YouTube demo under three minutes with audio and place its URL here
- [ ] Grant and verify judge access from a non-owner session
- [ ] Confirm every mainnet gate is false in the submitted deployment

**Repository URL:** <https://github.com/hex-aragon/g402-agent-treasury>

**Demo video URL:** pending
**Judge-access verification:** pending

Do not describe `g402pay` as deployed, EVM/Solana automated tests as live transactions, every runtime path as an all-in-one SDK helper, or unreconciled facilitator settlement records as independent chain-finality proofs.
