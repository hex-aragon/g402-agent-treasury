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

## Pearl deployment

Never put a mnemonic or private key in this repository or environment file. `GNO_KEY_NAME` references a key already stored in the local `gnokey` keybase.

```bash
export GNO_DEPLOYER_ADDRESS=g1...
export GNO_KEY_NAME=pearl-deployer
export GNO_CHAIN_ID=pearl-1
export GNO_RPC_URL=https://rpc.pearl.testnets.gno.land
npm run contract:gno:deploy
```

After the transaction succeeds, configure the web and worker environments:

```text
G402_PAYMENT_MODE=realm
G402_CONTRACT_PATH=gno.land/r/<deployer-address>/g402pay
GNO_ASSET=ugnot
GNO_DENOM=ugnot
```

Keep `G402_ALLOW_MAINNET=false`. The deployment script refuses every chain except `staging` and `pearl-1`. Pearl is the current release target; Staging remains a legacy developer network.

The hosted product currently uses direct WUGNOT transfer mode. Do not set `G402_PAYMENT_MODE=realm` until the package exists at the configured Pearl path and every acceptance item below has passed.

## Acceptance

- Query the deployed package source and `PaymentCount`.
- Complete one Adena `Pay` call on Pearl.
- Confirm merchant balance increase, unique receipt, `G402Payment` event and facilitator settlement.
- Replay the same payment ID and verify the realm rejects it.
- Mutate recipient, amount, resource hash, nonce and contract path and verify the facilitator rejects each transaction before broadcast.
- Verify reorg reconciliation marks a removed payment reverted.
