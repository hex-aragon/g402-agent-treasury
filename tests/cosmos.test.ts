import assert from "node:assert/strict";
import test from "node:test";
import { verifyCosmosPayment } from "../packages/cosmos/src/codec.ts";
import { evaluateCosmosPolicy } from "../packages/cosmos/src/policy.ts";
import { assertCosmosSettlement } from "../packages/cosmos/src/registry.ts";
import { cosmosTestChain, makeCosmosVector } from "./helpers/cosmos-vector.ts";

test("verifies official direct-signed bank send", async () => {
  const { payload, requirements } = await makeCosmosVector();
  assert.equal(verifyCosmosPayment(payload, requirements, cosmosTestChain).valid, true);
});

test("verifies exact IBC transfer and timeout", async () => {
  const { payload, requirements } = await makeCosmosVector("ibc");
  assert.equal(verifyCosmosPayment(payload, requirements, cosmosTestChain).valid, true);
});

test("rejects feegrant substitution", async () => {
  const { payload, requirements } = await makeCosmosVector("bank", `cosmos1${"f".repeat(38)}`);
  assert.equal(verifyCosmosPayment(payload, { ...requirements, extra: { ...requirements.extra, feeGranter: `cosmos1${"g".repeat(38)}` } }, cosmosTestChain).reason, "fee_granter_mismatch");
});

test("Cosmos agent policy enforces IBC channel", async () => {
  const { requirements } = await makeCosmosVector("ibc");
  const decision = evaluateCosmosPolicy({
    id: crypto.randomUUID(), agentId: crypto.randomUUID(), enabled: true,
    allowedNetworks: [requirements.network], allowedRecipients: [requirements.payTo],
    allowedDenoms: [requirements.asset], allowedFeeGranters: [], allowedIbcChannels: [],
    maxPerPayment: "5000", dailyBudget: "10000", monthlyBudget: "50000",
  }, requirements, { daily: "0", monthly: "0" });
  assert.equal(decision.reason, "ibc_channel_not_allowed");
});

test("mainnet settlement needs independent flag", () => {
  process.env.COSMOS_ENABLE_SETTLEMENT = "true";
  process.env.COSMOS_ALLOW_MAINNET = "false";
  assert.throws(() => assertCosmosSettlement({ ...cosmosTestChain, testnet: false }), /cosmos_mainnet_locked/);
});
