import test from "node:test";
import assert from "node:assert/strict";
import { createGnoChallenge } from "../lib/challenge.ts";
import { validateIssuedChallenge } from "../lib/store.ts";

const payTo=`g1${"p".repeat(38)}`;
process.env.G402_SELF_TEST_MODE="true";
process.env.G402_PAYMENT_MODE="direct";
process.env.GNO_NETWORK_ID="gno:pearl-1";
process.env.GNO_CHAIN_ID="pearl-1";

test("accepts only the exact server-issued challenge",async()=>{const issued=await createGnoChallenge("https://api.test/paid","GET",{payTo,amount:"1000"});assert.equal((await validateIssuedChallenge(issued)).nonce,issued.extra.nonce);await assert.rejects(validateIssuedChallenge({...issued,amount:"1001"}),/challenge_mismatch/)});

test("server-side expiry cannot be extended by changing the returned object",async()=>{const issued=await createGnoChallenge("https://api.test/expiring","GET",{payTo,amount:"1000"}),tampered={...issued,extra:{...issued.extra,expiresAt:issued.extra.expiresAt+3600}};await assert.rejects(validateIssuedChallenge(tampered,issued.extra.expiresAt+1),/challenge_expired/)});
