# x402 Agent Gateways threat model

## Scope and trust boundaries

Protected assets are buyer funds, merchant revenue, challenge integrity, paid resources, settlement idempotency, canonical Gno history, and operator credentials. Trust zones are the WebMCP agent, browser UI, wallet extension, Vercel resource server, authoritative Neon PostgreSQL ledger, external x402 facilitator, chain RPC, and Gno Scan indexer.

The production PostgreSQL schema is current through `db/migrations/015_railway_scan.sql`.

Wallet private keys must remain inside EIP-1193, Wallet Standard, or Adena. WebMCP may prepare and navigate, but it cannot sign, settle, change a recipient, or enable a mainnet rail.

## Implemented controls

| Threat                                                      | Control                                                                                                                                                        | Evidence                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Recipient, amount, asset, network, or resource substitution | Server-issued exact requirements and resource object are hashed and stored before signing; review, verify, and settle reload and compare them                  | Multichain binding/tamper tests         |
| Payer substitution                                          | Challenge stores the expected wallet; EVM compares case-insensitively, Solana and Gno exactly; facilitator verification and settlement payer are checked again | Multichain tests                        |
| EVM authorization mutation                                  | EIP-3009/EIP-712 fields pin `from`, `to`, value, authorization nonce, `validAfter=0`, and `validBefore`                                                        | SDK fixture and binding tests           |
| Solana transaction mutation                                 | Server validates the initial message, creates a fresh SDK payload during review, atomically replaces its hash, and accepts only the refreshed signed message   | SDK fixture and review-refresh tests    |
| Solana address or mint case confusion                       | SVM addresses and assets are exact and case-sensitive; Kit address parsing validates configured addresses                                                      | Registry/schema tests                   |
| Stale Solana blockhash                                      | Review obtains a current blockhash while retaining the same challenge/payment ID; challenges with less than 15 seconds remaining are rejected                  | Review-refresh/expiry tests             |
| Cross-resource or cross-chain replay                        | Server-issued challenge ID, payment ID, EVM nonce, resource hash, network, asset, amount, recipient, payer, and expiry are persisted                           | Store/multichain tests                  |
| Duplicate settlement or idempotency-key mutation            | Unique payment ID/challenge claims and fingerprint comparison occur before external settlement                                                                 | Store/migration/concurrency tests       |
| Lost response with a known transaction                      | `broadcast` plus a valid hash is durable; an identical retry reconciles finalized chain data and never invokes facilitator settlement again                    | Known-transaction reconciliation tests  |
| Lost response without a transaction hash                    | Unknown outcome remains manual pending; retries return the stored state and never risk automatic re-submission                                                 | Transaction-less pending tests          |
| False facilitator success                                   | Success tuple checks network, payer, optional amount, and family-specific transaction identifier; mismatch stays pending and does not unlock                   | Response-mismatch tests                 |
| Signed payload larger than intended                         | v2 review, verify, and settle reject envelopes over 500 KB; schemas are strict and bounded                                                                     | Schema tests                            |
| Unauthorized resource read                                  | Unlock requires a settled facilitator record, consumed challenge, and exact resource/network/asset/amount/recipient/payer binding                              | Store/resource tests                    |
| Scan row mistaken for payment authorization                 | Chain-indexed rows have source `chain`; the protected resource accepts source `facilitator` only                                                               | Store/resource tests                    |
| Agent-triggered mainnet movement                            | WebMCP preparation accepts testnet rail IDs only; EVM and Solana mainnets require two independent flags plus runtime prerequisites                             | WebMCP/rail tests                       |
| Accidental mainnet configuration                            | Locked status is default; challenge creation also requires facilitator `/supported` confirmation for the exact network                                         | Rail tests and runtime check            |
| Facilitator credential leakage                              | Custom URLs require HTTPS without userinfo/query/fragment; bearer token is server-only; public discovery returns only origin                                   | URL/config tests                        |
| Gno direct-transfer substitution                            | Native verifier decodes one supported Amino message and compares exact fields and memo binding                                                                 | Gno tests                               |
| Gno signer substitution                                     | Native verifier derives the g1 address from the signed secp256k1 public key                                                                                    | Gno tests                               |
| Gno contract replay/spoofing                                | Realm source pins call path/method/coins/payment fields and uses payment-ID uniqueness; realm remains disabled until deployed                                  | Gno realm source/tests; deployment gate |
| Reorg or misleading Gno status                              | Fork-preserving blocks, canonical checkpoint, confirmations, common-ancestor rewind, and `reverted` state                                                      | Indexer tests                           |
| API abuse                                                   | Authorization policy, shared rate buckets, strict schemas, integer/address bounds, cache controls, and bounded search output                                   | HTTP/store tests                        |
| Public protocol mode grants management access               | Public x402 operations and operator routes use separate checks; management fails closed without a configured bearer key                                        | HTTP authorization tests                |
| Forwarded-IP spoofing bypasses rate limits                  | Production identity prefers Vercel's platform-controlled `X-Real-IP` boundary, retains a legacy provider-overwritten IP-header fallback, and ignores caller-controlled forwarding chains | HTTP proxy-boundary tests                |
| Web injection/clickjacking                                  | CSP, frame denial, MIME, and permissions headers                                                                                                               | Runtime headers/config                  |

## Mainnet gates

Code support is not operational authorization.

- Ethereum settlement requires both `X402_ALLOW_EVM_MAINNET=true` and `X402_ENABLE_EVM_MAINNET_SETTLEMENT=true`, a verified Ethereum recipient, and a production facilitator that advertises `eip155:1`.
- Solana settlement requires both `X402_ALLOW_SOLANA_MAINNET=true` and `X402_ENABLE_SOLANA_MAINNET_SETTLEMENT=true`, a verified recipient with the correct USDC associated token account, an HTTPS mainnet RPC, and a production facilitator that advertises Solana mainnet.
- Gno mainnet remains independently controlled by `G402_ALLOW_MAINNET`, `G402_ENABLE_SETTLEMENT`, explicit mainnet network configuration, and a verified merchant address.

No mainnet gate should be enabled for the hackathon demonstration.

## Residual risks and release restrictions

- Automated verification passed 118/118 tests on 2026-09-03. Recorded real-wallet payments remain 0 across Base Sepolia, Solana Devnet, and Gno Pearl; deterministic and mocked evidence must not be presented as live settlement.
- The external facilitator is trusted to verify and broadcast correctly. Response binding prevents an inconsistent success from unlocking content. A later retry independently reconciles a known pending EVM/Solana transaction, but immediate facilitator successes are not automatically chain-indexed; production still needs continuous receipt monitoring.
- Solana settlement can fail when the recipient lacks the associated token account for the configured USDC mint. Provision and verify the ATA before any live test or mainnet promotion.
- The fallback EVM and Solana recipients are testnet demo sinks, not merchant-controlled accounts. Testnet transfers to them are irreversible at the protocol level and do not demonstrate merchant receipt.
- Wallet extensions may present terms differently. Manual acceptance must compare the displayed network, asset, recipient, and amount with the in-app review.
- EIP-1193 and Wallet Standard discovery trusts extensions installed in the browser. Users must choose the intended wallet and reject unexpected prompts.
- A single facilitator or RPC is not Byzantine-resistant. Mainnet requires independent providers, finality policy, monitoring, and incident drills.
- A transaction-less unknown outcome cannot be safely auto-retried or chain-reconciled. It intentionally remains manual pending until an operator establishes whether a broadcast occurred.
- Gno has no EIP-3009 equivalent. Its pinned TM2 codec passes deterministic tests, but the exact release build still needs a user-authorized Adena Pearl acceptance check.
- `g402pay` is not deployed. Do not set realm mode or describe contract receipts as live until funded deployment, package-path verification, and acceptance are complete.
- The current bearer-protected Vercel cron runs one bounded snapshot daily at 03:00 UTC and can lag by design. It is not a continuous explorer; continuous indexing remains a future Railway persistent-worker topology.
- The public Vercel URL must not be presented as payment-ready merely because it renders. Non-owner access and real-wallet acceptance remain separate release checks.

An attacker cannot unlock the multichain sample with a signature alone. Authorization requires a matching durable settled record. Pending, broadcast, failed, mismatched, chain-derived, expired, or replay-mutated rows are rejected.
