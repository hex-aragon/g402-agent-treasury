import test from "node:test";import assert from "node:assert/strict";import {extractTransfers,planReorg} from "../lib/indexer.ts";
test("continues canonical chain",()=>assert.equal(planReorg({height:10,hash:"A"},{height:11,hash:"B",parentHash:"A",txs:[]}).reorg,false));
test("detects parent mismatch",()=>assert.equal(planReorg({height:10,hash:"A"},{height:11,hash:"B",parentHash:"X",txs:[]}).reorg,true));
test("extracts transfer events",()=>{const events=extractTransfers({txs_results:[{code:0,events:[{type:"Transfer",attributes:[{key:"from",value:"g1a"},{key:"to",value:"g1b"},{key:"value",value:"42"}]}]}]});assert.equal(events[0].amount,"42")});
