# Delivery plan and status

The Gno foundation is now exposed through a chain-neutral WebMCP payment workspace at `https://g402-agent-treasury.vercel.app`. The current release runs as Vercel Next.js, with dedicated Neon PostgreSQL as the sole production state authority and schema current through `db/migrations/015_railway_scan.sql`; mainnet movement is disabled.

1. Chain-neutral WebMCP — five rail definitions, seven tools, server-issued challenge/payment IDs, human wallet review, and exact receipt lookup implemented.
2. EVM/Solana v2 — Base Sepolia and Solana Devnet have official-package compatibility and mocked-facilitator coverage; real-wallet acceptance remains. Ethereum and Solana mainnets remain independently locked.
3. GnoLand g402 — direct WUGNOT facilitator and reorg-aware Scan retained. Production runs one protected bounded snapshot daily at 03:00 UTC; the code-ready Railway topology would run the same indexer persistently but is not deployed.
4. Akash x402 Gateway — complete; live AkashML/Console credentials remain.
5. Filecoin/IPFS Gateway — complete; Calibration sidecar/Lotus credentials remain.
6. Cosmos Native Facilitator — complete; operator-selected public testnet remains.

Each stage has a checkpoint under docs/checkpoints with implemented controls, verification and external blockers. Mainnet movement is not part of the staging release.

The latest automated verification passed 118/118 tests on 2026-09-03. Recorded real-wallet payments for this release remain 0 across Base Sepolia, Solana Devnet, and Gno Pearl.

The next acceptance activities are one Base Sepolia EIP-1193 settlement, one Solana Devnet Wallet Standard settlement after ATA verification, one user-authorized Adena Pearl payment, and a non-owner seven-tool discovery check on the Vercel deployment. For v2, known pending transaction hashes can be reconciled on-chain; transaction-less unknown outcomes remain manual pending to prevent duplicate settlement. Akash, Filecoin and Cosmos remain separately gated local/mock products.
