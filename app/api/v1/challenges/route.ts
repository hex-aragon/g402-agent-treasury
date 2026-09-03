import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { createGnoChallenge,paymentRequiredHeader } from "@/lib/challenge";
import { Address,isKnownGnoTestnet } from "@/lib/domain";
import { authorize,authorizeAdmin,rateLimit,safeError } from "@/lib/http";

const RequestSchema=z.object({resource:z.string().url().max(2048),method:z.enum(["GET","POST","PUT","PATCH","DELETE"]).default("GET"),amount:z.string().regex(/^[1-9][0-9]*$/).max(40).optional(),description:z.string().max(280).optional(),payTo:Address.optional()}).strict();
export async function POST(req:NextRequest){const limited=await rateLimit(req,30);if(limited)return limited;if(!authorize(req))return safeError("unauthorized",401);const network=process.env.GNO_NETWORK_ID||"gno:pearl-1",chain=process.env.GNO_CHAIN_ID||"pearl-1";if(!isKnownGnoTestnet(network,chain)&&!authorizeAdmin(req))return safeError("mainnet_requires_operator_authorization",403);try{const body=RequestSchema.parse(await req.json()),requirements=await createGnoChallenge(body.resource,body.method,{amount:body.amount,description:body.description,payTo:body.payTo});return NextResponse.json({x402Version:2,paymentRequirements:requirements},{status:201,headers:{"payment-required":paymentRequiredHeader(requirements),"cache-control":"no-store"}})}catch(error){return safeError(error instanceof Error?error.message:"invalid_request")}}
