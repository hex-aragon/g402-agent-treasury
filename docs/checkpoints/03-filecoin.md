# Checkpoint 03 — Filecoin/IPFS x402 Storage

Status: local/mock staging complete; Calibration Filecoin Pay sidecar and Lotus credentials remain external.

Completed: raw CIDv1 upload, retention/replica pricing, quote-bound g402 settlement, agent storage/retrieval/search budgets, IPFS block adapter, Filecoin Pay commitment adapter, Lotus Paych adapter, paid search and integrity-checked retrieval, storage/retrieval receipts, commitment/proof reconciliation worker, dashboard, mainnet safety gates, mock E2E, threat model and runbook.

External blockers: IPFS service, Calibration USDFC/tFIL funding, Filecoin Pin/Synapse sidecar, Lotus signing token and live proof periods. Run npm run e2e:filecoin, then one Calibration object through upload, commitment, proof and retrieval before any non-mock promotion.
