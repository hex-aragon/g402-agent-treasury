import { NextRequest,NextResponse } from "next/server";
import { authorizeAdmin,safeError } from "@/lib/http";
import { findPayment,listPayments } from "@/lib/store";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){const params=new URL(req.url).searchParams,paymentId=params.get("paymentId");if(paymentId){if(!/^[A-Za-z0-9_-]{16,128}$/.test(paymentId))return safeError("invalid_payment_id");return NextResponse.json({payment:await findPayment(paymentId)},{headers:{"cache-control":"private, no-store"}})}if(!authorizeAdmin(req))return safeError("unauthorized",401);const limit=Math.min(200,Math.max(1,Number(params.get("limit")||50)));return NextResponse.json({payments:await listPayments(limit)},{headers:{"cache-control":"no-store"}})}
