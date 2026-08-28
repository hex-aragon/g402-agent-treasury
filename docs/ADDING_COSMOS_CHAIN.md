# Adding a Cosmos chain

1. Take chain ID, bech32 prefix, RPC endpoints, fee/native denominations and network type from the upstream chain registry and verify them against the chain's own documentation.
2. Add a COSMOS_CHAINS_JSON entry with caip2 exactly equal to cosmos plus the native chain ID, for example cosmos:localnet-1. Set testnet explicitly.
3. List only payment denoms and IBC source channels that the facilitator operator accepts. An empty IBC list disables IBC.
4. Test RPC status, direct SignDoc bank vector, wrong-chain replay, feegrant, duplicate nonce and failed sequence.
5. Add the network to an agent policy. Run a funded testnet E2E and record tx hashes.
6. For mainnet, obtain security and operations approval, configure redundant RPCs, and separately enable COSMOS_ALLOW_MAINNET. Never reuse testnet keys.

Example JSON object: {"caip2":"cosmos:localnet-1","chainId":"localnet-1","rpc":"http://127.0.0.1:26657","bech32Prefix":"cosmos","testnet":true,"denoms":["uatom"],"ibcChannels":["channel-0"]}.
