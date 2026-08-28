import {createHash} from "node:crypto";
const ALPHABET="abcdefghijklmnopqrstuvwxyz234567";
function base32(bytes:Uint8Array){let acc=0,bits=0,out="";for(const byte of bytes){acc=(acc<<8)|byte;bits+=8;while(bits>=5){bits-=5;out+=ALPHABET[(acc>>>bits)&31]}}if(bits)out+=ALPHABET[(acc<<(5-bits))&31];return out}
export function sha256Hex(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex")}
export function rawCidV1(bytes:Uint8Array){const digest=createHash("sha256").update(bytes).digest(),cid=Buffer.concat([Buffer.from([0x01,0x55,0x12,0x20]),digest]);return `b${base32(cid)}`}
export function isCid(value:string){return /^bafkrei[a-z2-7]{52}$/.test(value)}
