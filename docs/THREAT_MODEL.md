# g402 threat model

## Scope and trust boundaries

Protected assets are buyer funds, merchant revenue, challenge integrity, facilitator availability, canonical indexed history and operator credentials. The browser wallet, resource server, facilitator, D1, RPC node and bounded indexer are separate trust zones. Buyer private keys never cross the Adena boundary. Optional PostgreSQL agent mode adds agent budgets and approval decisions as protected assets.

## Threats and implemented controls

| Threat | Control | Verification |
| --- | --- | --- |
| Recipient, amount or asset substitution | Decode one supported Amino message and compare exact fields | Gno tests |
| Contract-path or call-argument substitution | Realm mode pins `g402pay`, `Pay`, exact send coin, payment ID, merchant, amount, resource hash and nonce | Gno realm-mode tests |
| Contract receipt spoofing through another realm | Indexer exact-matches `/tm.gnoEvent`, package path, transaction fields, payer, recipient, amount, nonce and resource hash | Gno/indexer tests |
| Inter-realm payment confusion | `g402pay` accepts only a direct EOA `IsUserCall`, verifies origin/caller equality and forwards from its own realm account | Gno contract tests/live acceptance |
| Contract replay | Persistent AVL payment-ID uniqueness plus database payment-ID and nonce constraints | Gno/store tests |
| Signer substitution | Derive the g1 address from the signed secp256k1 public key | Gno tests |
| Resource/cross-chain replay | Signed chain ID, payment ID, random nonce and SHA-256 method/URL binding in memo | domain/Gno tests |
| Duplicate broadcast | Unique payment ID, fingerprint and network/payer/nonce constraints; claim before RPC | store tests/migrations |
| Idempotency-key mutation | A repeated payment ID with a different fingerprint fails with 409 | store tests |
| Concurrent human approval | Durable approval_required state and compare-and-swap transition | store tests |
| Agent budget bypass | Network, asset, allowlists, per-call/day/month limits and expiry checked twice | policy tests |
| Parser/resource exhaustion | Strict schemas, integer/address bounds, 500 KB envelope cap and rate limit | schemas |
| API key timing leak | SHA-256 and constant-time comparison | domain tests |
| Serverless replay/rate-limit bypass | D1 unique payment/nonce claims and atomic shared buckets; production challenge storage fails closed without durable state | store/rate-limit tests |
| Reorg/misleading status | Fork-preserving blocks, canonical checkpoint, confirmations, common-ancestor rewind and reverted state | indexer tests |
| RPC or settlement outage | Fail closed, timeout, alert webhook and durable reconciliation state | adapter/runbook |
| Mainnet fund movement | Independent settlement and mainnet flags, both default false | domain tests |
| Web injection/clickjacking | CSP, frame denial, MIME and permissions headers | Next config |

## Residual risks and release restrictions

- Gno has no EIP-3009 equivalent. The pinned official Gno/TM2 codec and current Adena response shape pass deterministic tests, but one user-authorized live Adena Pearl transaction remains a release acceptance item.
- `g402pay` source still requires compilation with the official Pearl `gno` binary and one funded deployment. Do not enable realm mode from source review alone.
- The realm currently supports native `ugnot` only. GRC20 stays on the direct-transfer path until a separately reviewed allowance/pull design is implemented.
- A single RPC is not Byzantine-resistant. Promotion requires two independent RPC providers and block/hash quorum.
- The private Site trusts the authenticated user header only for index administration. A public multi-merchant service requires scoped identities instead of the current coarse bearer-key fallback.
- Bounded request-driven indexing can lag when nobody visits or triggers sync. A production SLA requires scheduled authenticated POST calls or the persistent PostgreSQL worker.
- D1 rate buckets require bounded retention. Per-instance metrics and structured logs need platform aggregation.
- This Pearl testnet posture is not authorization for mainnet. Mainnet remains independently locked.

An attacker cannot obtain the sample resource using only a signature: it requires a durable settled record. Approval follows persistence of the exact fingerprint. A reorg changes settled records to reverted, which downstream services must reject.
