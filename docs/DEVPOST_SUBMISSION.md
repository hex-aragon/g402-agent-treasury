# Devpost submission draft

## Project name

**g402 Agent Treasury — Human-approved payments for AI agents**

## One-line description

An AI agent uses WebMCP to inspect, prepare and verify a real GnoLand Pearl x402 payment while a human keeps custody and approves the exact Adena transaction.

## Why this is a strong fit for WebMCP

Payments are a coordination problem between machine speed and human authority. A browser agent can understand a payment goal, but visual automation is brittle and giving the agent a wallet key is unsafe. g402 Agent Treasury exposes the existing facilitator and explorer as five narrow WebMCP tools. The agent reads live status, searches canonical activity, prepares fixed testnet terms, moves the shared UI to review and checks the final receipt. The human sees the same state and remains the only party able to sign in Adena.

## How it creates a better user experience

The person no longer has to move between an operations console, chain explorer, payment API documentation and wallet while copying addresses and transaction identifiers. The agent completes the structured research and preparation in seconds. The application then pauses at the consequential boundary, shows the exact network, amount and recipient, and asks the person to approve the wallet signature. Both participants share a visible activity trail and the final durable receipt.

## What people and agents can do together that was difficult before

The agent can verify the live safety configuration, find relevant chain records and prepare a valid short-lived x402 challenge without screen scraping. The person can inspect exactly what the agent prepared and authorize it without sharing custody. After settlement, the agent can retrieve one precise receipt and explain the result. Previously this required manual API calls, explorer searches and copy/paste across several screens, or unsafe custody delegation.

## How WebMCP was implemented

The top-level React layout registers five imperative tools with `document.modelContext.registerTool`. Each tool has a strict JSON Schema, accurate read-only and untrusted-content annotations, bounded output, cancellation support and structured errors. The execute handlers reuse same-origin production APIs and their server validation and applicable rate limits. An AbortController owns registration cleanup. The prepare and review steps update session-scoped shared UI state, and the wallet consumes the exact prepared challenge rather than issuing replacement terms.

Before the WebMCP path can request Adena approval, it verifies a healthy Pearl deployment, a literal mainnet lock, direct WUGNOT mode, self-test, an exact 1,000 amount, self-recipient and a fixed same-origin paid resource. The server then revalidates the issued challenge, signed transaction, nonce, expiry and resource binding before settlement. Gno mainnet remains locked independently in deployment and server configuration.

## What already existed vs. challenge work

### Pre-existing foundation

- GnoLand Pearl x402 facilitator
- Adena `SignTx` verification and direct WUGNOT settlement
- Cloudflare D1 challenge, nonce and receipt persistence
- canonical Scan with reorg handling
- paid sample API and operations console
- source-complete but undeployed `g402pay` realm

### Added for the WebMCP Challenge on September 2, 2026

- five top-level WebMCP tools
- agent payment workspace and shared activity trail
- exact agent-prepared challenge handoff to human wallet approval
- WebMCP-specific fail-closed policy and output minimization
- exact receipt query
- dedicated tool, tampering and unsafe-configuration tests
- challenge documentation and demo flow

## Demo video script — target 2:35

**0:00–0:12 — Result first**
Show the agent calling the receipt tool and the settled Pearl transaction beside the visible receipt. Say: “This payment was prepared by an AI agent, approved by me in Adena, settled on GnoLand Pearl, and verified through WebMCP.”

**0:12–0:32 — Product and safety boundary**
Open `/webmcp`. Show five registered Site tools and the empty prepared card. Explain that the agent can inspect, search, prepare, navigate and verify, but cannot sign. Point to “Mainnet locked.”

**0:32–0:55 — Inspect and search**
Ask: “Check gateway health and mainnet lock, then show recent Pearl activity.” Show the actual WebMCP calls and the shared activity trail updating.

**0:55–1:25 — Prepare**
Provide the Pearl Adena address and ask the agent to prepare a 1,000 WUGNOT self-payment. Show the prepared card appear with Pearl, amount, recipient and `Not submitted`. Emphasize that no wallet has opened and no transfer occurred.

**1:25–1:55 — Human approval**
Let the agent open the review screen. Connect Adena, compare the displayed address and amount, click the review/sign button and approve the Adena prompt. Keep the approval moment visible.

**1:55–2:20 — Verify**
Show successful paid-data retrieval and payment ID. Ask the agent to verify it. Show status, transaction hash, block and confirmations, then open Scan briefly.

**2:20–2:35 — Close**
Say: “WebMCP handles reliable preparation and verification. The human keeps custody and final authority. All live transfers are limited to Pearl testnet.”

## Final submission checklist

- [x] Working application and HTTPS URL
- [x] Imperative WebMCP implementation in the top-level page
- [x] Source code, setup instructions and root `LICENSE`
- [x] Clear distinction between pre-existing and challenge work
- [ ] Public GitHub, GitLab or Bitbucket repository URL
- [ ] Public YouTube demo under three minutes with audio
- [ ] Test five tools in ChatGPT's in-app browser
- [ ] Complete one human-approved Adena Pearl transaction and verify its receipt
- [ ] Ensure judges can access the live deployment

Do not describe the `g402pay` realm as deployed. The live path is Pearl testnet direct WUGNOT transfer.
