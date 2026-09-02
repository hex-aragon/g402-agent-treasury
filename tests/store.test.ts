import test from "node:test";
import assert from "node:assert/strict";
import { claimSettlement,findChallenge,findPayment,replaceChallengeUnsignedPayloadHash,resumeApprovedSettlement,saveChallenge,type PaymentRecord } from "../lib/store.ts";

function record(suffix:string,status:PaymentRecord["status"]="settling"):PaymentRecord{return {id:crypto.randomUUID(),paymentId:`pay_${suffix.padEnd(20,"x")}`,fingerprint:suffix.padEnd(64,"a"),nonce:`nonce_${suffix.padEnd(16,"n")}`,txHash:null,network:"gno:staging",payer:`g1${"q".repeat(38)}`,payTo:`g1${"p".repeat(38)}`,asset:"ugnot",amount:"1",status,error:null,createdAt:new Date().toISOString()}}
test("idempotent claim returns the original record",async()=>{const r=record("same");assert.equal((await claimSettlement(r)).claimed,true);const replay=await claimSettlement(r);assert.equal(replay.claimed,false);assert.equal(replay.existing?.fingerprint,r.fingerprint)});
test("same payment id with changed terms is rejected",async()=>{const r=record("conflict");await claimSettlement(r);await assert.rejects(()=>claimSettlement({...r,fingerprint:"b".repeat(64)}),/idempotency_conflict/)});
test("approval-required claim resumes once",async()=>{const r=record("approval","approval_required");await claimSettlement(r);assert.equal(await resumeApprovedSettlement(r.paymentId,r.fingerprint!),true);assert.equal(await resumeApprovedSettlement(r.paymentId,r.fingerprint!),false);assert.equal((await findPayment(r.paymentId))?.status,"settling")});

test("in-memory unsigned payload refresh is a real compare-and-swap",async()=>{
  const nonce=`cas_${crypto.randomUUID()}`,initial="0".repeat(64),next=["1".repeat(64),"2".repeat(64)];
  await saveChallenge({nonce,resource:"https://example.test/paid",resourceHash:"a".repeat(64),method:"GET",network:"solana:test",chainId:"test",asset:"mint",denom:"usdc",amount:"1",payTo:"recipient",paymentMode:"direct",unsignedPayloadHash:initial,expiresAt:Math.floor(Date.now()/1000)+60,createdAt:new Date().toISOString()});
  const results=await Promise.all(next.map(hash=>replaceChallengeUnsignedPayloadHash(nonce,initial,hash)));
  assert.equal(results.filter(Boolean).length,1);
  assert.equal((await findChallenge(nonce))?.unsignedPayloadHash,next[results.indexOf(true)]);
});
