import test from "node:test";
import assert from "node:assert/strict";
import {rawCidV1,isCid,sha256Hex} from "../packages/filecoin/src/cid.ts";
import {quoteRetrieval,quoteStorage} from "../packages/filecoin/src/pricing.ts";
import {FilecoinPayAdapter} from "../packages/filecoin/src/adapters.ts";
test("raw CIDv1 is deterministic and content addressed",()=>{const a=rawCidV1(Buffer.from("hello"));assert.equal(a,rawCidV1(Buffer.from("hello")));assert.notEqual(a,rawCidV1(Buffer.from("world")));assert.equal(isCid(a),true);assert.equal(sha256Hex(Buffer.from("hello")).length,64)});
test("storage quote scales by retention and replicas",()=>assert.ok(BigInt(quoteStorage(1_000_000,60,3).paymentAmount)>BigInt(quoteStorage(1_000_000,30,1).paymentAmount)));
test("retrieval quote is positive",()=>assert.ok(BigInt(quoteRetrieval(1024).paymentAmount)>0n));
test("Filecoin Pay fails closed outside mock/calibration",async()=>{const old=process.env.FILECOIN_MOCK;process.env.FILECOIN_MOCK="false";process.env.FILECOIN_NETWORK="mainnet";await assert.rejects(()=>new FilecoinPayAdapter().commit({cid:"bafk",size:1,days:1,replicas:1}),/filecoin_pay_locked/);process.env.FILECOIN_MOCK=old});
