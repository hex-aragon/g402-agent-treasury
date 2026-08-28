# Cosmos-native facilitator threat model

Assets are signer funds, feegrant allowance, IBC transfer intent, agent budgets, chain registry and settlement availability. Keplr/offline signer, facilitator, Postgres and each CometBFT RPC are separate trust boundaries.

| Threat | Control |
| --- | --- |
| Tx body/auth substitution | Verify signature over exact Protobuf SignDoc body/auth bytes |
| Signer substitution | Derive chain-prefix bech32 address from secp256k1 public key |
| Cross-chain replay | CAIP-2, chain ID and account number are signed; registry must match |
| HTTP replay | Memo binds payment ID, random nonce and method/URL resource hash |
| Duplicate broadcast | Unique payment ID/fingerprint and network/signer/nonce constraints |
| Recipient/amount mutation | Decode exactly one MsgSend or MsgTransfer and compare all fields |
| IBC misrouting | Require transfer port, allowlisted source channel, denom, receiver and future timeout |
| Feegrant abuse | AuthInfo fee granter must equal requirements and agent allowlist |
| Sequence race | Signed sequence is persisted; CheckTx is authoritative; failed state is never silently retried |
| Chain spoofing | Registry fixes CAIP-2, native chain ID, prefix, RPC, denoms and channels |
| Mainnet movement | Settlement and mainnet flags are independent; mainnets are filtered while locked |

Only SIGN_MODE_DIRECT and a single signer/message are accepted. Multisig, amino, authz exec, wasm and unknown Any messages fail closed. CometBFT commit is treated as BFT finality; chains with nonstandard finality or optimistic bridges need a chain-specific confirmation adapter. IBC acknowledgement is not destination-chain settlement: the current receipt proves source-chain packet commitment only.
