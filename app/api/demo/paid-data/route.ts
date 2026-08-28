import { NextRequest,NextResponse } from "next/server";
import { createGnoChallenge,paymentRequiredHeader } from "@/lib/challenge";
import { rateLimit,safeError } from "@/lib/http";
import { findPayment } from "@/lib/store";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){const limited=await rateLimit(req,20);if(limited)return limited;const paymentId=req.headers.get("x-payment-id");if(paymentId){const payment=await findPayment(paymentId);if(payment?.status==="settled")return NextResponse.json({city:"Seoul",temperatureC:24,conditions:"clear",paidBy:payment.payer},{headers:{"cache-control":"private, no-store"}});return safeError("payment_not_finalized",402)}try{const resource=`${process.env.APP_URL||new URL(req.url).origin}/api/demo/paid-data`,requirements=createGnoChallenge(resource);return NextResponse.json({error:"payment_required",x402Version:2,paymentRequirements:requirements},{status:402,headers:{"payment-required":paymentRequiredHeader(requirements),"cache-control":"no-store"}})}catch(e){return safeError(e instanceof Error?e.message:"challenge_failed",503)}}
