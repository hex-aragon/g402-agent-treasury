# Filecoin/IPFS gateway threat model

Assets are prepaid funds, uploaded bytes, content metadata, Filecoin Pay rails, Lotus signing authority, retrieval vouchers and proof receipts. IPFS content integrity does not imply persistence; object state therefore separates uploaded, committing, active, degraded and expired.

| Threat | Control |
| --- | --- |
| Content/CID substitution | Gateway computes raw CIDv1 and SHA-256; IPFS return and every retrieval are rechecked |
| Quote/body substitution | Canonical hash binds CID, digest, size, retention, replicas, metadata and agent |
| Payment reuse | Payment stores service quote ID; quote payment is unique and request is idempotent |
| Oversized upload | Declared and actual byte limits; bounded metadata/tags; platform body limit remains lower bound |
| Fake persistence | Filecoin commitment and PDP proof receipts are distinct from IPFS upload receipt |
| Retrieval corruption | Full response size and CID are validated before bytes are returned |
| Search tenancy leak | Agent-scoped searches filter owner; public no-agent uploads are intentionally discoverable metadata |
| Payment-channel drain | Calibration/mainnet gates, dedicated Lotus token, fixed amount and receipt nonce |
| Sidecar compromise | Adapter has a narrow commitment API; keys stay in worker/server secrets; returned IDs are audited |
| Mainnet fund loss | Filecoin Pay and Paych each require enable; mainnet additionally requires independent allow flag |
| Stale proof | Leader-elected worker reconciles pending commitments and marks failed proof degraded |

Residual risks: raw-block CID differs from UnixFS file CIDs by design; Vercel uploads are limited and large objects need a presigned direct-upload extension; the Synapse/Filecoin Pin sidecar contract requires live Calibration fixtures; public IPFS content cannot be made private by this payment gateway. Encrypt client-side for confidentiality.
