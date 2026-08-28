import { NextRequest,NextResponse } from "next/server";
import { getScanStatus,listScanBlocks,listScanTransactions } from "@/lib/scan";
import { rateLimit,safeError } from "@/lib/http";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){const limited=await rateLimit(req,60);if(limited)return limited;try{const url=new URL(req.url),query=url.searchParams.get("q")||"",limit=Math.min(200,Math.max(1,Number(url.searchParams.get("limit")||50)));return NextResponse.json({status:await getScanStatus(),blocks:await listScanBlocks(20),transactions:await listScanTransactions(limit,query)},{headers:{"cache-control":"no-store"}})}catch(error){return safeError(error instanceof Error?error.message:"scan_failed",503)}}
