# Staging release checklist

## Automated

- npm ci uses the committed lockfile
- all tests, strict typecheck and Next production build pass
- npm audit reports no high vulnerabilities
- all Dockerfiles build in CI
- migrations apply in order to a clean database
- health exposes every lock without secrets

## Gno

- Adena SignTx golden transaction verifies and broadcasts on staging
- duplicate, altered fingerprint, approval and reorg drills pass
- worker reaches canonical head and restore/replay is tested

## Akash

- AkashML model and chat contract fixture passes
- Console create/bids/lease/delete fixture passes
- provider/bid allowlists and bounded wallet are reviewed
- overdue close drill pages and recovers

## Filecoin

- raw CID agrees with IPFS block/put
- Calibration commitment reaches confirmed PDP proof
- Paych is capped and retrieval integrity test passes
- sidecar/Lotus credentials are isolated

## Cosmos

- chain entry matches upstream registry and operator RPC
- Keplr bank and IBC direct signatures pass
- feegrant, wrong chain, timeout, sequence and replay failures pass
- mainnet chains remain filtered

## Human gates

- threat models reviewed independently
- point-in-time restore and incident drill recorded
- privacy/legal review completed for prompts and stored data
- two-person approval is configured for every mainnet flag
- no mainnet flag is enabled in the staging release
