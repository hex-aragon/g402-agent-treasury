import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {Address} from "@/lib/domain";
import {authorizeAdmin,rateLimit,safeError} from "@/lib/http";
import {appendAudit,listAgents,upsertAgent} from "@/lib/store";
const Input=z.object({id:z.string().uuid(),name:z.string().min(2).max(120),walletAddress:Address,status:z.enum(["active","suspended"]).default("active")}).strict();
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!authorizeAdmin(req))return safeError("unauthorized",401);return NextResponse.json({agents:await listAgents()},{headers:{"cache-control":"no-store"}})}
export async function PUT(req:NextRequest){const limited=await rateLimit(req,20);if(limited)return limited;if(!authorizeAdmin(req))return safeError("unauthorized",401);try{const input=Input.parse(await req.json()),agent={...input,createdAt:new Date().toISOString()};await upsertAgent(agent);await appendAudit("api","agent.upserted",agent.id,{status:agent.status});return NextResponse.json({ok:true,agent})}catch(e){return safeError(e instanceof Error?e.message:"invalid_request")}}
