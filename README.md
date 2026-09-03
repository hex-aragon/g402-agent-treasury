# x402 Agent Gateways — chain-neutral WebMCP payments

x402 Agent Gateways is a human-approved payment workspace for AI agents across EVM, Solana, and Gno. An agent can discover supported rails, prepare server-bound terms, and open the correct wallet review screen. The person still connects the wallet and approves the exact transaction.

**Live app:** https://x402-agent-gateways.gentle-berry-8248.chatgpt.site

**WebMCP workspace:** `/webmcp`

**Human payment review:** `/pay` for EVM and Solana, `/wallet` for Gno Pearl

The chain-neutral control plane uses the official x402 TypeScript packages for protocol types, the facilitator client, EVM definitions, and SVM Exact payload construction. The browser assembles the EVM EIP-3009 authorization from those definitions with viem and EIP-1193; Solana payload construction uses the official SVM Exact client. Gno retains its native TM2 v1 adapter. Every challenge is persisted before signing and bound to the expected payer, resource, network, asset, amount, recipient, and expiry.

## Honest support status

| Rail             | Wallet and payment path                                                        | Current status                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base Sepolia     | EIP-6963/EIP-1193 wallet, USDC, x402 `exact`, EIP-3009/EIP-712                 | `sdk_ready`; automated evidence uses deterministic SDK and mocked-facilitator tests. A real-wallet facilitator settlement has not yet been recorded for this release.                                                |
| Ethereum mainnet | Same v2 EVM adapter using Ethereum USDC                                        | Implemented but locked. It requires both EVM mainnet gates, a verified recipient, and a production facilitator that advertises `eip155:1`.                                                                           |
| Solana Devnet    | Wallet Standard, USDC, x402 `exact`, v0 transaction with facilitator fee payer | `sdk_ready`; automated evidence uses deterministic SDK and mocked-facilitator tests. A real-wallet facilitator settlement has not yet been recorded for this release. The recipient must have the required USDC ATA. |
| Solana mainnet   | Same v2 SVM adapter using mainnet USDC                                         | Implemented but locked. It requires both Solana mainnet gates, a verified recipient with its USDC ATA, an HTTPS mainnet RPC, and a production facilitator that advertises the mainnet network.                       |
| Gno Pearl        | Adena `SignTx`, direct WUGNOT, native TM2 verifier and broadcaster             | Native v1 path retained. Gno mainnet has an independent lock. The optional `g402pay` realm is source- and test-complete but not deployed.                                                                            |

`sdk_ready` means the application's SDK-integrated code path can construct, validate, and submit that rail. It is not a claim that a live wallet transfer has been completed or that every successful facilitator response has been independently reconciled on-chain.

The built-in EVM and Solana fallback recipients are testnet demo sinks, not merchant accounts. They have no repository-owned spending key and must not be used as evidence of merchant revenue. Configure a verified testnet merchant recipient before recording a live acceptance transaction.

## Human + agent workflow

1. The agent calls `list_payment_rails` and sees five rail definitions, including the independently locked mainnets.
2. The agent calls `prepare_agent_payment` for Base Sepolia, Solana Devnet, or Gno Pearl. Mainnet is deliberately excluded from this WebMCP action.
3. The server generates the `challengeId`, `paymentId`, and EVM authorization nonce where applicable, then persists the short-lived wallet-bound terms. The client only echoes these identifiers; it never invents them. No signature or transfer occurs.
4. The agent calls `open_payment_review` to navigate to `/pay` or `/wallet`.
5. Immediately before the wallet prompt, the UI calls the server-side review endpoint. The server revalidates the stored challenge, payer, resource, and terms. For Solana it first validates the prior unsigned message, then builds a fresh SDK payload with a current blockhash and atomically replaces the stored message hash while keeping the same challenge, payment ID, and requirements.
6. The human reviews and explicitly approves the EIP-712 signature, Solana v0 transaction, or Adena transaction.
7. The server verifies, atomically claims, and settles the payment. The paid resource unlocks only for a matching durable `settled` facilitator record.
8. If a pending result includes a valid transaction hash, an identical retry performs chain-native reconciliation instead of calling facilitator settlement again. EVM checks the finalized EIP-3009 call and Transfer log; Solana checks finalized status and the signed message hash.
9. If the outcome is unknown and no transaction hash exists, it remains manual pending and is never automatically re-submitted. An operator must reconcile it externally.
10. The agent can call `get_payment_receipt` with the exact server-issued payment ID.

## WebMCP tools

The top-level page registers seven imperative tools with `document.modelContext.registerTool`.

| Tool                    | Side effect                  | Purpose                                                                             |
| ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| `list_payment_rails`    | None                         | Read EVM, Solana, and Gno capabilities and independent mainnet readiness.           |
| `prepare_agent_payment` | Stores an expiring challenge | Prepare wallet-bound testnet terms for EVM, Solana, or Gno; never signs or settles. |
| `inspect_g402_gateway`  | None                         | Inspect the native Gno Pearl facilitator, Scan checkpoint, and Gno mainnet lock.    |
| `search_gno_activity`   | None                         | Search at most five canonical Pearl transactions.                                   |
| `prepare_pearl_payment` | Stores an expiring challenge | Prepare the dedicated Gno Pearl self-test path.                                     |
| `open_payment_review`   | Navigates the shared page    | Hand prepared terms to the matching human wallet screen.                            |
| `get_payment_receipt`   | None                         | Read one durable facilitator receipt, with Gno block data when indexed.             |

Suggested prompt:

> List the available payment rails. Prepare a Base Sepolia payment for my connected EVM address, then open the human review screen. Do not sign or settle anything for me.

WebMCP does not receive wallet custody. The agent cannot enable mainnet, change the configured merchant recipient, provide a signed payload, or bypass the review step. Public facilitator mode applies only to bounded x402 payment-protocol operations; agent, policy, budget, approval, metrics, index, and payment-list administration always requires a configured bearer key.

## x402 HTTP flow

The chain-neutral resource is `/api/demo/multichain-paid-data`. Its first unauthenticated response is HTTP 402 with discovery guidance. Because EVM and Solana terms must be bound to a known wallet, the complete `Payment-Required` value is issued by this preflight:

```http
POST /api/v2/challenges
Content-Type: application/json

{
  "railId": "evm-base-sepolia",
  "walletAddress": "0x...",
  "resourceId": "weather"
}
```

The 201 response includes server-issued `challengeId` and `paymentId`, the structured `paymentRequired` value, and the same requirements in the `Payment-Required` response header. The client then uses `/api/v2/review`, `/api/v2/verify`, and `/api/v2/settle`, always echoing the issued identifiers. After a successful settlement, retry the protected resource with `X-Payment-Id`.

The resource itself does not mint an unbound EVM or Solana challenge in its initial GET response. This wallet-bound preflight is intentional.

The native Gno flow remains on `/api/v1/challenges`, `/api/v1/verify`, and `/api/v1/settle`; `/api/demo/paid-data` returns its legacy-compatible terms.

## Repository map

| Path                    | Responsibility                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `app/pay`               | EIP-6963/EIP-1193 and Wallet Standard human review UI                                       |
| `app/wallet`            | Adena/Gno Pearl human review UI                                                             |
| `app/api/v2`            | Chain-neutral rail discovery, challenge, review, verify, settle, and receipt APIs           |
| `app/api/v1`            | Native Gno facilitator, Scan, payments, budgets, and supporting APIs                        |
| `lib/multichain.ts`     | Rail registry; official x402 facilitator/SVM clients; EVM protocol-definition orchestration |
| `lib/reconciliation.ts` | On-chain reconciliation for known EVM and Solana transaction hashes                         |
| `lib/webmcp.ts`         | Seven bounded WebMCP tools and client-side safety predicates                                |
| `lib/store.ts`          | D1/PostgreSQL challenge and settlement ledger with atomic claims                            |
| `lib/gno.ts`            | Gno/TM2 signing verification and RPC settlement                                             |
| `lib/scan.ts`           | Bounded Pearl indexer with common-ancestor reorg recovery                                   |
| `contracts/gno/g402pay` | Optional native-GNOT realm source and tests; not chain-deployed                             |
| `drizzle`               | Cloudflare D1 migrations packaged with the Site                                             |

The monorepo also contains separately gated Akash, Filecoin/IPFS, and Cosmos packages. They are not represented as active rails in the hosted chain-neutral payment demo.

## Local run

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The default v2 facilitator is public and testnet-oriented. Set verified merchant recipients before any real testnet acceptance. Keep all mainnet gates false during normal development.

## Quality gates

```bash
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

Automated EVM/SVM coverage uses deterministic official-SDK compatibility fixtures and mocked facilitator responses, including server-issued identifier binding, Solana review-time blockhash refresh, tamper, replay, known-transaction reconciliation, transaction-less manual pending, and response-mismatch cases. It does not replace manual wallet and testnet settlement acceptance.

## Deployment and safety

The primary target is ChatGPT Sites with the `DB` D1 binding declared in `.openai/hosting.json`. Mainnet adapters remain unavailable unless their independent allow flag and settlement flag are both true and all runtime prerequisites are present. The facilitator URL must be HTTPS without embedded credentials, query parameters, or fragments; an optional bearer token stays server-side.

Keep the Site private until judge access is explicitly configured. Before submission, complete the real-wallet testnet acceptance items, publish the source repository and demo video, and verify that judges can reach the deployment.

See `docs/ARCHITECTURE.md`, `docs/THREAT_MODEL.md`, `docs/DEPLOYMENT.md`, `docs/WEBMCP_CHALLENGE.md`, and `docs/RELEASE_CHECKLIST.md`.

## License

[Apache-2.0](LICENSE) for this repository. Network-specific upstream contracts, realms, providers, and data remain governed by their respective upstream terms.
