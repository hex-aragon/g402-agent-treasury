# Checkpoint 04 — Cosmos Native x402

Status: local/mock testnet complete; public testnet selection and faucet credentials remain external.

Completed: strict CAIP-2 registry, Protobuf TxRaw/SignDoc direct verification, secp256k1 signer derivation, bank send, IBC transfer/timeouts, feegrant binding, Keplr offline signer, nonce/idempotency store, agent allowlist/budgets, CometBFT settle adapter, dashboard, policies API, metrics/alerts, official CosmJS signature vectors, mock E2E, threat model, runbook and chain addition guide.

External blockers: operator-selected persistent testnet RPC/faucet, live Keplr browser account and redundant RPCs. Run npm run e2e:cosmos and record one bank/IBC transaction before enabling testnet settlement. Mainnet remains filtered and locked.
