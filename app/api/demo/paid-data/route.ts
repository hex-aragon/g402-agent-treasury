import { NextRequest,NextResponse } from "next/server";
import { createGnoChallenge,paymentRequiredHeader } from "@/lib/challenge";
import { rateLimit,safeError } from "@/lib/http";
import { findAuthorizedSettledPayment } from "@/lib/store";
import { resourceHash } from "@/lib/domain";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){const limited=await rateLimit(req,20);if(limited)return limited;const resource=`${process.env.APP_URL||new URL(req.url).origin}/api/demo/paid-data`,paymentId=req.headers.get("x-payment-id");if(paymentId){const payment=await findAuthorizedSettledPayment(paymentId,resourceHash("GET",resource));if(payment)return NextResponse.json({city:"Seoul",temperatureC:24,conditions:"clear",paidBy:payment.payer,transaction:payment.txHash},{headers:{"cache-control":"private, no-store"}});return safeError("payment_not_finalized_or_wrong_resource",402)}try{const payTo=new URL(req.url).searchParams.get("payTo")||undefined,requirements=await createGnoChallenge(resource,"GET",{payTo});return NextResponse.json({error:"payment_required",x402Version:2,paymentRequirements:requirements},{status:402,headers:{"payment-required":paymentRequiredHeader(requirements),"cache-control":"no-store"}})}catch(e){return safeError(e instanceof Error?e.message:"challenge_failed",503)}}
