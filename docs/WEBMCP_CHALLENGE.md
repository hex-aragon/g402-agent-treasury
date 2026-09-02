# WebMCP Challenge implementation

## Product claim

x402 Agent Gateways lets a person and an AI agent coordinate one payment workflow across EVM, Solana, and Gno without giving the agent wallet custody. The agent can inspect rail capabilities, prepare wallet-bound testnet terms, and open the matching review UI. The person sees those same terms and remains the only signer.

The implementation is deliberately precise about evidence:

- Base Sepolia and Solana Devnet use official x402 protocol/facilitator packages; Solana construction uses the official SVM Exact client, while the EVM browser builds the EIP-3009 authorization with viem/EIP-1193 from official x402 definitions. Deterministic SDK-compatibility and mocked-facilitator coverage is included.
- A real-wallet EVM or Solana facilitator settlement has not yet been recorded for this release.
- Ethereum and Solana mainnet adapter paths exist but are locked behind two flags and runtime prerequisites.
- Gno Pearl retains its native v1 Adena/TM2 path.
- The optional Gno `g402pay` realm is source- and test-complete but not deployed.

## Seven registered tools

| Tool                    | Agent capability                                          | Consequential boundary                                           |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| `list_payment_rails`    | Read all five rail definitions and mainnet readiness      | Cannot change configuration                                      |
| `prepare_agent_payment` | Prepare Base Sepolia, Solana Devnet, or Gno Pearl terms   | Stores a challenge; never signs or settles; mainnet IDs rejected |
| `inspect_g402_gateway`  | Read native Gno facilitator, Scan, and lock status        | Read-only                                                        |
| `search_gno_activity`   | Search at most five canonical Pearl records               | Read-only; output treated as untrusted chain content             |
| `prepare_pearl_payment` | Prepare the dedicated fixed Gno self-test                 | Stores a challenge; never signs or settles                       |
| `open_payment_review`   | Navigate to the wallet screen that matches prepared terms | Changes visible route only                                       |
| `get_payment_receipt`   | Read one exact durable payment ID                         | Read-only; receipt content treated as untrusted                  |

The top-level layout registers the tools through `document.modelContext.registerTool`. One `AbortController` owns their lifecycle so remounts cannot leave stale registrations.

## Human + agent flow

### EVM or Solana

1. The agent calls `list_payment_rails`.
2. The user supplies an EVM or Solana wallet address and the agent calls `prepare_agent_payment` with `evm-base-sepolia` or `svm-solana-devnet`.
3. `/api/v2/challenges` confirms facilitator support, generates the challenge ID, payment ID, and EVM nonce where applicable, stores their exact bindings, and returns `Payment-Required`. The client cannot choose these identifiers.
4. The prepared terms are saved to the shared session and rendered in `/webmcp`.
5. The agent calls `open_payment_review`, which navigates to `/pay`. No wallet request has occurred yet.
6. The human connects the exact wallet. The page compares its address and every displayed term with fresh `/api/v2/rails` metadata.
7. Before signing, `/api/v2/review` validates the stored resource object, requirements hash, expected payer, and prior Solana unsigned message. For Solana it then fetches a current blockhash, atomically replaces the stored message hash, and returns a refreshed unsigned payload without changing the challenge/payment ID or requirements.
8. The wallet shows an EIP-712 authorization or the refreshed Solana v0 transaction. The person explicitly approves or rejects it.
9. `/api/v2/settle` verifies with the facilitator, atomically claims the challenge/payment ID, submits settlement, and validates the returned network, payer, amount when present, and transaction identifier.
10. The paid resource unlocks only for a matching durable settled record. A retry for a pending record with a known transaction hash performs EVM/Solana chain reconciliation without another facilitator settlement call. A transaction-less unknown outcome remains manual pending. The agent can call `get_payment_receipt` with the server-issued payment ID.

### Gno Pearl

1. The agent uses `prepare_agent_payment` with `gno-pearl` or the specialized `prepare_pearl_payment`.
2. The server creates a v1 native direct-WUGNOT challenge for the supplied Adena address.
3. `open_payment_review` navigates to `/wallet`.
4. The human approves the exact Adena `SignTx` request.
5. The native verifier checks TM2 bytes and signer/address binding before Pearl broadcast and durable receipt storage.

## Why WebMCP materially helps

Payments combine machine-readable protocol work with a decision that should stay human. Screen automation would have to infer rail status, copy addresses and payment IDs, and guess which wallet flow applies. WebMCP exposes those steps as bounded operations with explicit schemas while leaving signing outside the agent's authority.

The result is a verifiable handoff: agent and person operate on one server-issued challenge instead of reconstructing terms independently. That makes tampering, stale state, and wallet mismatch detectable before a signature prompt.

## Wallet-bound Payment-Required preflight

`GET /api/demo/multichain-paid-data` returns HTTP 402 and discovery guidance, but it does not mint complete unbound EVM/Solana terms. The payer is needed to construct and persist the authorization safely.

`POST /api/v2/challenges` is therefore the challenge preflight. It returns the structured `paymentRequired` value and a base64 `Payment-Required` header. After settlement, the client retries the protected resource with `X-Payment-Id`.

This is an intentional two-step resource interaction, not a claim that the protected GET itself supplies the final wallet-specific header.

## Implementation map

- `app/WebMCPProvider.tsx`: top-level registration and lifecycle cleanup
- `lib/webmcp.ts`: seven tool schemas, bounded results, safety predicates, and session handoff
- `app/webmcp/WebMCPWorkbench.tsx`: capability state, prepared terms, and session-scoped activity
- `app/pay/MultichainPayClient.tsx`: EIP-6963/EIP-1193 and Wallet Standard review/sign flows, including explicit selection when multiple wallets are present
- `app/wallet/WalletClient.tsx`: Adena/Gno review/sign flow
- `app/api/v2/rails`: rail metadata, statuses, facilitator origin, and mainnet readiness
- `app/api/v2/challenges`: wallet-bound challenge and `Payment-Required` preflight
- `app/api/v2/review`: last server-side validation before signing
- `app/api/v2/verify` and `app/api/v2/settle`: facilitator-backed validation and settlement
- `lib/reconciliation.ts`: finalized on-chain validation for known pending EVM/Solana transaction hashes
- `app/api/v1/payments`: exact durable receipt lookup used by the shared receipt tool

## Safety properties

The multichain WebMCP preparation path fails closed unless:

- the rail ID is exactly Base Sepolia, Solana Devnet, or Gno Pearl
- the wallet address is valid for that family
- fresh server rail metadata agrees with network, asset, price, recipient, timeout, status, and non-mainnet classification
- the facilitator advertises the selected v2 testnet network
- the challenge resource is the same-origin paid-data endpoint
- the expected payer matches the supplied wallet
- the challenge ID, payment ID, and EVM nonce were server-issued and are echoed unchanged
- EVM validity extras or Solana fee payer, memo, and initial unsigned message are present and exact
- Solana signs only the review response refreshed with a current blockhash

The tools expose no mainnet mutation, raw settlement function, arbitrary signed payload input, internal index synchronization, recipient configuration, policy administration, or credentials.

## Test instructions

### ChatGPT in-app browser

1. Open the deployed `/webmcp` route.
2. Verify that seven Site tools are registered.
3. Ask the agent to list rails and explain which are testnet-ready and which are locked.
4. Prepare one Base Sepolia payment for an EIP-1193 address. Confirm that no wallet prompt appears during preparation.
5. Open review, connect the exact wallet, compare network/asset/amount/recipient, and cancel before signing unless funded testnet acceptance is intended.
6. Repeat preparation with a Solana Devnet Wallet Standard address. Confirm the 60-second validity window and that review returns a refreshed transaction for signing while preserving the challenge and payment ID.
7. Prepare Gno Pearl terms and confirm that review routes to Adena rather than `/pay`.
8. Test a mismatched wallet, expired terms, changed resource, and canceled signature.

### Manual acceptance still required

- one funded EIP-1193 Base Sepolia USDC settlement through the configured facilitator
- one funded Wallet Standard Solana Devnet USDC settlement, after verifying the recipient ATA
- one user-authorized Adena Pearl direct-WUGNOT settlement on the exact release build
- receipt lookup and paid-resource retry for each completed testnet payment
- seven-tool discovery in ChatGPT's in-app browser

### Repository gates

```bash
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

Automated success does not waive the manual wallet items above.
