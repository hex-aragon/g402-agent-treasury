# Architecture

The Next.js control plane is stateless. PostgreSQL owns idempotency, nonce uniqueness, policies, quotes, usage, receipts, audit events and index checkpoints. Browser wallets only sign. Provider and chain credentials exist only in server/worker secret stores.

~~~text
Agent / Wallet
      |
      | HTTP 402 -> signed payment -> paid retry
      v
Next.js control plane ------ PostgreSQL
  |       |       |              |
  Gno     Akash   Storage        audit / budgets / quotes
  |       |       |
  RPC     AI + Console          IPFS + Filecoin Pay + Lotus
  |       |       |
Gno indexer  Akash worker  Filecoin receipt worker
~~~

The packages share canonical request hashing, integer budget arithmetic, settlement interfaces and circuit breaking. Chain-specific codecs remain isolated because Gno TM2, Cosmos SDK Protobuf, Filecoin payment rails and Akash service accounting have different trust and finality models.

State transitions are monotonic except explicit reconciliation states such as reverted or degraded. Every external write follows durable claim-before-call idempotency. Human approval transitions use compare-and-swap.

See the product threat models for trust assumptions and residual risk.
