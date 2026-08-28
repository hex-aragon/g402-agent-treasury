import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {authorize,rateLimit,safeError} from "@/lib/http";
import {appendAudit} from "@/lib/store";
import {getServiceBudget,upsertServiceBudget} from "@/packages/akash/src/store";
const Amount=z.string().regex(/^\d+$/),Input=z.object({agentId:z.string().uuid(),service:z.enum(["akash-inference","akash-deployment","filecoin-storage","filecoin-retrieval","filecoin-search"]),perRequest:Amount,daily:Amount,monthly:Amount,enabled:z.boolean().default(true)}).strict();
export async function GET(req:NextRequest){if(!authorize(req))return safeError("unauthorized",401);const url=new URL(req.url),agentId=url.searchParams.get("agentId"),service=url.searchParams.get("service");if(!agentId||!service)return safeError("agentId_and_service_required");return NextResponse.json({budget:await getServiceBudget(agentId,service)},{headers:{"cache-control":"no-store"}})}
export async function PUT(req:NextRequest){const limited=await rateLimit(req,20);if(limited)return limited;if(!authorize(req))return safeError("unauthorized",401);try{const input=Input.parse(await req.json()),{enabled,...budget}=input;await upsertServiceBudget(budget,enabled);await appendAudit("api","service_budget.upserted",`${input.agentId}:${input.service}`,{enabled});return NextResponse.json({ok:true,budget:input})}catch(e){return safeError(e instanceof Error?e.message:"invalid_request")}}
