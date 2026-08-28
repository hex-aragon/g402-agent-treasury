import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {paymentRequiredHeader} from "@/lib/challenge";
import {rateLimit,safeError} from "@/lib/http";
import {DeploymentRequestSchema} from "@/packages/akash/src/domain";
import {executeDeployment,offerDeployment} from "@/packages/akash/src/deployment";
const Agent=z.string().uuid();export const dynamic="force-dynamic";
export async function POST(req:NextRequest){const limited=await rateLimit(req,10);if(limited)return limited;try{const request=DeploymentRequestSchema.parse(await req.json()),rawAgent=req.headers.get("x-agent-id"),agentId=rawAgent?Agent.parse(rawAgent):undefined,quoteId=req.headers.get("x-akash-quote-id"),paymentId=req.headers.get("x-payment-id"),idempotencyKey=req.headers.get("idempotency-key");if(!quoteId&&!paymentId){const offer=await offerDeployment(request,`${process.env.APP_URL||new URL(req.url).origin}/api/akash/v1/deployments`,agentId);return NextResponse.json({error:"payment_required",...offer},{status:402,headers:{"payment-required":paymentRequiredHeader(offer.challenge),"cache-control":"no-store"}})}if(!quoteId||!paymentId||!idempotencyKey)throw new Error("payment_headers_incomplete");return NextResponse.json(await executeDeployment({request,quoteId,paymentId,idempotencyKey,agentId}),{status:201})}catch(e){const message=e instanceof Error?e.message:"invalid_request",status=message.includes("payment")||message.includes("budget")?402:message.includes("locked")?503:400;return safeError(message,status)}}
