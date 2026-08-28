# Akash x402 gateway threat model

## Assets and boundaries

Assets are prepaid agent funds, inference prompts/responses, provider credentials, deployment escrow, container environment values and metering receipts. The x402 settlement record, gateway, AkashML/provider, Console API and lifecycle worker are independent trust zones.

| Threat | Control |
| --- | --- |
| Quote substitution | Canonical request hash includes the body and agent; payment persists service quote ID |
| Payment reuse | Unique quote payment assignment and consumed quote state |
| Budget race | Quote checks service budget; durable usage and one request idempotency key |
| Token bill inflation | Preauthorization uses max output; recorded usage comes from provider response and cannot exceed reserved service access |
| Provider failure/retry storm | Circuit breaker, timeouts, idempotent cached response and failure state |
| Prompt leakage | Provider keys remain server-side; no prompt in audit metadata; no shared response cache |
| Arbitrary container execution | Image prefix allowlist, CPU/memory/storage/GPU/runtime caps and normalized SDL generation |
| YAML injection | Image/command/environment are schema bounded and JSON-quoted inside SDL |
| Runaway deployment | Durable close_after plus leader-elected lifecycle worker |
| Malicious/expensive bid | Provider allowlist and maximum uACT-per-block cap before lease acceptance |
| Akash mainnet spend | Independent enable and mainnet flags; mock default; lifecycle refuses to start while locked |
| Secret persistence | Deployment table stores resource metadata, never environment values |

Residual risks: provider-reported token counts require periodic tokenizer sampling; non-streaming is the only enabled inference mode; ACT/settlement-asset conversion is an operator-configured staging rate; Console API response schemas must be contract-tested against the operator account before unlocking. Workload images remain third-party code and must run only on Akash, never gateway hosts.
