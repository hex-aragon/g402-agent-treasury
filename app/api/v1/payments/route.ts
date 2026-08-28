import { NextRequest,NextResponse } from "next/server";
import { authorize,safeError } from "@/lib/http";
import { listPayments } from "@/lib/store";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!authorize(req)&&process.env.NODE_ENV==="production")return safeError("unauthorized",401);const limit=Math.min(200,Math.max(1,Number(new URL(req.url).searchParams.get("limit")||50)));return NextResponse.json({payments:await listPayments(limit)},{headers:{"cache-control":"no-store"}})}
