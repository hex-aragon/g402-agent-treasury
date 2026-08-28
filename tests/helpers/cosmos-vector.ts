import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { DirectSecp256k1Wallet, encodePubkey, makeAuthInfoBytes } from "@cosmjs/proto-signing";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxBody, TxRaw, type SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import type { CosmosPayload, CosmosRequirements } from "../../packages/cosmos/src/domain.ts";
import { getChain } from "../../packages/cosmos/src/registry.ts";

export const cosmosTestChain = getChain("cosmos:localnet-1");
export const cosmosTestRecipient = `cosmos1${"p".repeat(38)}`;

export async function makeCosmosVector(type: "bank" | "ibc" = "bank", feeGranter?: string) {
  const now = Math.floor(Date.now() / 1000);
  const wallet = await DirectSecp256k1Wallet.fromKey(new Uint8Array(32).fill(9), "cosmos");
  const account = (await wallet.getAccounts())[0];
  const paymentId = `pay_cosmos_${type}_12345`;
  const requirements: CosmosRequirements = {
    scheme: "exact",
    network: cosmosTestChain.caip2,
    asset: "uatom",
    amount: "1234",
    payTo: type === "bank" ? cosmosTestRecipient : `osmo1${"z".repeat(38)}`,
    resource: "https://api.test/cosmos",
    maxTimeoutSeconds: 300,
    extra: {
      chainId: cosmosTestChain.chainId,
      nonce: `nonce_cosmos_${type}_1234`,
      resourceHash: "a".repeat(64),
      expiresAt: now + 300,
      transferType: type,
      sourceChannel: type === "ibc" ? "channel-0" : undefined,
      feeGranter,
    },
  };
  const message = type === "bank"
    ? { typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode({ fromAddress: account.address, toAddress: requirements.payTo, amount: [{ denom: "uatom", amount: "1234" }] }).finish() }
    : { typeUrl: "/ibc.applications.transfer.v1.MsgTransfer", value: MsgTransfer.encode({ sourcePort: "transfer", sourceChannel: "channel-0", token: { denom: "uatom", amount: "1234" }, sender: account.address, receiver: requirements.payTo, timeoutHeight: { revisionNumber: 0n, revisionHeight: 0n }, timeoutTimestamp: BigInt(Date.now() + 600_000) * 1_000_000n, memo: "", encoding: "" }).finish() };
  const bodyBytes = TxBody.encode(TxBody.fromPartial({ messages: [message], memo: `x402:${paymentId}:${requirements.extra.nonce}:${requirements.extra.resourceHash}` })).finish();
  const authInfoBytes = makeAuthInfoBytes([{ pubkey: encodePubkey(encodeSecp256k1Pubkey(account.pubkey)), sequence: 7 }], [{ denom: "uatom", amount: "500" }], 200_000, feeGranter, undefined);
  const signDoc: SignDoc = { bodyBytes, authInfoBytes, chainId: cosmosTestChain.chainId, accountNumber: 4n };
  const signed = await wallet.signDirect(account.address, signDoc);
  const raw = TxRaw.encode({ bodyBytes: signed.signed.bodyBytes, authInfoBytes: signed.signed.authInfoBytes, signatures: [fromBase64(signed.signature.signature)] }).finish();
  const payload: CosmosPayload = {
    x402Version: 2,
    scheme: "exact",
    network: cosmosTestChain.caip2,
    payload: { txBytes: Buffer.from(raw).toString("base64"), signer: account.address, paymentId, accountNumber: "4", createdAt: now },
  };
  return { payload, requirements };
}
