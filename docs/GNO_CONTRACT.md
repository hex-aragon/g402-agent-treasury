# g402pay Gno realm

`contracts/gno/g402pay` is the on-chain native-GNOT payment rail used by the x402 facilitator in realm mode.

## Atomic flow

1. The resource server returns an x402 challenge with `paymentMode=realm` and the deployed `contractPath`.
2. Adena signs one `/vm.m_call` to `g402pay.Pay` with the exact GNOT amount in `send`.
3. The realm accepts only a direct EOA call, binds payment ID, merchant, amount, resource hash and nonce, rejects duplicate IDs, forwards the exact GNOT atomically, stores the immutable receipt and emits `G402Payment`.
4. The facilitator reconstructs and verifies every bound field and the signer before broadcasting.
5. The indexer reconciles the `G402Payment` event and handles confirmations and reorg rollback.

## Local checks

Install the official `gno` and `gnokey` binaries for the target release, then run:

```bash
gno fmt contracts/gno/g402pay
gno lint contracts/gno/g402pay
gno test contracts/gno/g402pay
```

## Staging deployment

Never put a mnemonic or private key in this repository or environment file. `GNO_KEY_NAME` references a key already stored in the local `gnokey` keybase.

```bash
export GNO_DEPLOYER_ADDRESS=g1...
export GNO_KEY_NAME=staging-deployer
export GNO_CHAIN_ID=staging
export GNO_RPC_URL=https://rpc.staging.gno.land:443
npm run contract:gno:deploy
```

After the transaction succeeds, configure the web and worker environments:

```text
G402_PAYMENT_MODE=realm
G402_CONTRACT_PATH=gno.land/r/<deployer-address>/g402pay
GNO_ASSET=ugnot
GNO_DENOM=ugnot
```

Keep `G402_ALLOW_MAINNET=false`. The deployment script refuses every chain except `staging` and `pearl-1`.

## Acceptance

- Query the deployed package source and `PaymentCount`.
- Complete one Adena `Pay` call on staging.
- Confirm merchant balance increase, unique receipt, `G402Payment` event and facilitator settlement.
- Replay the same payment ID and verify the realm rejects it.
- Mutate recipient, amount, resource hash, nonce and contract path and verify the facilitator rejects each transaction before broadcast.
- Verify reorg reconciliation marks a removed payment reverted.
