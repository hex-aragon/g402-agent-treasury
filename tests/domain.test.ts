import test from "node:test";import assert from "node:assert/strict";
import { resourceHash,assertSettlementAllowed } from "../lib/domain.ts";
test("resource hash binds method and url",()=>{assert.notEqual(resourceHash("GET","https://a.test/x"),resourceHash("POST","https://a.test/x"))});
test("settlement fails closed",()=>{const old=process.env.G402_ENABLE_SETTLEMENT;delete process.env.G402_ENABLE_SETTLEMENT;assert.throws(()=>assertSettlementAllowed("gno:staging"),/settlement_disabled/);process.env.G402_ENABLE_SETTLEMENT=old});
test("mainnet needs independent lock",()=>{process.env.G402_ENABLE_SETTLEMENT="true";delete process.env.G402_ALLOW_MAINNET;assert.throws(()=>assertSettlementAllowed("gno:mainnet"),/mainnet_locked/);process.env.G402_ENABLE_SETTLEMENT="false"});
