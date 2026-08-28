# Checkpoint 02 — Akash x402 Gateway

Status: local/mock staging complete; live provider and Console contract tests require operator credentials.

Completed: OpenAI-compatible models/chat routes, maximum-token pricing, provider region/health/price routing, quote-bound g402 settlement, agent service budgets, durable idempotency/usage, mock provider, constrained GPU/container SDL, bid selection, deployment lifecycle/auto-close worker, dashboard, rate limits, metrics, threat model, runbook and staging probe.

External blockers: AkashML and Console keys, a funded bounded Console wallet, live provider allowlist, and deployment API contract fixtures are not available. Both Akash deployment locks remain false. Run npm run e2e:akash against the deployed staging URL, then complete one inference and one short CPU lease before considering unlock.
