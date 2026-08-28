import assert from "node:assert/strict";
import test from "node:test";
import { settleCosmos } from "../packages/cosmos/src/facilitator.ts";
import { makeCosmosVector } from "./helpers/cosmos-vector.ts";

test("mock CometBFT settlement is idempotent", async () => {
  process.env.COSMOS_ENABLE_SETTLEMENT = "true";
  const { payload, requirements } = await makeCosmosVector();
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: "1", result: { hash: "COSMOS123", check_tx: { code: 0 }, deliver_tx: { code: 0 } } }), { status: 200, headers: { "content-type": "application/json" } });
  };
  try {
    const first = await settleCosmos(payload, requirements, "https://rpc.invalid");
    const replay = await settleCosmos(payload, requirements, "https://rpc.invalid");
    assert.equal(first.transaction, "COSMOS123");
    assert.equal(replay.replayed, true);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
