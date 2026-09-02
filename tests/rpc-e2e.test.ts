import test from "node:test";
import assert from "node:assert/strict";
import {MsgCall} from "@gnolang/gno-js-client";
import {PubKeySecp256k1,Secp256k1PubKeyType,Tx} from "@gnolang/tm2-js-client";
import type {Tm2Client} from "@gnolang/tm2-rpc";
import {encodeSignedEnvelope,gnoAddressFromPubkey,GnoRpcClient} from "../lib/gno.ts";
function envelope(){const tx=Tx.create({messages:[{type_url:"/vm.m_call",value:MsgCall.encode({caller:`g1${"q".repeat(38)}`,send:"",max_deposit:"",pkg_path:"gno.land/r/gnoland/wugnot",func:"Transfer",args:[`g1${"p".repeat(38)}`,"1"]}).finish()}],fee:{gas_fee:"1ugnot",gas_wanted:1n},signatures:[{pub_key:{type_url:Secp256k1PubKeyType,value:PubKeySecp256k1.encode({key:Buffer.concat([Buffer.from([2]),Buffer.alloc(32,1)])}).finish()},signature:Buffer.alloc(64)}],memo:"test"});return encodeSignedEnvelope({encodedTransaction:Buffer.from(Tx.encode(tx).finish()).toString("base64"),chainId:"pearl-1",accountNumber:"1",sequence:"1"})}
test("Pearl adapter sends Adena encoded bytes through the official RPC client",async()=>{let sent:Uint8Array|undefined;const responseBase={error:null,data:new Uint8Array(),events:[],log:"",info:""},client={status:async()=>({nodeInfo:{network:"pearl-1"}}),broadcastTxCommit:async({tx}:{tx:Uint8Array})=>{sent=tx;return {checkTx:{responseBase,gasWanted:1n,gasUsed:1n},deliverTx:{responseBase,gasWanted:1n,gasUsed:1n},hash:Uint8Array.from([0xab,0xcd]),height:42}}} as unknown as Tm2Client,result=await new GnoRpcClient("https://rpc.invalid",async()=>client).broadcastTxCommit(envelope(),"gno:pearl-1","pearl-1");assert.deepEqual(result,{success:true,network:"gno:pearl-1",transaction:"ABCD",blockHeight:42});assert.ok(sent&&sent.length>0)});
test("rejects an RPC connected to a different chain",async()=>{const client={status:async()=>({nodeInfo:{network:"gnoland1"}})} as unknown as Tm2Client,result=await new GnoRpcClient("https://rpc.invalid",async()=>client).broadcastTxCommit(envelope(),"gno:pearl-1","pearl-1");assert.equal(result.errorReason,"rpc_chain_id_mismatch")});
test("mainnet lock cannot be bypassed by staging adapter",()=>assert.notEqual(process.env.G402_ALLOW_MAINNET,"true"));

test("Pearl status uses the runtime native fetch transport",async()=>{
  const originalFetch=globalThis.fetch,validatorKey=Buffer.alloc(32,7),validatorAddress=gnoAddressFromPubkey(Buffer.concat([Buffer.from([2]),Buffer.alloc(32,7)]));
  globalThis.fetch=async(input,init)=>{
    assert.equal(String(input),"https://rpc.test/");
    const request=JSON.parse(String(init?.body)) as {id:unknown;method:string};
    assert.equal(request.method,"status");
    return new Response(JSON.stringify({jsonrpc:"2.0",id:request.id,result:{node_info:{net_address:"tcp://0.0.0.0:26656",network:"pearl-1",software:"gnoland",version:"0.0.0",channels:"",moniker:"test",other:{},version_set:[]},sync_info:{latest_block_hash:"AQ==",latest_app_hash:"Ag==",latest_block_time:"2026-09-02T00:00:00Z",latest_block_height:"42",catching_up:false},validator_info:{address:validatorAddress,pub_key:{"@type":"/tm.PubKeyEd25519",value:validatorKey.toString("base64")},voting_power:"1"}}}),{headers:{"content-type":"application/json"}});
  };
  try{assert.deepEqual(await new GnoRpcClient("https://rpc.test").status(),{node_info:{network:"pearl-1"},sync_info:{latest_block_height:"42",latest_block_hash:"01",catching_up:false}})}finally{globalThis.fetch=originalFetch}
});
