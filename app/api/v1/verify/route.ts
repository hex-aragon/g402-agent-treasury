import { NextRequest,NextResponse } from "next/server";
import { PaymentPayloadSchema,PaymentRequirementsSchema } from "@/lib/domain";
import { verifyGnoPayment } from "@/lib/gno";
import { authorize,rateLimit,safeError } from "@/lib/http";
import { enforceAgentPolicy } from "@/lib/payment-policy";
import { metrics } from "@/lib/observability";
export async function POST(req:NextRequest){const started=Date.now(),limited=await rateLimit(req);if(limited)return limited;if(!authorize(req))return safeError("unauthorized",401);try{const body=await req.json();const payload=PaymentPayloadSchema.parse(body.paymentPayload),requirements=PaymentRequirementsSchema.parse(body.paymentRequirements);const result=verifyGnoPayment(payload,requirements);if(result.isValid){const decision=await enforceAgentPolicy(requirements,payload.payload.paymentId);if(!decision.allowed)return NextResponse.json({isValid:false,invalidReason:decision.reason},{status:403,headers:{"cache-control":"no-store"}})}metrics.inc("g402_verifications",{network:payload.network,valid:result.isValid});metrics.observe("g402_verification_ms",Date.now()-started,{network:payload.network});return NextResponse.json(result,{status:result.isValid?200:400,headers:{"cache-control":"no-store"}})}catch(e){return safeError(e instanceof Error?e.message:"invalid_request")}}
