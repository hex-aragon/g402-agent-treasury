# Delivery plan and status

The Gno foundation is now exposed through a chain-neutral WebMCP payment workspace. The current release path is ChatGPT Sites + D1, with mainnet movement disabled.

1. Chain-neutral WebMCP — five rail definitions, seven tools, server-issued challenge/payment IDs, human wallet review, and exact receipt lookup implemented.
2. EVM/Solana v2 — Base Sepolia and Solana Devnet have official-package compatibility and mocked-facilitator coverage; real-wallet acceptance remains. Ethereum and Solana mainnets remain independently locked.
3. GnoLand g402 — direct WUGNOT facilitator + persistent Scan retained; one live Adena Pearl acceptance remains.
4. Akash x402 Gateway — complete; live AkashML/Console credentials remain.
5. Filecoin/IPFS Gateway — complete; Calibration sidecar/Lotus credentials remain.
6. Cosmos Native Facilitator — complete; operator-selected public testnet remains.

Each stage has a checkpoint under docs/checkpoints with implemented controls, verification and external blockers. Mainnet movement is not part of the staging release.

The next acceptance activities are one Base Sepolia EIP-1193 settlement, one Solana Devnet Wallet Standard settlement after ATA verification, one user-authorized Adena Pearl payment, and deployed seven-tool discovery. For v2, known pending transaction hashes can be reconciled on-chain; transaction-less unknown outcomes remain manual pending to prevent duplicate settlement. Akash, Filecoin and Cosmos remain separately gated local/mock products.
