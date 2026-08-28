import {NextResponse} from "next/server";import {chainRegistry} from "@/packages/cosmos/src/registry";
export async function GET(){return NextResponse.json({chains:chainRegistry().map(c=>({...c,rpc:c.rpc?"configured":""}))},{headers:{"cache-control":"public, max-age=60"}})}
