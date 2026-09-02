import { NextRequest,NextResponse } from "next/server";
import { authorize,safeError } from "@/lib/http";
import { findPayment,listPayments } from "@/lib/store";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!authorize(req)&&process.env.NODE_ENV==="production")return safeError("unauthorized",401);const params=new URL(req.url).searchParams,paymentId=params.get("paymentId");if(paymentId){if(!/^[A-Za-z0-9_-]{16,128}$/.test(paymentId))return safeError("invalid_payment_id");return NextResponse.json({payment:await findPayment(paymentId)},{headers:{"cache-control":"no-store"}})}const limit=Math.min(200,Math.max(1,Number(params.get("limit")||50)));return NextResponse.json({payments:await listPayments(limit)},{headers:{"cache-control":"no-store"}})}
