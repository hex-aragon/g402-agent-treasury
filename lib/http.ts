import { NextRequest, NextResponse } from "next/server";
import { constantTimeApiKeyMatch } from "./domain";
import { consumeRateLimit } from "./rate-limit";
export function clientIp(req:NextRequest){return req.headers.get("x-forwarded-for")?.split(",")[0].trim()||"unknown"}
export async function rateLimit(req:NextRequest,limit=60,windowMs=60_000){const result=await consumeRateLimit(`http:${clientIp(req)}:${new URL(req.url).pathname}`,limit,windowMs);if(!result.allowed)return NextResponse.json({error:"rate_limited"},{status:429,headers:{"retry-after":String(Math.ceil((result.resetAt-Date.now())/1000)),"x-ratelimit-remaining":"0"}});return null}
export function authorize(req:NextRequest){if(process.env.FACILITATOR_PUBLIC==="true")return true;const configured=(process.env.FACILITATOR_API_KEYS||"").split(",").map(x=>x.trim()).filter(Boolean);if(!configured.length&&process.env.NODE_ENV!=="production")return true;const value=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";return value.length>0&&constantTimeApiKeyMatch(value,configured)}
export function authorizeAdmin(req:NextRequest){if(req.headers.get("oai-authenticated-user-email"))return true;const configured=(process.env.FACILITATOR_API_KEYS||"").split(",").map(x=>x.trim()).filter(Boolean),value=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";return value.length>0&&constantTimeApiKeyMatch(value,configured)}
export function safeError(message:string,status=400){return NextResponse.json({error:message},{status})}
