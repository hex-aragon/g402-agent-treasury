import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {paymentRequiredHeader} from "@/lib/challenge";
import {rateLimit,safeError} from "@/lib/http";
import {SearchSchema} from "@/packages/filecoin/src/domain";
import {executeSearch,offerSearch} from "@/packages/filecoin/src/gateway";
const Agent=z.string().uuid();export const dynamic="force-dynamic";
export async function POST(req:NextRequest){const limited=await rateLimit(req,30);if(limited)return limited;try{const request=SearchSchema.parse(await req.json()),rawAgent=req.headers.get("x-agent-id"),agentId=rawAgent?Agent.parse(rawAgent):undefined,quoteId=req.headers.get("x-storage-quote-id"),paymentId=req.headers.get("x-payment-id"),requestId=req.headers.get("idempotency-key");if(!quoteId&&!paymentId){const offer=await offerSearch(request,`${process.env.APP_URL||new URL(req.url).origin}/api/storage/v1/search`,agentId);return NextResponse.json({error:"payment_required",...offer},{status:402,headers:{"payment-required":paymentRequiredHeader(offer.challenge),"cache-control":"no-store"}})}if(!quoteId||!paymentId||!requestId)throw new Error("payment_headers_incomplete");return NextResponse.json(await executeSearch({request,quoteId,paymentId,requestId,agentId}),{headers:{"cache-control":"private, no-store"}})}catch(e){const message=e instanceof Error?e.message:"invalid_request";return safeError(message,message.includes("payment")||message.includes("budget")?402:400)}}
