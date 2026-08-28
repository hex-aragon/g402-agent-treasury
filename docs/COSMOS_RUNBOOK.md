# Cosmos-native facilitator runbook

Start with localnet or an operator-approved persistent testnet. Keep both flags false until official direct-sign vectors, RPC health, faucet funds and chain-specific denominations/channels are verified. Run the Cosmos E2E registry probe and complete one bank and one IBC transfer manually with Keplr.

For sequence errors, do not alter or rebroadcast the signed TxRaw. Ask the agent to query current account state, create a new payment ID/nonce and sign again. For RPC disagreement, disable settlement and compare tx hash and block app hash across independent endpoints.

Feegrant incidents require disabling the affected policy, revoking the on-chain allowance and rotating sponsor controls. An IBC timeout or missing acknowledgement is handled by the chain's refund path; never mark destination delivery based only on source broadcast.

Alert on CheckTx/DeliverTx failures above 1%, any nonce conflict, policy denials spike, RPC latency above five seconds, and a chain registry change. Mainnet addition requires two-person review and a separate environment change.
