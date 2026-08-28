import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAdenaAccount } from "../lib/adena.ts";

test("normalizes the current Adena account model",()=>{const account=normalizeAdenaAccount({address:`g1${"q".repeat(38)}`,coins:"123ugnot",accountNumber:"7",sequence:"9",chainId:"pearl-1"});assert.deepEqual({address:account.address,accountNumber:account.accountNumber,sequence:account.sequence,chainId:account.chainId},{address:`g1${"q".repeat(38)}`,accountNumber:"7",sequence:"9",chainId:"pearl-1"})});

test("supports legacy snake-case account fields",()=>{const account=normalizeAdenaAccount({address:`g1${"q".repeat(38)}`,coins:[],account_number:7,sequence:9,chain_id:"pearl-1"});assert.equal(account.accountNumber,"7");assert.equal(account.chainId,"pearl-1")});
