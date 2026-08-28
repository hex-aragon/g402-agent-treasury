import { NextRequest,NextResponse } from "next/server";
import { authorizeAdmin,rateLimit,safeError } from "@/lib/http";
import { getScanStatus,syncGnoIndex } from "@/lib/scan";
export const dynamic="force-dynamic";
export async function GET(){try{return NextResponse.json({status:await getScanStatus()},{headers:{"cache-control":"no-store"}})}catch(error){return safeError(error instanceof Error?error.message:"index_status_failed",503)}}
export async function POST(req:NextRequest){const limited=await rateLimit(req,8,60_000);if(limited)return limited;if(!authorizeAdmin(req))return safeError("unauthorized",401);try{const body=await req.json().catch(()=>({})) as {maxBlocks?:number},result=await syncGnoIndex({maxBlocks:Math.min(30,Math.max(1,Number(body.maxBlocks||20)))});return NextResponse.json({ok:true,result,status:await getScanStatus()},{headers:{"cache-control":"no-store"}})}catch(error){return safeError(error instanceof Error?error.message:"index_failed",502)}}
