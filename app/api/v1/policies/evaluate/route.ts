import { NextRequest,NextResponse } from "next/server";
import { authorize,rateLimit,safeError } from "@/lib/http";
import { PaymentRequirementsSchema } from "@/lib/domain";
import { AgentPolicySchema,evaluatePolicy } from "@/lib/policy";
export async function POST(req:NextRequest){const limited=await rateLimit(req,60);if(limited)return limited;if(!authorize(req))return safeError("unauthorized",401);try{const body=await req.json(),policy=AgentPolicySchema.parse(body.policy),requirements=PaymentRequirementsSchema.parse(body.paymentRequirements),usage={daily:String(body.usage?.daily||"0"),monthly:String(body.usage?.monthly||"0")};return NextResponse.json(evaluatePolicy(policy,requirements,usage))}catch(e){return safeError(e instanceof Error?e.message:"invalid_request")}}
